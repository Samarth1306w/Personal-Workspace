/**
 * High-Speed Autonomous WhatsApp Agent Bridge (Baileys Multi-Device)
 * Connected to dedicated client intake number: +91 8550816706.
 * Features:
 * - 24/7 Cloud Session Auto-Sync & Restore via Supabase
 * - Grounded Gemini 2.0 Flash AI with Full System Knowledge
 * - Instant Lead Extraction & Supabase Inquiries CRM Insertion
 * - Real-Time Telegram Push Alerts to Samarth (@Samarth1306)
 * - Lightweight HTTP /health listener for Cloud Platforms (Render, Railway, Fly.io)
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import path from "node:path";
import fs from "node:fs";
import http from "node:http";
import crypto from "node:crypto";

import {
  syncWhatsAppAuthToCloud,
  restoreWhatsAppAuthFromCloud,
} from "./cloud-auth";
import {
  getServices,
  getAssistantKnowledge,
  createInquiry,
  logAuditAction,
} from "@/lib/data-service";
import { resolveGeminiApiKey, callGeminiApi, GeminiMessage } from "@/lib/gemini/client";
import { queryDeterministicAssistant } from "@/data/assistantKnowledge";
import { CONTACT_CONFIG } from "@/data/socials";
import { profileData } from "@/data/profile";

const AUTH_DIR = path.join(process.cwd(), ".whatsapp-auth");
const TARGET_PHONE_NUMBER = "918550816706"; // Dedicated client WhatsApp

let activeSocket: WASocket | null = null;
let httpServerStarted = false;

// Per-phone conversation memory buffer (last 8 turns)
const conversationMemory = new Map<string, Array<{ role: "user" | "model"; text: string }>>();

/**
 * Sends a real-time notification to Samarth via Telegram bot
 */
