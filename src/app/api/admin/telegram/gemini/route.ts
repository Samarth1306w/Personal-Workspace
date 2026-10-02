import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth-service";
import {
  resolveGeminiApiKey,
  saveGeminiApiKeyToStore,
  removeGeminiApiKeyFromStore,
  validateGeminiApiKey,
  maskApiKey,
} from "@/lib/gemini/client";

export const runtime = "nodejs";

/**
 * GET: Returns the current Gemini configuration status.
 */
export async function GET(): Promise<NextResponse> {
  const session = await verifyAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const apiKey = await resolveGeminiApiKey();
    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    const source = envKey ? "env" : apiKey ? "database" : "none";

    return NextResponse.json({
      configured: !!apiKey,
      model: "gemini-2.0-flash",
      fallbackModel: "gemini-2.0-flash-lite",
      maskedKey: apiKey ? maskApiKey(apiKey) : null,
      source,
    });
  } catch (err) {
    console.error("[Admin Gemini GET Error]:", err);
    return NextResponse.json(
      { error: "Failed to check Gemini status" },
      { status: 500 }
    );
  }
}

/**
 * POST: Test, save, or remove the Gemini API key.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await verifyAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      action?: "save" | "test" | "remove";
      apiKey?: string;
    };

    const action = body.action || "save";

    if (action === "test") {
      const keyToTest = body.apiKey?.trim() || (await resolveGeminiApiKey());
      if (!keyToTest) {
        return NextResponse.json(
          { error: "No API key provided to test." },
          { status: 400 }
        );
      }

      const result = await validateGeminiApiKey(keyToTest);
      return NextResponse.json({
        success: result.valid,
        model: result.model,
        latencyMs: result.latencyMs,
        error: result.error,
      });
    }

    if (action === "save") {
      const newKey = body.apiKey?.trim();
      if (!newKey) {
        return NextResponse.json(
          { error: "apiKey is required to save." },
          { status: 400 }
        );
      }

      // Pre-flight test the key before persisting
      const testResult = await validateGeminiApiKey(newKey);
      if (!testResult.valid) {
        return NextResponse.json(
          {
            error: `Key verification failed: ${testResult.error || "Invalid Google Gemini API key"}`,
            details: testResult,
          },
          { status: 400 }
        );
      }

      const saved = await saveGeminiApiKeyToStore(newKey);
      if (!saved) {
        return NextResponse.json(
          { error: "Failed to persist API key in database." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Gemini API key verified and saved successfully!",
        maskedKey: maskApiKey(newKey),
        model: testResult.model,
        latencyMs: testResult.latencyMs,
      });
    }

    if (action === "remove") {
      const removed = await removeGeminiApiKeyFromStore();
      return NextResponse.json({
        success: removed,
        message: "Gemini API key removed from database. Telegram bot reverted to deterministic engine.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[Admin Gemini POST Error]:", err);
    return NextResponse.json(
      { error: "Failed to process Gemini request" },
      { status: 500 }
    );
  }
}
