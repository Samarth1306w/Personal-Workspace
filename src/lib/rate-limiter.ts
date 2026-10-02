import { NextRequest } from "next/server";

export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  resetSeconds: number;
  lockedUntil?: Date;
}

export interface RateLimitOptions {
  increment?: boolean;
}

// -----------------------------------------------------------------------------
// In-Memory Sliding Window Store (Zero-Dependency Local/Preview Fallback)
// -----------------------------------------------------------------------------

interface SlidingWindowRecord {
  timestamps: number[];
  lockedUntil?: number;
}

const localMemoryStore = new Map<string, SlidingWindowRecord>();

// Periodic eviction to prevent unbounded memory growth in long-running processes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of localMemoryStore.entries()) {
      const isLocked = record.lockedUntil && now < record.lockedUntil;
      const hasRecent = record.timestamps.some((t) => now - t < 30 * 60 * 1000);
      if (!isLocked && !hasRecent) {
        localMemoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Synchronous local memory sliding-window rate limit checker
 */
export function checkRateLimitMemory(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
  increment: boolean = true
): RateLimitStatus {
  const now = Date.now();
  const cutoff = now - windowMs;

  let record = localMemoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
  } else {
    // Purge timestamps outside the current sliding window
    record.timestamps = record.timestamps.filter((t) => t > cutoff);
  }

  // 1. Check if key is currently in a forced lockout
  if (record.lockedUntil && now < record.lockedUntil) {
    const resetSeconds = Math.max(1, Math.ceil((record.lockedUntil - now) / 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      resetSeconds,
      lockedUntil: new Date(record.lockedUntil),
    };
  } else if (record.lockedUntil && now >= record.lockedUntil) {
    record.lockedUntil = undefined;
  }

  // 2. Check if the sliding count has reached or exceeded maxAttempts
  if (record.timestamps.length >= maxAttempts) {
    const oldest = record.timestamps[0] || cutoff;
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    const lockedUntil = new Date(oldest + windowMs);
    return {
      allowed: false,
      remainingAttempts: 0,
      resetSeconds,
      lockedUntil,
    };
  }

  // 3. Record attempt if increment is true
  if (increment) {
    record.timestamps.push(now);
    localMemoryStore.set(key, record);
  }

  const remaining = Math.max(0, maxAttempts - record.timestamps.length);
  const oldest = record.timestamps[0] || now;
  const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

  return {
    allowed: true,
    remainingAttempts: remaining,
    resetSeconds,
  };
}

/**
 * Record a failure in local memory sliding window
 */
export function recordFailureMemory(
  key: string,
  windowMs: number = 15 * 60 * 1000,
  maxAttempts: number = 5
): RateLimitStatus {
  const now = Date.now();
  const cutoff = now - windowMs;

  let record = localMemoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
  } else {
    record.timestamps = record.timestamps.filter((t) => t > cutoff);
  }

  record.timestamps.push(now);

  const remaining = Math.max(0, maxAttempts - record.timestamps.length);
  const oldest = record.timestamps[0] || cutoff;
  const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

  if (record.timestamps.length >= maxAttempts) {
    const lockTime = now + windowMs;
    record.lockedUntil = lockTime;
    localMemoryStore.set(key, record);

    return {
      allowed: false,
      remainingAttempts: 0,
      resetSeconds: Math.ceil(windowMs / 1000),
      lockedUntil: new Date(lockTime),
    };
  }

  localMemoryStore.set(key, record);

  return {
    allowed: true,
    remainingAttempts: remaining,
    resetSeconds,
  };
}

/**
 * Clear rate limit for a key from local memory
 */
export function clearRateLimitMemory(key: string): void {
  localMemoryStore.delete(key);
}

// -----------------------------------------------------------------------------
// Upstash Redis Distributed Sliding Window (REST API)
// -----------------------------------------------------------------------------

/**
 * Atomic sliding window evaluator executed via Upstash Redis REST
 */
