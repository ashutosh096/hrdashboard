import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabase-admin.js';

function getResendClient() {
  const currentResendKey = process.env.RESEND_API_KEY;
  return currentResendKey && !currentResendKey.includes('your_resend_key') && !currentResendKey.includes('123456789')
    ? new Resend(currentResendKey)
    : null;
}

async function attemptSupabaseInviteSend(toEmail: string, name: string, inviteLink: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(toEmail, {
      redirectTo: encodeURI(inviteLink),
      data: { name },
    });
    if (error) {
      console.warn('[SUPABASE INVITE FAILED]:', error.message);
      return { sent: false, provider: 'SUPABASE', error: error.message };
    }
    console.log('[SUPABASE INVITE SENT] to', toEmail);
    return { sent: true, provider: 'SUPABASE', data };
  } catch (err: any) {
    console.error('[SUPABASE INVITE FAILED]:', err?.message || err);
    return { sent: false, provider: 'SUPABASE', error: err?.message || String(err) };
  }
}

async function attemptSmtpSend(
  toEmail: string,
  htmlContent: string,
  subject: string = 'You have been invited to EHM-Climagro OS — Accept Invite'
) {
  const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER || process.env.MAIL_USER || '';
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.MAIL_PASS || '';

  const smtpUser = rawUser.trim();
  const smtpPass = rawPass.trim().replace(/\s+/g, ''); // strip any spaces from app password

  if (!smtpUser || !smtpPass) {
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const customPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;

  const configs = customPort
    ? [{ port: customPort, secure: customPort === 465 }]
    : [
        { port: 465, secure: true },
        { port: 587, secure: false, requireTLS: true },
      ];

  let lastError = '';

  for (const cfg of configs) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: cfg.port,
        secure: cfg.secure,
        requireTLS: (cfg as any).requireTLS,
        family: 4,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      } as any);

      const info = await transporter.sendMail({
        from: `EHM-Climagro OS <${smtpUser}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });

      console.log(`[SMTP EMAIL DELIVERED on port ${cfg.port}]: Message ID ${info.messageId}`);
      return { sent: true, provider: 'SMTP', messageId: info.messageId, port: cfg.port };
    } catch (err: any) {
      console.warn(`[SMTP Port ${cfg.port} notice]:`, err?.message || err);
      lastError = err?.message || String(err);
    }
  }

  return { sent: false, provider: 'SMTP', error: lastError };
}

export async function sendInviteEmail(toEmail: string, inviteToken: string, name: string) {
  const appUrl = process.env.APP_URL && !process.env.APP_URL.includes('localhost')
    ? process.env.APP_URL
    : 'https://hrdashboard-3s1m.onrender.com';
  const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

  console.log(`\n======================================================`);
  console.log(`[INVITATION EMAIL ATTEMPT] To: ${toEmail} (${name})`);
  console.log(`[INVITATION LINK]: ${inviteLink}`);
  console.log(`======================================================\n`);

  // Priority 1: Supabase Auth Admin Invite Email
  const supabaseResult = await attemptSupabaseInviteSend(toEmail, name, inviteLink);
  if (supabaseResult && supabaseResult.sent) {
    return supabaseResult;
  }
  console.warn('[SUPABASE INVITE FAILED, FALLING BACK TO SMTP/RESEND]:', supabaseResult?.error);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #ffffff;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #10B981;">EHM-Climagro OS</span>
      </div>
      <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 700;">You have been invited to create a user account</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">You have been invited to create a user account on <a href="${appUrl}" style="color: #10B981; text-decoration: underline; font-weight: 600;">${appUrl}</a>.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">Follow this link to accept the invite and set up your password:</p>
      <div style="margin: 28px 0;">
        <a href="${inviteLink}" style="background-color: #10B981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">Accept the invite</a>
      </div>
      <p style="color: #6B7280; font-size: 13px; line-height: 1.5; border-top: 1px solid #F3F4F6; padding-top: 20px; margin-top: 28px;">
        You're receiving this email because an invitation was sent to set up your account on EHM-Climagro OS.<br/>
        Or copy and paste this direct link: <a href="${inviteLink}" style="color: #10B981;">${inviteLink}</a>
      </p>
    </div>
  `;

  // Priority 2: Fast Dual-Port SMTP (Gmail / Custom SMTP) if configured
  const smtpResult = await attemptSmtpSend(toEmail, htmlContent, 'You have been invited to EHM-Climagro OS — Accept Invite');
  if (smtpResult) {
    if (smtpResult.sent) return smtpResult;
    console.warn('[SMTP DELIVERY FAILED, FALLING BACK TO RESEND/NOTICE]:', smtpResult.error);
  }

  // Priority 3: Resend API if configured
  const currentResendKey = process.env.RESEND_API_KEY;
  const resendClient = currentResendKey && !currentResendKey.includes('your_resend_key') && !currentResendKey.includes('123456789')
    ? new Resend(currentResendKey)
    : null;

  if (resendClient) {
    try {
      const emailResult = await resendClient.emails.send({
        from: 'EHM-Climagro OS <onboarding@resend.dev>',
        to: toEmail,
        subject: 'You have been invited to EHM-Climagro OS — Accept Invite',
        html: htmlContent,
      });
      if (emailResult.error) {
        console.error('[RESEND EMAIL API ERROR]:', emailResult.error);
        return { sent: false, provider: 'Resend', error: emailResult.error.message };
      }
      console.log(`[RESEND DELIVERED]: Email ID ${emailResult.data?.id}`);
      return { sent: true, provider: 'Resend', id: emailResult.data?.id };
    } catch (err: any) {
      console.error('[EMAIL SERVICE RESEND ERROR]:', err?.message || err);
      return { sent: false, provider: 'Resend', error: err?.message || String(err) };
    }
  }

  console.log('[EMAIL SERVICE NOTICE] Neither SMTP nor Resend API Key is configured. Invite link printed above.');
  return { sent: false, provider: 'None', error: 'No email service credentials (SMTP_USER/SMTP_PASS or RESEND_API_KEY) found in server environment.' };
}

export async function sendPasswordResetOtpEmail(toEmail: string, otp: string, name: string = 'User') {
  console.log(`\n======================================================`);
  console.log(`[PASSWORD RESET OTP ATTEMPT] To: ${toEmail} (${name})`);
  console.log(`[OTP CODE]: ${otp} (Valid for 10 minutes)`);
  console.log(`======================================================\n`);

  const subject = `Your EHM-Climagro OS Password Reset Code: ${otp}`;
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #ffffff;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #10B981;">EHM-Climagro OS</span>
      </div>
      <h2 style="color: #111827; margin-top: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">Password Reset Verification Code</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">We received a request to reset your password for your EHM-Climagro OS account. Use the 6-digit verification code below to complete the reset process:</p>
      
      <div style="margin: 28px 0; text-align: center; background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px; padding: 24px;">
        <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #166534; margin-bottom: 8px;">One-Time Verification Code</span>
        <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #047857; line-height: 1.2;">
          ${otp}
        </div>
        <span style="display: block; font-size: 13px; color: #15803D; margin-top: 8px; font-weight: 500;">⏱️ This code will expire in 10 minutes</span>
      </div>

      <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
        Enter this code into the password reset window in your browser to choose a new password. For security reasons, do not share this code with anyone.
      </p>

      <div style="border-top: 1px solid #F3F4F6; padding-top: 20px; margin-top: 28px;">
        <p style="color: #9CA3AF; font-size: 13px; line-height: 1.5; margin: 0;">
          If you did not request a password reset, you can safely ignore this email. Your existing password will remain active and unchanged.
        </p>
      </div>
    </div>
  `;

  // Priority 1: Fast Dual-Port SMTP using the exact same configured transporter
  const smtpResult = await attemptSmtpSend(toEmail, htmlContent, subject);
  if (smtpResult) {
    if (smtpResult.sent) return smtpResult;
    console.warn('[SMTP OTP DELIVERY FAILED, FALLING BACK TO RESEND/NOTICE]:', smtpResult.error);
  }

  // Priority 2: Resend API if configured
  const currentResendKey = process.env.RESEND_API_KEY;
  const resendClient = currentResendKey && !currentResendKey.includes('your_resend_key') && !currentResendKey.includes('123456789')
    ? new Resend(currentResendKey)
    : null;

  if (resendClient) {
    try {
      const emailResult = await resendClient.emails.send({
        from: 'EHM-Climagro OS <onboarding@resend.dev>',
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });
      if (emailResult.error) {
        console.error('[RESEND OTP EMAIL API ERROR]:', emailResult.error);
        return { sent: false, provider: 'Resend', error: emailResult.error.message };
      }
      console.log(`[RESEND OTP DELIVERED]: Email ID ${emailResult.data?.id}`);
      return { sent: true, provider: 'Resend', id: emailResult.data?.id };
    } catch (err: any) {
      console.error('[EMAIL SERVICE RESEND OTP ERROR]:', err?.message || err);
      return { sent: false, provider: 'Resend', error: err?.message || String(err) };
    }
  }

  console.log('[EMAIL SERVICE NOTICE] Neither SMTP nor Resend API Key is configured. OTP code printed above.');
  return { sent: false, provider: 'None', error: 'No email service credentials (SMTP_USER/SMTP_PASS or RESEND_API_KEY) found in server environment.' };
}

export async function sendDigestEmail(toEmail: string, name: string, dueTasksCount: number) {
  console.log(`[EMAIL SERVICE] Sending daily digest to ${toEmail}: ${dueTasksCount} tasks due.`);
  const resend = getResendClient();
  if (resend && dueTasksCount > 0) {
    try {
      await resend.emails.send({
        from: 'HROS <onboarding@resend.dev>',
        to: toEmail,
        subject: `HROS Daily Digest — ${dueTasksCount} tasks due this week`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h3 style="color: #10B981;">Hello ${name},</h3>
            <p>You have <strong>${dueTasksCount} task(s)</strong> due in your active sprint this week.</p>
            <p>Log in to your HROS dashboard to view and manage your deliverables.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('[EMAIL SERVICE] Digest email error:', err);
    }
  }
}

export async function sendTaskAssignedEmail(
  toEmail: string,
  assigneeName: string,
  taskCode: string,
  taskTitle: string,
  dueDate: string
) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  console.log(`[EMAIL SERVICE] Sending task assignment email to ${toEmail} for task ${taskCode}`);

  const resend = getResendClient();
  if (resend) {
    try {
      await resend.emails.send({
        from: 'HROS <onboarding@resend.dev>',
        to: toEmail,
        subject: `New Task Assigned: [${taskCode}] ${taskTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
            <h3 style="color: #10B981;">New Task Assigned</h3>
            <p>Hello <strong>${assigneeName}</strong>,</p>
            <p>A new sprint task has been assigned to you in HROS:</p>
            <div style="background-color: #F3F4F6; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Task ID:</strong> ${taskCode}</p>
              <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${taskTitle}</p>
              <p style="margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            <a href="${appUrl}/tasks" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">View Task in HROS</a>
          </div>
        `,
      });
    } catch (err) {
      console.error('[EMAIL SERVICE] Task assigned email error:', err);
    }
  }
}

export async function sendDelayRequestEmail(
  toEmail: string,
  managerName: string,
  taskCode: string,
  taskTitle: string,
  requesterName: string
) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  console.log(`[EMAIL SERVICE] Sending delay extension request email to ${toEmail} for task ${taskCode}`);

  const resend = getResendClient();
  if (resend) {
    try {
      await resend.emails.send({
        from: 'HROS <onboarding@resend.dev>',
        to: toEmail,
        subject: `Delay Extension Request: [${taskCode}] ${taskTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
            <h3 style="color: #EF4444;">Delay Extension Requested</h3>
            <p>Hello <strong>${managerName}</strong>,</p>
            <p>Employee <strong>${requesterName}</strong> has submitted a deadline extension request for task <strong>[${taskCode}] ${taskTitle}</strong>.</p>
            <a href="${appUrl}/tasks" style="background-color: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 12px;">Review Request in HROS</a>
          </div>
        `,
      });
    } catch (err) {
      console.error('[EMAIL SERVICE] Delay request email error:', err);
    }
  }
}

export async function sendOverdueTaskAlertEmail(
  toEmail: string,
  managerName: string,
  taskCode: string,
  taskTitle: string,
  assigneeName: string,
  daysOverdue: number
) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  console.log(`[EMAIL SERVICE] Sending overdue task alert email to ${toEmail} for task ${taskCode}`);

  const resend = getResendClient();
  if (resend) {
    try {
      await resend.emails.send({
        from: 'HROS <onboarding@resend.dev>',
        to: toEmail,
        subject: `Overdue Task Alert: [${taskCode}] ${taskTitle} (${daysOverdue} days late)`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EF4444; border-radius: 8px;">
            <h3 style="color: #DC2626;">Overdue Task Notice</h3>
            <p>Hello <strong>${managerName}</strong>,</p>
            <p>Task <strong>[${taskCode}] ${taskTitle}</strong> assigned to <strong>${assigneeName}</strong> is now <strong>${daysOverdue} day(s) overdue</strong>.</p>
            <a href="${appUrl}/tasks" style="background-color: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 12px;">Manage Task in HROS</a>
          </div>
        `,
      });
    } catch (err) {
      console.error('[EMAIL SERVICE] Overdue task email error:', err);
    }
  }
}

export async function sendCalendarReconnectEmail(toEmail: string, userName: string) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  console.log(`[EMAIL SERVICE] Sending Google Calendar token reconnect email to ${toEmail}`);

  const resend = getResendClient();
  if (resend) {
    try {
      await resend.emails.send({
        from: 'HROS <onboarding@resend.dev>',
        to: toEmail,
        subject: `Action Required: Reconnect Google Calendar Sync`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #3B82F6; border-radius: 8px;">
            <h3 style="color: #2563EB;">Google Calendar Token Expiring Soon</h3>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Your Google Calendar OAuth integration token will expire within 24 hours.</p>
            <p>Please log in to HROS and reconnect your calendar in Settings to ensure two-way sync remains uninterrupted.</p>
            <a href="${appUrl}/settings" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 12px;">Reconnect Google Calendar</a>
          </div>
        `,
      });
    } catch (err) {
      console.error('[EMAIL SERVICE] Reconnect email error:', err);
    }
  }
}
