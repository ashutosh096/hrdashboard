import { Resend } from 'resend';
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
export async function sendInviteEmail(toEmail, inviteToken, name) {
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;
    console.log(`[EMAIL SERVICE] Sending invite email to ${toEmail} with link: ${inviteLink}`);
    if (resend) {
        try {
            await resend.emails.send({
                from: 'HROS Onboarding <no-reply@hros.internal>',
                to: toEmail,
                subject: 'Welcome to HROS — Complete Your Account Setup',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10B981;">Welcome to HROS, ${name}!</h2>
            <p>You have been invited to join the Human Resource Operating System.</p>
            <p>Please click the button below to set your password and optionally link your Google Calendar:</p>
            <a href="${inviteLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Accept Invite & Set Up Account</a>
            <p style="color: #6B7280; font-size: 14px;">This invite link will expire in 7 days.</p>
          </div>
        `,
            });
        }
        catch (err) {
            console.error('[EMAIL SERVICE] Resend error:', err);
        }
    }
}
export async function sendDigestEmail(toEmail, name, dueTasksCount) {
    console.log(`[EMAIL SERVICE] Sending daily digest to ${toEmail}: ${dueTasksCount} tasks due.`);
    if (resend && dueTasksCount > 0) {
        try {
            await resend.emails.send({
                from: 'HROS Digest <notifications@hros.internal>',
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
        }
        catch (err) {
            console.error('[EMAIL SERVICE] Digest email error:', err);
        }
    }
}