async function checkRateLimitRedis(
  url: string,
  token: string,
  key: string,
  maxAttempts: number,
  windowMs: number,
  increment: boolean = true
): Promise<RateLimitStatus> {
  const now = Date.now();
  const redisKey = `ratelimit:${key}`;
  const memberId = `${now}-${Math.random().toString(36).slice(2, 9)}`;

  // Atomic Lua script running on Upstash Redis:
  // 1. ZREMRANGEBYSCORE: drops timestamps older than (now - window)
  // 2. ZCARD: counts valid attempts in current window
  // 3. Checks if limit exceeded: returns blocked state and time until oldest expires
  // 4. If within limit & shouldIncrement: records current timestamp with PEXPIRE
  const luaScript = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local shouldIncrement = tonumber(ARGV[4])
local memberId = ARGV[5]

local cutoff = now - window
redis.call('ZREMRANGEBYSCORE', key, 0, cutoff)
local count = redis.call('ZCARD', key)

if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local oldestScore = (oldest and oldest[2]) and tonumber(oldest[2]) or (now - window)
  local resetSeconds = math.max(1, math.ceil((oldestScore + window - now) / 1000))
  return {0, 0, resetSeconds, oldestScore + window}
end

if shouldIncrement == 1 then
  redis.call('ZADD', key, now, memberId)
  count = count + 1
  redis.call('PEXPIRE', key, math.ceil(window * 2))
end

local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local oldestScore = (oldest and oldest[2]) and tonumber(oldest[2]) or now
local resetSeconds = math.max(1, math.ceil((oldestScore + window - now) / 1000))
local remaining = math.max(0, limit - count)
return {1, remaining, resetSeconds, 0}
`;

  const endpoint = url.trim().endsWith("/") ? url.trim() : `${url.trim()}/`;
  const bearerToken = token.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        luaScript,
        "1",
        redisKey,
        String(now),
        String(windowMs),
        String(maxAttempts),
        increment ? "1" : "0",
        memberId,
      ]),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Upstash returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(`Upstash error: ${data.error}`);
    }

    if (!data || !Array.isArray(data.result) || data.result.length < 3) {
      throw new Error(`Unexpected Upstash response payload: ${JSON.stringify(data)}`);
    }

    // result format: [allowed (0 or 1), remaining, resetSeconds, lockedUntilMs]
    const [allowedNum, remainingNum, resetSecNum, lockedUntilMs = 0] = data.result as [
      number,
      number,
      number,
      number?,
    ];

    return {
      allowed: allowedNum === 1,
      remainingAttempts: remainingNum,
      resetSeconds: resetSecNum,
      lockedUntil: lockedUntilMs > 0 ? new Date(lockedUntilMs) : undefined,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Remove rate-limit record from Upstash Redis
 */
async function clearRateLimitRedis(url: string, token: string, key: string): Promise<void> {
  const endpoint = url.trim().endsWith("/") ? url.trim() : `${url.trim()}/`;
  const bearerToken = token.trim();
  const redisKey = `ratelimit:${key}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["DEL", redisKey]),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    // Non-fatal if Redis key eviction encounters network error
  } finally {
    clearTimeout(timeoutId);
  }
}

// -----------------------------------------------------------------------------
// Public Unified Rate Limiter Interface
// -----------------------------------------------------------------------------

/**
 * Extract client IP address securely from standard proxy and edge request headers
 */
export function getClientIp(req: NextRequest | Request): string {
  if ("headers" in req && req.headers) {
    const cfIp = req.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();

    const xForwardedFor = req.headers.get("x-forwarded-for");
    if (xForwardedFor) {
      const parts = xForwardedFor.split(",");
      if (parts[0]) return parts[0].trim();
    }

    const xRealIp = req.headers.get("x-real-ip");
    if (xRealIp) return xRealIp.trim();
  }

  if ("ip" in req && typeof (req as { ip?: string }).ip === "string") {
    const rawIp = (req as { ip?: string }).ip;
    if (rawIp) return rawIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Primary sliding-window rate limit checker.
 * Uses distributed Upstash Redis REST when configured; automatically falls back
 * to local in-memory sliding window when unconfigured or unreachable.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
  options?: RateLimitOptions
): Promise<RateLimitStatus> {
  const increment = options?.increment ?? true;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      return await checkRateLimitRedis(redisUrl, redisToken, key, maxAttempts, windowMs, increment);
    } catch (err) {
      console.warn(
        `[RateLimiter] Upstash Redis request failed, falling back to local memory store:`,
        err
      );
    }
  }

  return checkRateLimitMemory(key, maxAttempts, windowMs, increment);
}

/**
 * Record a failed attempt for the given key (e.g., bad credentials or validation error)
 */
export async function recordFailure(
  key: string,
  windowMs: number = 15 * 60 * 1000,
  maxAttempts: number = 5
): Promise<RateLimitStatus> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const status = await checkRateLimitRedis(redisUrl, redisToken, key, maxAttempts, windowMs, true);
      // When reaching or exceeding max attempts via failure, guarantee locked state matching memory limiter
      if (status.remainingAttempts <= 0) {
        return {
          ...status,
          allowed: false,
          remainingAttempts: 0,
          lockedUntil: status.lockedUntil || new Date(Date.now() + status.resetSeconds * 1000),
        };
      }
      return status;
    } catch (err) {
      console.warn(
        `[RateLimiter] Upstash Redis recordFailure failed, falling back to local memory:`,
        err
      );
    }
  }

  return recordFailureMemory(key, windowMs, maxAttempts);
}

/**
 * Clear rate limit on successful authentication or manual reset
 */
export async function clearRateLimit(key: string): Promise<void> {
  clearRateLimitMemory(key);

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      await clearRateLimitRedis(redisUrl, redisToken, key);
    } catch {
      // Ignored
    }
  }
}

// Synchronous aliases for legacy synchronous callers or synchronous testing
export const checkRateLimitSync = checkRateLimitMemory;
export const recordFailureSync = recordFailureMemory;
export const clearRateLimitSync = clearRateLimitMemory;