async function sendTelegramAlert(text: string) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
      // Fallback: check .env on disk if not in process.env
      const envPath = path.join(process.cwd(), ".env");
      if (!fs.existsSync(envPath)) return;
      const env = fs.readFileSync(envPath, "utf8");
      const tokenMatch = env.match(/TELEGRAM_BOT_TOKEN=(.*)/);
      const chatMatch = env.match(/TELEGRAM_ADMIN_CHAT_ID=(.*)/);
      if (!tokenMatch || !chatMatch) return;
      await fetch(`https://api.telegram.org/bot${tokenMatch[1].trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatMatch[1].trim(), text, parse_mode: "Markdown" }),
      });
      return;
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("[WhatsApp Bridge] Telegram alert failed:", err);
  }
}

/**
 * Builds grounded system prompt with live services, exact pricing tiers, and portfolio context.
 */
async function buildWhatsAppSystemPrompt(clientName: string, clientPhone: string): Promise<string> {
  const services = await getServices();
  const knowledge = await getAssistantKnowledge();

  const servicesText = services
    .map(
      (s) =>
        `• ${s.title}: ${s.pricing?.inr || "₹1,000+"} (${s.pricing?.usd || "$15+"}) | Turnaround: ${s.pricing?.turnaround || "24-48h"}\n  Deliverables: ${s.deliverables.slice(0, 3).join(", ")}`
    )
    .join("\n\n");

  const faqsText = knowledge.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n");

  return `You are the official 24/7 AI Sales & Intake Assistant for Samarth Nimangre (brand: SAM CODES), chatting directly with a prospective client on WhatsApp (+91 8550816706).

### CLIENT CONTEXT:
• Name: ${clientName}
• Phone: +${clientPhone}

### ABOUT SAM CODES & SAMARTH:
• Developer: ${profileData.fullName} (${profileData.title}), Karnataka, India.
• Philosophy: Strict ZERO-FABRICATION policy. Only quote real engineering capabilities, real verified deliverables, and realistic timelines. Never invent capabilities or give false guarantees.
• Verified Work & Demos:
  - Portfolio: https://sam-codes.vercel.app
  - Live Checkout Conversion Demo: https://sam-codes.vercel.app/demos/dokumentko
  - Architecture Call: ${CONTACT_CONFIG.CAL_URL}
• Payment Methods:
  - India: UPI ID '${process.env.UPI_PAYMENT_ID || "6361209256@ibl"}' or NEFT/IMPS
  - International: PayPal, Stripe credit card invoice, or Wise
  - Terms: Micro-fixes (100% on live demo test). Larger builds (50% deposit / 50% on launch).

### REAL SERVICES & VERIFIED PRICING CATALOG:
${servicesText}

### GROUNDED PORTFOLIO KNOWLEDGE & FAQS:
${faqsText}

### CONVERSATIONAL RULES (WHATSAPP SPECIFIC):
1. Keep replies warm, concise, and professional (typically 2–3 short paragraphs or bullet points). WhatsApp users read on mobile phones.
2. If asked about pricing or rates, state the exact relevant tier:
   - Micro-fixes & scripts: ₹1,000 – ₹2,500 ($15–$30 USD) | Same-day delivery (6–12 hrs)
   - Workflow & business automation: ₹5,000 – ₹12,000 ($70–$150 USD) | 24–48 hrs
   - AI Chatbots & Agents (WhatsApp/Telegram/Web): ₹8,000 – ₹18,000 ($100–$220 USD) | 2–4 days
   - Web Applications & Next.js Landing Pages: ₹12,000 – ₹25,000 ($150–$300 USD) | 3–5 days
   - Rapid MVPs & Prototypes: ₹25,000 – ₹50,000 ($300–$600 USD) | 5–10 days
3. Ask clarifying questions to understand their project requirements (what they need built, target deadline).
4. When the user has shared what they need built, set "readyToCreateLead": true so an inquiry is logged for Samarth to review.

### OUTPUT FORMAT:
You MUST reply with a strictly valid JSON object matching this schema:
{
  "replyText": "Direct WhatsApp message to client with clean line breaks and emojis.",
  "leadExtracted": {
    "name": "Client name or null",
    "serviceRequested": "Matched service or Custom Engineering",
    "problemBrief": "Summary of requirements",
    "timeline": "Stated timeline or null",
    "budget": "Stated budget or null"
  },
  "readyToCreateLead": boolean
}
Output ONLY JSON. Do not wrap in markdown backticks.`;
}

/**
 * Formulate response using Gemini 2.0 Flash, with deterministic knowledge fallback.
 */
async function generateIntelligentWhatsAppReply(
  incomingText: string,
  clientName: string,
  clientPhone: string
): Promise<{ replyText: string; leadSaved: boolean }> {
  // Update in-memory conversation history
  const historyKey = clientPhone;
  let history = conversationMemory.get(historyKey) || [];
  history.push({ role: "user", text: incomingText });
  if (history.length > 8) history = history.slice(-8);
  conversationMemory.set(historyKey, history);

  const geminiApiKey = await resolveGeminiApiKey();

  if (geminiApiKey) {
    try {
      const systemPrompt = await buildWhatsAppSystemPrompt(clientName, clientPhone);
      const messages: GeminiMessage[] = history.map((h) => ({ role: h.role, text: h.text }));

      const rawJson = await callGeminiApi({
        apiKey: geminiApiKey,
        systemPrompt,
        messages,
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseJson: true,
        timeoutMs: 12000,
      });

      const sanitized = rawJson.replace(/```(?:json)?/g, "").trim();
      const parsed = JSON.parse(sanitized);

      const replyText = parsed.replyText || "";
      history.push({ role: "model", text: replyText });
      conversationMemory.set(historyKey, history);

      let leadSaved = false;
      if (parsed.readyToCreateLead && parsed.leadExtracted?.problemBrief) {
        try {
          const lead = await createInquiry({
            name: parsed.leadExtracted.name || clientName,
            contactMethod: `WhatsApp (+${clientPhone})`,
            serviceRequested: parsed.leadExtracted.serviceRequested || "Custom Engineering",
            message:
              `[WHATSAPP INTAKE - AUTONOMOUS]\n` +
              `• Client: ${clientName} (+${clientPhone})\n` +
              `• Service: ${parsed.leadExtracted.serviceRequested}\n` +
              `• Brief: ${parsed.leadExtracted.problemBrief}\n` +
              `• Timeline: ${parsed.leadExtracted.timeline || "Not specified"}\n` +
              `• Budget: ${parsed.leadExtracted.budget || "Standard Tier"}\n` +
              `• Captured via Live WhatsApp AI Engine.`,
          });

          logAuditAction("WHATSAPP_LEAD_CAPTURED", "INQUIRY", lead.id, "whatsapp-agent", {
            phone: clientPhone,
            service: parsed.leadExtracted.serviceRequested,
          });

          leadSaved = true;

          // Alert Samarth on Telegram with direct link to Command Center
          await sendTelegramAlert(
            `⚡ *NEW QUALIFIED LEAD ON WHATSAPP!*\n\n` +
            `👤 *Client:* ${clientName} (\`+${clientPhone}\`)\n` +
            `🛠 *Service:* ${parsed.leadExtracted.serviceRequested}\n` +
            `📝 *Brief:* ${parsed.leadExtracted.problemBrief}\n` +
            `⏱ *Timeline:* ${parsed.leadExtracted.timeline || "Urgent"}\n\n` +
            `[Open in Command Center](https://sam-codes.vercel.app/admin/inquiries?id=${lead.id})`
          );
        } catch (dbErr) {
          console.error("[WhatsApp Bridge] Failed to save lead to database:", dbErr);
        }
      }

      if (replyText) {
        return { replyText, leadSaved };
      }
    } catch (aiErr) {
      console.warn("[WhatsApp Bridge] Gemini turn failed, using deterministic engine:", aiErr);
    }
  }

  // Deterministic Fallback Engine
  const deterministicAnswer = queryDeterministicAssistant(incomingText);
  const lower = incomingText.toLowerCase();

  let fallbackReply = "";
  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate") || lower.includes("quote")) {
    fallbackReply =
      `Hi ${clientName}! Our transparent rates and turnarounds:\n\n` +
      `• Micro-Fixes & Scripts: ₹1,000 – ₹2,500 ($15–$30) | Same-day (6–12 hrs)\n` +
      `• Workflow Automations: ₹5,000 – ₹12,000 ($70–$150) | 24–48 hrs\n` +
      `• AI Bots (WhatsApp/Telegram): ₹8,000 – ₹18,000 ($100–$220) | 2–4 days\n` +
      `• Websites & Next.js Apps: ₹12,000 – ₹25,000 ($150–$300) | 3–5 days\n` +
      `• Rapid Working MVPs: ₹25,000 – ₹50,000 ($300–$600) | 5–10 days\n\n` +
      `What kind of project or script are you looking to build?`;
  } else if (lower.includes("portfolio") || lower.includes("sample") || lower.includes("demo") || lower.includes("work")) {
    fallbackReply =
      `Hi ${clientName}! You can explore our verified production work and live prototypes here:\n` +
      `👉 Portfolio: https://sam-codes.vercel.app\n` +
      `👉 Live E-Commerce Checkout Fix Demo: https://sam-codes.vercel.app/demos/dokumentko\n\n` +
      `What type of system are you looking to launch?`;
  } else {
    fallbackReply =
      `Hi ${clientName}! Thanks for reaching out to SAM CODES.\n\n` +
      `${deterministicAnswer}\n\n` +
      `Tell me what you're looking to build or solve, and I'll get an architectural proposal ready for you!`;
  }

  history.push({ role: "model", text: fallbackReply });
  conversationMemory.set(historyKey, history);

  return { replyText: fallbackReply, leadSaved: false };
}

