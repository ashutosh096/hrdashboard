import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && !resendApiKey.includes('your_resend_key') && !resendApiKey.includes('123456789') ? new Resend(resendApiKey) : null;

export async function sendInviteEmail(toEmail: string, inviteToken: string, name: string) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

  console.log(`\n======================================================`);
  console.log(`[INVITATION EMAIL SENT] To: ${toEmail} (${name})`);
  console.log(`[INVITATION LINK]: ${inviteLink}`);
  console.log(`======================================================\n`);

  if (resend) {
    try {
      const emailResult = await resend.emails.send({
        from: 'HROS <onboarding@resend.dev>',
        to: toEmail,
        subject: 'Welcome to HROS — Complete Your Account Setup',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
            <h2 style="color: #10B981; margin-top: 0;">Welcome to HROS, ${name}!</h2>
            <p>You have been invited to join the Human Resource Operating System.</p>
            <p>Please click the button below to set your password and optionally link your Google Calendar:</p>
            <a href="${inviteLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; font-weight: bold;">Accept Invite & Set Up Account</a>
            <p style="color: #6B7280; font-size: 14px;">This invite link will expire in 7 days.</p>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">Or copy and paste this link in your browser: ${inviteLink}</p>
          </div>
        `,
      });
      console.log(`[RESEND DELIVERED]: Email ID ${emailResult.data?.id}`);
    } catch (err: any) {
      console.error('[EMAIL SERVICE RESEND ERROR]:', err?.message || err);
    }
  } else {
    console.log('[EMAIL SERVICE NOTICE] Resend API Key is missing or default. Invite link printed above.');
  }
}

export async function sendDigestEmail(toEmail: string, name: string, dueTasksCount: number) {
  console.log(`[EMAIL SERVICE] Sending daily digest to ${toEmail}: ${dueTasksCount} tasks due.`);
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
