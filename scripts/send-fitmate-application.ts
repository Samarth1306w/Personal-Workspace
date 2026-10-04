import { sendGmailMessage } from "../src/lib/email/gmail";

async function sendExactOption1() {
  const recipient = "hiring@fitmatecoach.com";
  const ccRecipient = "team@fitmatecoach.com";
  
  const subject = "Application: Junior Frontend Software Engineer — Samarth Nimangre";
  
  const textBody = `Dear Fitmate Coach Hiring Team,

I am writing to express my strong interest in the Junior Frontend Software Engineer role at Fitmate Coach.

When I saw that your team values developers with a keen eye for design, attention to detail, and a passion for building user-centric interfaces, I knew this was an ideal match. Good health and fitness habits start with a frictionless, intuitive digital experience—and crafting clean, responsive interfaces is exactly what I do best.

Here is a quick snapshot of what I bring to Fitmate Coach:

• Modern Frontend Stack: Hands-on experience with React, Next.js, TypeScript, and Tailwind CSS, building responsive interfaces that perform smoothly across mobile and desktop.
• Design-Driven Development: Strong focus on visual hierarchy, smooth micro-interactions, consistent design tokens, and zero layout shift.
• API & State Integration: Comfortable connecting frontends to REST APIs, handling loading/error states gracefully, and writing clean, maintainable TypeScript.
• Fast Execution & Ownership: Self-starter mindset—eager to turn Figma designs into pixel-perfect code and quickly fix UI edge cases.

You can explore my live work and code here:
• Live Portfolio: https://sam-codes.vercel.app
• GitHub: https://github.com/Samarth1306w

I would love the opportunity to contribute to Fitmate Coach's mission and help your users achieve their fitness goals through a delightful product experience.

Thank you for your time and consideration. I look forward to the possibility of speaking with your team.

Warm regards,

Samarth Nimangre
Email: samarthknimangre@gmail.com
Portfolio: https://sam-codes.vercel.app
GitHub: https://github.com/Samarth1306w
Telegram: @Samarth1306
`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; color: #1f2937; line-height: 1.65; font-size: 15px;">
      <p style="margin-top: 0;">Dear Fitmate Coach Hiring Team,</p>
      
      <p>I am writing to express my strong interest in the <strong>Junior Frontend Software Engineer</strong> role at Fitmate Coach.</p>
      
      <p>When I saw that your team values developers with a keen eye for design, attention to detail, and a passion for building user-centric interfaces, I knew this was an ideal match. Good health and fitness habits start with a frictionless, intuitive digital experience—and crafting clean, responsive interfaces is exactly what I do best.</p>
      
      <p style="font-weight: 600; margin-bottom: 8px; color: #111827;">Here is a quick snapshot of what I bring to Fitmate Coach:</p>
      <ul style="padding-left: 20px; margin-top: 0;">
        <li style="margin-bottom: 8px;"><strong>Modern Frontend Stack:</strong> Hands-on experience with React, Next.js, TypeScript, and Tailwind CSS, building responsive interfaces that perform smoothly across mobile and desktop.</li>
        <li style="margin-bottom: 8px;"><strong>Design-Driven Development:</strong> Strong focus on visual hierarchy, smooth micro-interactions, consistent design tokens, and zero layout shift.</li>
        <li style="margin-bottom: 8px;"><strong>API & State Integration:</strong> Comfortable connecting frontends to REST APIs, handling loading/error states gracefully, and writing clean, maintainable TypeScript.</li>
        <li style="margin-bottom: 8px;"><strong>Fast Execution & Ownership:</strong> Self-starter mindset—eager to turn Figma designs into pixel-perfect code and quickly fix UI edge cases.</li>
      </ul>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #374151;">You can explore my live work and code here:</p>
        <p style="margin: 0; font-size: 14px;">
          🌐 <strong>Live Portfolio:</strong> <a href="https://sam-codes.vercel.app" style="color: #2563eb; text-decoration: underline;">https://sam-codes.vercel.app</a><br/>
          💻 <strong>GitHub:</strong> <a href="https://github.com/Samarth1306w" style="color: #2563eb; text-decoration: underline;">https://github.com/Samarth1306w</a>
        </p>
      </div>
      
      <p>I would love the opportunity to contribute to Fitmate Coach's mission and help your users achieve their fitness goals through a delightful product experience.</p>
      
      <p>Thank you for your time and consideration. I look forward to the possibility of speaking with your team.</p>
      
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

  console.log(`Sending exact Option 1 application to: ${recipient} (cc: ${ccRecipient})...`);
  
  const result = await sendGmailMessage({
    to: recipient,
    cc: ccRecipient,
    subject,
    text: textBody,
    html: htmlBody,
    replyTo: "samarthknimangre@gmail.com",
  });

  if (result.success) {
    console.log("✅ Exact Option 1 email sent! Message ID:", result.messageId);
  } else {
    console.error("❌ Failed to send email:", result.error);
    process.exit(1);
  }
}

sendExactOption1().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