/**
 * Starts a minimal HTTP server for cloud platforms requiring a port binding (/health check).
 */
function ensureCloudHealthServer() {
  if (httpServerStarted) return;
  const port = process.env.PORT || 3000;

  try {
    const server = http.createServer((req, res) => {
      const reqUrl = req.url || "/";
      const pathname = reqUrl.split("?")[0].replace(/\/+$/, "") || "/";

      if (pathname === "/health" || pathname === "/" || pathname === "") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "online",
            agent: "SAM CODES WhatsApp Bridge",
            targetPhone: `+${TARGET_PHONE_NUMBER}`,
            connected: !!activeSocket,
            timestamp: new Date().toISOString(),
          })
        );
        return;
      }

      if (pathname === "/send" && req.method === "POST") {
        // 1. Verify authentication: Bearer token or x-api-key header (case-insensitive prefix & constant-time check)
        const authHeader = req.headers["authorization"] || "";
        const apiKeyHeader = req.headers["x-api-key"] || "";
        const expectedSecret = process.env.WHATSAPP_BRIDGE_SECRET || process.env.ADMIN_SECRET_KEY;

        const authStr = typeof authHeader === "string" ? authHeader.trim() : "";
        const token =
          authStr.toLowerCase().startsWith("bearer ")
            ? authStr.slice(7).trim()
            : typeof apiKeyHeader === "string"
            ? apiKeyHeader.trim()
            : Array.isArray(apiKeyHeader)
            ? apiKeyHeader[0]?.trim() || ""
            : "";

        let isAuthed = false;
        if (expectedSecret && token) {
          const expectedBuf = Buffer.from(expectedSecret);
          const tokenBuf = Buffer.from(token);
          if (expectedBuf.length === tokenBuf.length && crypto.timingSafeEqual(expectedBuf, tokenBuf)) {
            isAuthed = true;
          }
        }

        if (!isAuthed) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Unauthorized: Invalid or missing API secret" }));
          return;
        }

        // 2. Request payload size limiting (64 KB maximum)
        const MAX_PAYLOAD_BYTES = 64 * 1024;
        const rawContentLength = req.headers["content-length"];
        const parsedContentLength = rawContentLength ? parseInt(String(rawContentLength), 10) : 0;
        const contentLength = Number.isFinite(parsedContentLength) ? parsedContentLength : 0;

        if (contentLength > MAX_PAYLOAD_BYTES) {
          res.writeHead(413, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Payload too large. Maximum allowed size is 64KB." }));
          req.destroy();
          return;
        }

        let body = "";
        let receivedBytes = 0;
        let isAborted = false;

        req.on("error", () => {
          if (!res.headersSent) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Client request stream error" }));
          }
        });

        req.on("data", (chunk) => {
          if (isAborted) return;
          receivedBytes += chunk.length;
          if (receivedBytes > MAX_PAYLOAD_BYTES) {
            isAborted = true;
            res.writeHead(413, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Payload too large. Maximum allowed size is 64KB." }));
            req.destroy();
            return;
          }
          body += chunk;
        });

        req.on("end", async () => {
          if (isAborted) return;
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(body);
          } catch {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Malformed JSON payload" }));
            return;
          }

          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Payload must be a JSON object" }));
            return;
          }

          const { phone, text } = parsed;
          if (typeof phone !== "string" || !phone.trim() || typeof text !== "string" || !text.trim()) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "phone and text must be non-empty strings" }));
            return;
          }

          try {
            const ok = await sendOutboundWhatsApp(phone.trim(), text.trim());
            res.writeHead(ok ? 200 : 500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: ok, targetPhone: phone.trim() }));
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: msg }));
          }
        });
        return;
      }

      res.writeHead(404).end();
    });

    server.listen(port, () => {
      console.log(`[WhatsApp Bridge] Cloud health endpoint listening on port ${port}`);
      httpServerStarted = true;
    });
  } catch (err) {
    console.warn("[WhatsApp Bridge] Could not start health server (port may be in use):", err);
  }
}

