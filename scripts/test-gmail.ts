import { verifyGmailConnection, sendGmailMessage } from "../src/lib/email/gmail";

async function main() {
  console.log("==================================================");
  console.log("🔍 Testing Gmail SMTP Connection for SAM CODES...");
  console.log(`User: ${process.env.GMAIL_USER || "samarthknimangre@gmail.com"}`);
  console.log("==================================================");

  // 1. Verify credentials with Google SMTP
  console.log("Step 1: Verifying credentials with smtp.gmail.com:465...");
  const verifyResult = await verifyGmailConnection();

  if (!verifyResult.valid) {
    console.error("❌ Gmail SMTP Verification Failed!");
    console.error("Error:", verifyResult.error);
    process.exit(1);
  }

  console.log("✅ Credentials verified successfully with Google SMTP server!");

  // 2. Dispatch test confirmation email
  const recipient = process.env.GMAIL_USER || "samarthknimangre@gmail.com";
  console.log(`Step 2: Dispatching test confirmation email to ${recipient}...`);

  const sendResult = await sendGmailMessage({
    to: recipient,
    subject: "⚡ SAM CODES Gmail Connection Active",
    html: `
      <div style="font-family: sans-serif; background: #060606; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #1f2937;">
        <h2 style="color: #38bdf8; margin-top: 0;">🚀 Gmail Integration Verified</h2>
        <p style="color: #9ca3af; font-size: 14px;">Your Gmail account (<strong>${recipient}</strong>) is now successfully connected to your SAM CODES command center.</p>
        <div style="background: #111827; padding: 12px 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #374151;">
          <p style="margin: 0; font-size: 13px; color: #10b981;">✔ SMTP Server: smtp.gmail.com:465 (SSL)</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #10b981;">✔ App Password Authenticated</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #10b981;">✔ 2-Way Client Pitch & Follow-up Capability: READY</p>
        </div>
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">Timestamp: ${new Date().toISOString()}</p>
      </div>
    `,
    text: `SAM CODES Gmail Integration Verified! Your account (${recipient}) is connected to the SAM CODES command center.`,
  });

  if (!sendResult.success) {
    console.error("❌ Failed to send confirmation email!");
    console.error("Error:", sendResult.error);
    process.exit(1);
  }

  console.log(`✅ Test email successfully dispatched! (Message ID: ${sendResult.messageId})`);
  console.log("==================================================");
  console.log("🎉 Gmail account is 100% connected and verified!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
