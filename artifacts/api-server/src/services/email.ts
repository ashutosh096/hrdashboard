import { Resend } from 'resend';
import nodemailer from 'nodemailer';

function getResendClient() {
  const currentResendKey = process.env.RESEND_API_KEY;
  return currentResendKey && !currentResendKey.includes('your_resend_key') && !currentResendKey.includes('123456789')
    ? new Resend(currentResendKey)
    : null;
}

function getSmtpTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

  const smtpUser = rawUser.trim();
  const smtpPass = rawPass.trim().replace(/\s+/g, ''); // strip any spaces from app password

  if (!smtpUser || !smtpPass) {
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    }),
    senderEmail: smtpUser,
  };
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

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">You have been invited to create a user account</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">You have been invited to create a user account on <a href="${appUrl}" style="color: #10B981; text-decoration: underline; font-weight: bold;">${appUrl}</a>.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">Follow this link to accept the invite:</p>
      <div style="margin: 24px 0;">
        <a href="${inviteLink}" style="background-color: #10B981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">Accept the invite</a>
      </div>
      <p style="color: #6B7280; font-size: 13px; line-height: 1.4; border-top: 1px solid #F3F4F6; padding-top: 16px; margin-top: 24px;">
        You're receiving this email because an invitation was sent to set up your account on EHM-Climagro OS.<br/>
        Or copy and paste this direct link: <a href="${inviteLink}" style="color: #10B981;">${inviteLink}</a>
      </p>
    </div>
  `;

  // Priority 1: SMTP Transporter (Gmail / Custom SMTP) if configured
  const smtpObj = getSmtpTransporter();
  if (smtpObj) {
    try {
      const info = await smtpObj.transporter.sendMail({
        from: `EHM-Climagro OS <${smtpObj.senderEmail}>`,
        to: toEmail,
        subject: 'You have been invited to EHM-Climagro OS — Accept Invite',
        html: htmlContent,
      });
      console.log(`[SMTP EMAIL DELIVERED]: Message ID ${info.messageId}`);
      return { sent: true, provider: 'SMTP', messageId: info.messageId };
    } catch (err: any) {
      console.error('[SMTP EMAIL ERROR]:', err?.message || err);
      return { sent: false, provider: 'SMTP', error: err?.message || String(err) };
    }
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
