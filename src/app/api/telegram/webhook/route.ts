import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import {
  TelegramUpdate,
  sendTelegramMessage,
  sendTelegramChatAction,
  resolveTelegramConfig,
} from "@/lib/telegram/client";
import { executeAgentTurn } from "@/lib/telegram/agent";

export const runtime = "nodejs";

/**
 * Health check handler for Telegram Webhook
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "online",
    service: "SAM CODES Telegram AI Qualifier Webhook",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Inbound Telegram Webhook POST Handler
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verify Telegram Secret Token header from env or site_settings
    const config = await resolveTelegramConfig();
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || config.webhookSecret;
    if (webhookSecret) {
      const incomingSecret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (incomingSecret !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized webhook token" }, { status: 401 });
      }
    }

    // 2. Sliding window rate limit per client IP (max 40 requests/minute)
    const ip = getClientIp(req);
    const rateCheck = await checkRateLimit(`tg-webhook:${ip}`, 40, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429, headers: { "Retry-After": rateCheck.resetSeconds.toString() } }
      );
    }

    // 3. Parse incoming Telegram update
    const update = (await req.json()) as TelegramUpdate;
    const msg = update.message || update.edited_message;

    if (!msg || !msg.chat || !msg.chat.id) {
      // Return 200 OK for unhandled update types (like poll updates) to prevent Telegram retry loops
      return NextResponse.json({ ok: true, skipped: "No actionable text message" });
    }

    const chatId = msg.chat.id;
    const text = (msg.text || "").trim();

    if (!text) {
      return NextResponse.json({ ok: true, skipped: "Empty text" });
    }

    // 4. Send typing indicator asynchronously
    void sendTelegramChatAction(chatId, "typing");

    // 5. Execute Agent Turn
    const result = await executeAgentTurn(chatId, text, {
      username: msg.from?.username,
      firstName: msg.from?.first_name,
      lastName: msg.from?.last_name,
    });

    // 6. Send Response back to user on Telegram
    await sendTelegramMessage(chatId, result.replyText);

    return NextResponse.json({
      ok: true,
      phase: result.phase,
      qualified: result.leadQualified,
      latencyMs: result.latencyMs,
    });
  } catch (err) {
    console.error("[Telegram Webhook Error]:", err);
    // Always return 200 to Telegram to prevent retry floods on internal application errors
    return NextResponse.json({ ok: false, error: "Internal processing error" }, { status: 200 });
  }
}
