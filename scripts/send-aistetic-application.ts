import { sendGmailMessage } from "../src/lib/email/gmail";

export async function sendAisteticApplication() {
  const recipient = "team@aistetic.com";
  const ccRecipient = "careers@aistetic.com";
  
  const subject = "Application: Junior Full Stack Engineer (Part-Time) — Samarth Nimangre";
  
  const textBody = `Dear Aistetic Hiring Team,

I am writing to express my interest in the Junior Full Stack Engineer (Part-Time) position at Aistetic.

Your focus on computer vision and seamless 3D measurement workflows requires a digital experience that feels frictionless and dependable. The part-time structure (2 days/week) aligns with my goal of delivering focused, high-impact engineering—resolving product edge cases, polishing UI components, and supporting your customer-facing flows with high care and zero fluff.

What I bring to Aistetic:
• Frontend & Full-Stack Craft: Hands-on experience building clean, responsive interfaces with React, Next.js, TypeScript, and modern CSS/Tailwind.
• Rapid Debugging & Resolution: Comfortable isolating frontend bugs, handling unexpected API states, and turning user-reported issues into stable, tested fixes.
• Independent Execution: Self-directed, comfortable working asynchronously, and respectful of team code standards and Git workflows.

You can inspect my live work and code here:
• Live Portfolio: https://sam-codes.vercel.app
• GitHub: https://github.com/Samarth1306w

I would welcome the opportunity to help keep Aistetic's web platform running smoothly and bug-free.

Thank you for your time and consideration.

Warm regards,

Samarth Nimangre
Email: samarthknimangre@gmail.com
Portfolio: https://sam-codes.vercel.app
GitHub: https://github.com/Samarth1306w
Telegram: @Samarth1306
`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; color: #1f2937; line-height: 1.65; font-size: 15px;">
      <p style="margin-top: 0;">Dear Aistetic Hiring Team,</p>
      
      <p>I am writing to express my interest in the <strong>Junior Full Stack Engineer (Part-Time)</strong> position at Aistetic.</p>
      
      <p>Your focus on computer vision and seamless 3D measurement workflows requires a digital experience that feels frictionless and dependable. The part-time structure aligns with my goal of delivering focused, high-impact engineering—resolving product edge cases, polishing UI components, and supporting your customer-facing flows with high care and zero fluff.</p>
      
      <p style="font-weight: 600; margin-bottom: 8px; color: #111827;">What I bring to Aistetic:</p>
      <ul style="padding-left: 20px; margin-top: 0;">
        <li style="margin-bottom: 8px;"><strong>Frontend & Full-Stack Craft:</strong> Hands-on experience building clean, responsive interfaces with React, Next.js, TypeScript, and modern CSS/Tailwind.</li>
        <li style="margin-bottom: 8px;"><strong>Rapid Debugging & Resolution:</strong> Comfortable isolating frontend bugs, handling unexpected API states, and turning user-reported issues into stable, tested fixes.</li>
        <li style="margin-bottom: 8px;"><strong>Independent Execution:</strong> Self-directed, comfortable working asynchronously, and respectful of team code standards and Git workflows.</li>
      </ul>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #374151;">You can inspect my live work and code here:</p>
        <p style="margin: 0; font-size: 14px;">
          🌐 <strong>Live Portfolio:</strong> <a href="https://sam-codes.vercel.app" style="color: #2563eb; text-decoration: underline;">https://sam-codes.vercel.app</a><br/>
          💻 <strong>GitHub:</strong> <a href="https://github.com/Samarth1306w" style="color: #2563eb; text-decoration: underline;">https://github.com/Samarth1306w</a>
        </p>
      </div>
      
      <p>I would welcome the opportunity to help keep Aistetic's web platform running smoothly and bug-free.</p>
      
      <p>Thank you for your time and consideration.</p>
      
      <p style="margin-bottom: 0;">
        Warm regards,<br/><br/>
        <strong>Samarth Nimangre</strong><br/>
        <span style="color: #4b5563; font-size: 14px;">
          Email: <a href="mailto:samarthknimangre@gmail.com" style="color: #2563eb;">samarthknimangre@gmail.com</a><br/>
          Portfolio: <a href="https://sam-codes.vercel.app" style="color: #2563eb;">https://sam-codes.vercel.app</a><br/>
          GitHub: <a href="https://github.com/Samarth1306w" style="color: #2563eb;">https://github.com/Samarth1306w</a><br/>
          Telegram: @Samarth1306
        </span>
      </p>
    </div>
  `;

  return sendGmailMessage({
    to: recipient,
    cc: ccRecipient,
    subject,
    text: textBody,
    html: htmlBody,
    replyTo: "samarthknimangre@gmail.com",
  });
}

if (process.argv[1] && process.argv[1].endsWith("send-aistetic-application.ts")) {
  sendAisteticApplication().then((res) => {
    console.log("Result:", res);
  }).catch(console.error);
}
