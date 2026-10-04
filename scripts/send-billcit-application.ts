import { sendGmailMessage } from "../src/lib/email/gmail";

export async function sendBillcitApplication() {
  const recipient = "nirmalsurani@gmail.com";
  
  const subject = "Application: Full Stack Developer (Next.js / TypeScript) — Samarth Nimangre";
  
  const textBody = `Hi Nirmal,

I came across your opening for the Full Stack Developer role for Billcit and wanted to reach out.

I am a Full Stack Developer specializing in React, Next.js, TypeScript, and modern responsive design. As someone who builds web applications daily, I understand the importance of making billing and invoicing apps fast, reliable, and dead simple for users.

What I can help you with on Billcit right away:
• Modern Next.js & React: Building clean UI components, invoices, reports, and responsive client dashboards with Tailwind CSS.
• TypeScript & APIs: Writing strictly-typed REST API routes, integrating databases (PostgreSQL/Supabase/MongoDB), and handling state predictably.
• Fast Execution: Low-ego, quick to learn your codebase, and able to pick up tasks and ship clean code without needing constant hand-holding.

You can inspect my live portfolio and GitHub here:
• Live Portfolio: https://sam-codes.vercel.app
• GitHub: https://github.com/Samarth1306w

I would love to learn more about the roadmap for Billcit and how I can help you build and scale it.

Best regards,

Samarth Nimangre
Email: samarthknimangre@gmail.com
Location: Remote, India
Portfolio: https://sam-codes.vercel.app
GitHub: https://github.com/Samarth1306w
Telegram: @Samarth1306
`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; color: #1f2937; line-height: 1.65; font-size: 15px;">
      <p style="margin-top: 0;">Hi Nirmal,</p>
      
      <p>I came across your opening for the <strong>Full Stack Developer</strong> role for Billcit and wanted to reach out.</p>
      
      <p>I am a Full Stack Developer specializing in React, Next.js, TypeScript, and modern responsive web interfaces. As someone who builds applications daily, I understand the importance of making billing and invoicing tools fast, reliable, and dead simple for users.</p>
      
      <p style="font-weight: 600; margin-bottom: 8px; color: #111827;">What I can help you with on Billcit right away:</p>
      <ul style="padding-left: 20px; margin-top: 0;">
        <li style="margin-bottom: 8px;"><strong>Modern Next.js & React:</strong> Building clean UI components, invoice views, reports, and responsive client dashboards with Tailwind CSS.</li>
        <li style="margin-bottom: 8px;"><strong>TypeScript & Backend:</strong> Writing clean, typed API routes, integrating databases, and managing state cleanly.</li>
        <li style="margin-bottom: 8px;"><strong>Fast Execution:</strong> Quick to learn your codebase, low-ego, and able to ship clean code independently.</li>
      </ul>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #374151;">Live Work & Links:</p>
        <p style="margin: 0; font-size: 14px;">
          🌐 <strong>Live Portfolio:</strong> <a href="https://sam-codes.vercel.app" style="color: #2563eb; text-decoration: underline;">https://sam-codes.vercel.app</a><br/>
          💻 <strong>GitHub:</strong> <a href="https://github.com/Samarth1306w" style="color: #2563eb; text-decoration: underline;">https://github.com/Samarth1306w</a>
        </p>
      </div>
      
      <p>I would love to learn more about the roadmap for Billcit and how I can help you build and scale it.</p>
      
      <p style="margin-bottom: 0;">
        Best regards,<br/><br/>
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
    subject,
    text: textBody,
    html: htmlBody,
    replyTo: "samarthknimangre@gmail.com",
  });
}

if (process.argv[1] && process.argv[1].endsWith("send-billcit-application.ts")) {
  sendBillcitApplication().then((res) => {
    console.log("Result:", res);
  }).catch(console.error);
}
