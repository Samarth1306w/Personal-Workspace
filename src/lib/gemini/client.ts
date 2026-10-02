/**
 * Google Gemini Generative AI Client
 * Native fetch-based integration optimized for sub-second serverless execution.
 * Zero external dependencies, automatic fallback between Gemini 2.0 Flash and 1.5 Flash,
 * and robust resolution from process.env and Supabase site_settings.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export interface GeminiGenerateOptions {
  apiKey?: string;
  systemPrompt?: string;
  messages: GeminiMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  responseJson?: boolean;
  timeoutMs?: number;
}

export interface GeminiValidationResult {
  valid: boolean;
  model: string;
  latencyMs: number;
  error?: string;
}

let cachedApiKey: string | null = null;
let lastKeyFetch = 0;
const KEY_CACHE_TTL_MS = 60 * 1000;

/**
 * Resolve the Gemini API key.
 * Priority:
 * 1) process.env.GEMINI_API_KEY
 * 2) process.env.GOOGLE_AI_API_KEY
 * 3) Supabase site_settings table (key: 'gemini_config' -> { apiKey: "..." })
 * 4) Supabase site_settings table (key: 'telegram_config' -> { geminiApiKey: "..." })
 */
export async function resolveGeminiApiKey(): Promise<string | null> {
  const now = Date.now();
  if (cachedApiKey && now - lastKeyFetch < KEY_CACHE_TTL_MS) {
    return cachedApiKey;
  }

  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (envKey && envKey.trim()) {
    cachedApiKey = envKey.trim();
    lastKeyFetch = now;
    return cachedApiKey;
  }

  try {
    const supabase = createAdminClient();
    if (supabase) {
      // 1. Check dedicated gemini_config
      const { data: geminiData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "gemini_config")
        .maybeSingle();

      if (geminiData?.value && typeof geminiData.value === "object") {
        const val = geminiData.value as Record<string, unknown>;
        if (typeof val.apiKey === "string" && val.apiKey.trim()) {
          cachedApiKey = val.apiKey.trim();
          lastKeyFetch = now;
          return cachedApiKey;
        }
      }

      // 2. Check telegram_config for embedded geminiApiKey
      const { data: tgData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "telegram_config")
        .maybeSingle();

      if (tgData?.value && typeof tgData.value === "object") {
        const val = tgData.value as Record<string, unknown>;
        if (typeof val.geminiApiKey === "string" && val.geminiApiKey.trim()) {
          cachedApiKey = val.geminiApiKey.trim();
          lastKeyFetch = now;
          return cachedApiKey;
        }
      }
    }
  } catch (err) {
    console.warn("[Gemini Config] Could not query site_settings:", err);
  }

  return null;
}

/**
 * Store or update the Gemini API key in Supabase site_settings.
 */
export async function saveGeminiApiKeyToStore(apiKey: string): Promise<boolean> {
  const trimmed = apiKey.trim();
  const supabase = createAdminClient();
  if (!supabase) return false;

  const payload = {
    apiKey: trimmed,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "gemini_config",
      value: payload,
      updated_at: new Date().toISOString(),
      is_public: false,
    },
    { onConflict: "key" }
  );

  if (error) {
    console.error("[Gemini Config] Failed to save API key to site_settings:", error);
    return false;
  }

  cachedApiKey = trimmed;
  lastKeyFetch = Date.now();
  return true;
}

/**
 * Remove the Gemini API key from Supabase site_settings.
 */
export async function removeGeminiApiKeyFromStore(): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("site_settings")
    .delete()
    .eq("key", "gemini_config");

  if (error) {
    console.error("[Gemini Config] Failed to remove API key:", error);
    return false;
  }

  cachedApiKey = null;
  lastKeyFetch = 0;
  return true;
}

/**
 * Helper to mask an API key for safe display in the Admin UI.
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 10) return "••••••••••••";
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

/**
 * Call the Google Generative Language API with retry and model fallback.
 */
export async function callGeminiApi(options: GeminiGenerateOptions): Promise<string> {
  const apiKey = options.apiKey || (await resolveGeminiApiKey());
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Model preferences: prefer gemini-2.0-flash, fallback to gemini-2.0-flash-lite and gemini-1.5-flash
  const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = options.messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const bodyPayload: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
          ...(options.responseJson ? { responseMimeType: "application/json" } : {}),
        },
      };

      if (options.systemPrompt) {
        bodyPayload.systemInstruction = {
          parts: [{ text: options.systemPrompt }],
        };
      }

      const controller = new AbortController();
      const timeoutMs = options.timeoutMs ?? 12000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorJson = (await res.json().catch(() => ({}))) as {
          error?: { message?: string; status?: string };
        };
        const msg = errorJson.error?.message || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(`Gemini API error [${model}]: ${msg}`);
      }

      const data = (await res.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof candidateText === "string") {
        return candidateText;
      }

      throw new Error(`No text generated by model ${model}`);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Gemini Client] Attempt on model ${model} failed (${lastError.message}). Trying fallback if available.`);
      continue;
    }
  }

  throw lastError || new Error("Gemini API call failed across all candidate models.");
}

/**
 * Validate a Gemini API key by running a minimal test request.
 */
export async function validateGeminiApiKey(apiKey: string): Promise<GeminiValidationResult> {
  const startTime = Date.now();
  try {
    const raw = await callGeminiApi({
      apiKey,
      systemPrompt: "You are an API health verifier. Return valid JSON: {\"status\": \"ok\", \"model\": \"gemini\"}",
      messages: [{ role: "user", text: "ping" }],
      temperature: 0,
      maxOutputTokens: 60,
      responseJson: true,
      timeoutMs: 6000,
    });

    const latencyMs = Date.now() - startTime;
    return {
      valid: true,
      model: "gemini-2.0-flash",
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      model: "unknown",
      latencyMs: Date.now() - startTime,
      error: errorMsg,
    };
  }
}
