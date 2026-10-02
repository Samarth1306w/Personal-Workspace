import { Resend } from "resend";

export interface SendInquiryNotificationParams {
  inquiryId: string;
  name: string;
  email?: string;
  serviceRequested: string;
  message: string;
  contactMethod?: string;
  ip?: string;
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Sends a real-time notification email directly to Samarth's inbox
 * when a client submits an inquiry through the portfolio website.
 */
export async function sendInquiryEmailNotification(
  params: SendInquiryNotificationParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[Resend Email] RESEND_API_KEY is not configured. Skipping email dispatch.");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const recipient = process.env.ADMIN_NOTIFY_EMAIL || "samarthknimangre@gmail.com";
    const sender = process.env.RESEND_FROM_EMAIL || "SAM CODES Client Intake <onboarding@resend.dev>";
    const clientEmail = params.email && params.email.includes("@") ? params.email.trim() : undefined;

    const emailSubject = `⚡ New Project Inquiry: ${params.name} (${params.serviceRequested})`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #04060c; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background: #090d1a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 24px; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
            .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
            .content { padding: 24px; }
            .field { margin-bottom: 20px; }
            .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-family: monospace; font-weight: 600; margin-bottom: 4px; }
            .field-value { font-size: 15px; color: #ffffff; font-weight: 500; }
            .message-box { background: #030712; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; }
            .action-bar { margin-top: 28px; padding-top: 20px; border-top: 1px solid #1e293b; display: flex; gap: 12px; }
            .button { display: inline-block; padding: 12px 20px; background: #38bdf8; color: #020617; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 13px; }
            .footer { padding: 16px 24px; background: #030712; font-size: 11px; color: #64748b; font-family: monospace; text-align: center; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ New Client Project Inquiry</h1>
              <p>Submitted via SAM CODES Portfolio (sam-codes.vercel.app)</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">CLIENT NAME</div>
                <div class="field-value">${escapeHtml(params.name)}</div>
              </div>

              <div class="field">
                <div class="field-label">CLIENT EMAIL / CONTACT</div>
                <div class="field-value">
                  ${clientEmail ? `<a href="mailto:${clientEmail}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(clientEmail)}</a>` : "Not provided"}
                </div>
              </div>

              <div class="field">
                <div class="field-label">SERVICE / TOPIC REQUESTED</div>
                <div class="field-value">${escapeHtml(params.serviceRequested)}</div>
              </div>

              <div class="field">
                <div class="field-label">PROJECT BRIEF & DETAILS</div>
                <div class="message-box">${escapeHtml(params.message)}</div>
              </div>

              <div class="action-bar">
                ${clientEmail ? `<a href="mailto:${clientEmail}?subject=${encodeURIComponent(`Regarding your project inquiry — SAM CODES`)}" class="button">Reply to ${escapeHtml(params.name)}</a>` : ""}
              </div>
            </div>
            <div class="footer">
              SAM CODES Command Center • Inquiry ID: ${escapeHtml(params.inquiryId)} • Timestamp: ${new Date().toISOString()}
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: sender,
      to: [recipient],
      ...(clientEmail ? { replyTo: clientEmail } : {}),
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error("[Resend Email Error]:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend Email] Successfully dispatched inquiry notification email (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Resend Email Exception]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