/**
 * Initializes the WhatsApp Multi-Device connection with Cloud Session Restore.
 */
export async function startWhatsAppBridge(): Promise<WASocket> {
  ensureCloudHealthServer();

  // 1. Attempt cloud restore if local auth folder is missing or empty
  if (!fs.existsSync(AUTH_DIR) || fs.readdirSync(AUTH_DIR).length === 0) {
    console.log("[WhatsApp Bridge] Local auth missing or empty. Restoring from Supabase cloud...");
    await restoreWhatsAppAuthFromCloud();
  }

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["SAM CODES Cloud Agent", "Chrome", "1.2.0"],
  });

  activeSocket = sock;

  sock.ev.on("creds.update", async () => {
    await saveCreds();
    // Debounced cloud backup to Supabase
    void syncWhatsAppAuthToCloud();
  });

  // Handle connection updates
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !sock.authState.creds.me) {
      console.log("\n📸 QR Code generated as fallback:\n");
      qrcode.generate(qr, { small: true });

      try {
        const brainQrPath = "/home/codespace/.gemini/antigravity-cli/brain/8fd4ce96-8ce8-4fa9-9f25-7722392aafe0/whatsapp_qr.png";
        await QRCode.toFile(brainQrPath, qr, {
          width: 500,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
        console.log(`[WhatsApp Bridge] QR PNG generated at: ${brainQrPath}`);
      } catch (qrErr) {
        console.error("[WhatsApp Bridge] Failed to write QR image:", qrErr);
      }
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[WhatsApp Bridge] Connection closed (${statusCode}). Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(startWhatsAppBridge, 3000);
      }
    } else if (connection === "open") {
      console.log(`\n✅ WhatsApp Agent Connected Successfully as +${TARGET_PHONE_NUMBER}!\n`);

      // Backup credentials to cloud upon successful connection
      await syncWhatsAppAuthToCloud();

      await sendTelegramAlert(
        `🟢 *WhatsApp Agent Bridge ONLINE (Cloud-Synced)*\n\n` +
        `Target Number: \`+${TARGET_PHONE_NUMBER}\`\n` +
        `Unified System Knowledge & Gemini 2.0 Flash AI are active 24/7.`
      );
    }
  });

  // Handle incoming messages
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const senderJid = msg.key.remoteJid || "";
      if (senderJid.endsWith("@g.us")) continue; // Suppress group chats

      const senderPhone = senderJid.replace("@s.whatsapp.net", "");
      const senderName = msg.pushName || "Client";
      const messageText =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      if (!messageText.trim()) continue;

      console.log(`\n📩 [Incoming WhatsApp] From ${senderName} (+${senderPhone}): "${messageText}"`);

      // 1. Alert Telegram immediately
      await sendTelegramAlert(
        `📩 *New WhatsApp Message!*\n\n` +
        `👤 *From:* ${senderName} (\`+${senderPhone}\`)\n` +
        `💬 *Message:* "${messageText}"\n\n` +
        `🤖 *AI Qualifier:* Formulating grounded response...`
      );

      // 2. Formulate grounded AI reply
      const { replyText } = await generateIntelligentWhatsAppReply(
        messageText,
        senderName,
        senderPhone
      );

      // 3. Send reply back to client on WhatsApp
      try {
        await sock.sendMessage(senderJid, { text: replyText });
        console.log(`📤 [Replied to +${senderPhone}]: "${replyText.slice(0, 80)}..."`);
      } catch (sendErr) {
        console.error(`[WhatsApp Bridge] Failed to send reply to ${senderJid}:`, sendErr);
      }
    }
  });

  return sock;
}

/**
 * Send an outbound message to any phone number via WhatsApp
 */
export async function sendOutboundWhatsApp(phone: string, text: string): Promise<boolean> {
  if (!activeSocket) {
    console.error("[WhatsApp Bridge] Socket not active.");
    return false;
  }
  if (typeof phone !== "string" || typeof text !== "string") {
    console.error("[WhatsApp Bridge] Invalid phone or text format.");
    return false;
  }
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const jid = `${cleanPhone}@s.whatsapp.net`;
  try {
    await activeSocket.sendMessage(jid, { text });
    return true;
  } catch (err) {
    console.error(`[WhatsApp Bridge] Failed to send to ${jid}:`, err);
    return false;
  }
}
