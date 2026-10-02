import http from "http";
import { checkRateLimit, recordFailure, clearRateLimit, getClientIp } from "../src/lib/rate-limiter";
import { CALCULATOR_MODULES } from "../src/components/ProjectCalculator";

// Compact short codes used in ProjectCalculator
const MODULE_SHORT_CODES: Record<string, string> = {
  "quick-script": "patch",
  "automation": "auto",
  "ai-agent": "agent",
  "webapp": "web",
  "database-auth": "db",
  "payments": "pay",
};

async function runVerification() {
  console.log("==================================================");
  console.log("   UPGRADE VERIFICATION: RATE LIMITER & CALCULATOR");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. PROJECT CALCULATOR LOGIC, MODULES & CONSTRAINTS
  // ---------------------------------------------------------------------------
  console.log("\n--- Testing Project Calculator Modules & Math ---");
  assert(CALCULATOR_MODULES.length === 6, `Found ${CALCULATOR_MODULES.length} calculator modules (expected 6)`);

  const requiredModuleIds = [
    "quick-script",
    "automation",
    "ai-agent",
    "webapp",
    "database-auth",
    "payments",
  ];
  for (const id of requiredModuleIds) {
    const found = CALCULATOR_MODULES.find((m) => m.id === id);
    assert(!!found, `Module '${id}' exists`);
    if (found) {
      assert(found.inrPrice > 0 && found.usdPrice > 0, `Module '${id}' has positive pricing (₹${found.inrPrice} / $${found.usdPrice})`);
      assert(found.turnaroundHours > 0, `Module '${id}' has turnaround hours (${found.turnaroundHours}h)`);
      assert(found.monthlyHoursSaved > 0, `Module '${id}' has hours saved (${found.monthlyHoursSaved}h/mo)`);
      assert(found.deliverables.length >= 3, `Module '${id}' has at least 3 deliverables`);
    }
  }

  // Multi-module discount calculation test
  const calculateTestQuote = (moduleIds: string[], weeklyRepetitiveHours: number, timelineMultiplier: number) => {
    const selected = CALCULATOR_MODULES.filter((m) => moduleIds.includes(m.id));
    const rawInr = selected.reduce((sum, m) => sum + m.inrPrice, 0);
    const rawUsd = selected.reduce((sum, m) => sum + m.usdPrice, 0);

    let bundleDiscountPercent = 0;
    if (selected.length >= 5) bundleDiscountPercent = 15;
    else if (selected.length >= 3) bundleDiscountPercent = 10;
    else if (selected.length === 2) bundleDiscountPercent = 5;

    const discountMultiplier = 1 - bundleDiscountPercent / 100;
    const effectiveInr = Math.round((rawInr * discountMultiplier * timelineMultiplier) / 500) * 500;
    const effectiveUsd = Math.round((rawUsd * discountMultiplier * timelineMultiplier) / 5) * 5;

    const baseModuleHours = selected.reduce((sum, m) => sum + m.monthlyHoursSaved, 0);
    const hasAiOrAuto = moduleIds.includes("ai-agent") || moduleIds.includes("automation");
    const efficiencyRate = hasAiOrAuto ? 0.75 : 0.45;
    const teamMonthlyHours = Math.round(weeklyRepetitiveHours * 4.2 * efficiencyRate);
    const totalHoursSaved = baseModuleHours + teamMonthlyHours;

    return {
      rawInr,
      effectiveInr,
      effectiveUsd,
      bundleDiscountPercent,
      totalHoursSaved,
    };
  };

  // 1-module test (no bundle discount)
  const q1 = calculateTestQuote(["quick-script"], 10, 1.0);
  assert(q1.bundleDiscountPercent === 0, "1 module has 0% bundle discount");
  assert(q1.effectiveInr === 2000, `1 module effective INR is 2000 (got ${q1.effectiveInr})`);

  // 2-module test (5% bundle discount)
  const q2 = calculateTestQuote(["automation", "ai-agent"], 15, 1.0);
  assert(q2.bundleDiscountPercent === 5, "2 modules has 5% bundle discount");
  assert(q2.effectiveInr === 19000, `2 modules effective INR is 19000 (got ${q2.effectiveInr})`);

  // 5-module test (15% bundle discount)
  const q5 = calculateTestQuote(
    ["quick-script", "automation", "ai-agent", "webapp", "database-auth"],
    20,
    1.0
  );
  assert(q5.bundleDiscountPercent === 15, "5 modules has 15% bundle discount");
  assert(q5.totalHoursSaved > 100, `5 modules saves significant monthly hours (${q5.totalHoursSaved}h/mo)`);

  // Rush timeline (1.25x)
  const qRush = calculateTestQuote(["automation"], 10, 1.25);
  assert(qRush.effectiveInr === 10000, `Rush delivery applies 1.25x multiplier (got ₹${qRush.effectiveInr})`);

  // Telegram deep-link 64-character limit verification across all 6 modules
  console.log("\n--- Testing Telegram Deep Link Length Constraints ---");
  const allIds = CALCULATOR_MODULES.map((m) => m.id);
  const fullPayload = allIds.map((id) => MODULE_SHORT_CODES[id] || id).join("_");
  const fullStartParam = `calc_${fullPayload}`;
  assert(
    fullStartParam.length <= 64,
    `Full 6-module start parameter is ${fullStartParam.length} chars (<= 64 chars Telegram limit): "${fullStartParam}"`
  );

  // ---------------------------------------------------------------------------
  // 2. IN-MEMORY SLIDING WINDOW RATE LIMITER TESTS
  // ---------------------------------------------------------------------------
  console.log("\n--- Testing Rate Limiter (Local Memory Store) ---");

  // Client IP extraction test
  const req1 = { headers: new Headers({ "cf-connecting-ip": "104.28.19.4" }) } as any;
  assert(getClientIp(req1) === "104.28.19.4", "Extracts cf-connecting-ip correctly");

  const req2 = { headers: new Headers({ "x-forwarded-for": "198.51.100.22, 10.0.0.1" }) } as any;
  assert(getClientIp(req2) === "198.51.100.22", "Extracts first IP from x-forwarded-for");

  const req3 = { headers: new Headers({}) } as any;
  assert(getClientIp(req3) === "127.0.0.1", "Falls back to 127.0.0.1 when headers empty");

  // In-Memory sliding window rate limiting
  const testKey = "verify_test_ip_" + Date.now();
  await clearRateLimit(testKey);

  // 5 requests allowed in 5-attempt limit
  const r1 = await checkRateLimit(testKey, 5, 60000);
  assert(r1.allowed === true && r1.remainingAttempts === 4, "Hit 1: allowed with 4 remaining");

  const r2 = await checkRateLimit(testKey, 5, 60000);
  assert(r2.allowed === true && r2.remainingAttempts === 3, "Hit 2: allowed with 3 remaining");

  const r3 = await checkRateLimit(testKey, 5, 60000);
  assert(r3.allowed === true && r3.remainingAttempts === 2, "Hit 3: allowed with 2 remaining");

  const r4 = await checkRateLimit(testKey, 5, 60000);
  assert(r4.allowed === true && r4.remainingAttempts === 1, "Hit 4: allowed with 1 remaining");

  const r5 = await checkRateLimit(testKey, 5, 60000);
  assert(r5.allowed === true && r5.remainingAttempts === 0, "Hit 5: allowed with 0 remaining");

  // 6th attempt MUST be blocked
  const r6 = await checkRateLimit(testKey, 5, 60000);
  assert(r6.allowed === false, "Hit 6: blocked (allowed === false)");
  assert(r6.remainingAttempts === 0, "Hit 6: remainingAttempts === 0");
  assert(r6.resetSeconds > 0 && r6.resetSeconds <= 60, `Hit 6: valid resetSeconds (${r6.resetSeconds}s)`);
  assert(r6.lockedUntil instanceof Date, "Hit 6: lockedUntil is valid Date object");

  // Peek test with { increment: false }
  const peekKey = "verify_peek_" + Date.now();
  const peekStatus = await checkRateLimit(peekKey, 3, 60000, { increment: false });
  assert(peekStatus.allowed === true && peekStatus.remainingAttempts === 3, "Peek with increment=false did not consume attempt");

  // Clear key test
  await clearRateLimit(testKey);
  const clearedStatus = await checkRateLimit(testKey, 5, 60000, { increment: false });
  assert(clearedStatus.remainingAttempts === 5, "Cleared key restored full attempt quota");

  // Record failure test
  const failKey = "verify_fail_" + Date.now();
  await clearRateLimit(failKey);
  const f1 = await recordFailure(failKey, 60000, 2);
  assert(f1.allowed === true && f1.remainingAttempts === 1, "Failure 1: allowed with 1 remaining");
  const f2 = await recordFailure(failKey, 60000, 2);
  assert(f2.allowed === false && f2.remainingAttempts === 0, "Failure 2: locks key immediately");

  // ---------------------------------------------------------------------------
  // 3. UPSTASH REDIS REST API PROTOCOL & DISTRIBUTED EVAL SIMULATION
  // ---------------------------------------------------------------------------
  console.log("\n--- Testing Upstash Redis REST Distributed Rate Limiting ---");

  // Spin up an in-process mock Upstash Redis HTTP server
  const redisStore = new Map<string, number[]>();
  let serverRequestsCount = 0;
  let simulateServerError = false;

  const mockServer = http.createServer((req, res) => {
    serverRequestsCount++;
    const authHeader = req.headers["authorization"];

    if (authHeader !== "Bearer mock-secret-token") {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    if (simulateServerError) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
      return;
    }

    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });

    req.on("end", () => {
      try {
        const command = JSON.parse(rawBody);
        if (!Array.isArray(command)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid command format" }));
          return;
        }

        const cmdName = command[0];

        if (cmdName === "DEL") {
          const key = command[1];
          redisStore.delete(key);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ result: 1 }));
          return;
        }

        if (cmdName === "EVAL") {
          // ["EVAL", script, "1", key, now, windowMs, maxAttempts, shouldIncrement, memberId]
          const redisKey = command[3];
          const now = Number(command[4]);
          const windowMs = Number(command[5]);
          const maxAttempts = Number(command[6]);
          const shouldIncrement = Number(command[7]);

          let timestamps = redisStore.get(redisKey) || [];
          timestamps = timestamps.filter((t) => t > now - windowMs);

          if (timestamps.length >= maxAttempts) {
            const oldest = timestamps[0] || now - windowMs;
            const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ result: [0, 0, resetSeconds, oldest + windowMs] }));
            return;
          }

          if (shouldIncrement === 1) {
            timestamps.push(now);
            redisStore.set(redisKey, timestamps);
          }

          const oldest = timestamps[0] || now;
          const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
          const remaining = Math.max(0, maxAttempts - timestamps.length);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ result: [1, remaining, resetSeconds, 0] }));
          return;
        }

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Unknown command ${cmdName}` }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
  });

  await new Promise<void>((resolve) => {
    mockServer.listen(48291, "127.0.0.1", () => resolve());
  });

  process.env.UPSTASH_REDIS_REST_URL = "http://127.0.0.1:48291";
  process.env.UPSTASH_REDIS_REST_TOKEN = "mock-secret-token";

  try {
    const redisTestKey = "user_ip_cluster_1";
    await clearRateLimit(redisTestKey);
    assert(serverRequestsCount > 0, "clearRateLimit sends DEL command to Upstash Redis REST");

    // Test checkRateLimit over Redis
    const red1 = await checkRateLimit(redisTestKey, 3, 60000);
    assert(red1.allowed === true && red1.remainingAttempts === 2, "Redis Hit 1: allowed with 2 remaining");

    const red2 = await checkRateLimit(redisTestKey, 3, 60000);
    assert(red2.allowed === true && red2.remainingAttempts === 1, "Redis Hit 2: allowed with 1 remaining");

    const red3 = await checkRateLimit(redisTestKey, 3, 60000);
    assert(red3.allowed === true && red3.remainingAttempts === 0, "Redis Hit 3: allowed with 0 remaining");

    // Hit 4 must be blocked by distributed Redis sliding window
    const red4 = await checkRateLimit(redisTestKey, 3, 60000);
    assert(red4.allowed === false && red4.remainingAttempts === 0, "Redis Hit 4: blocked by sliding window");
    assert(red4.lockedUntil instanceof Date, "Redis Hit 4: has valid lockedUntil Date");

    // Test recordFailure over Redis
    const redisFailKey = "login_bruteforce_cluster_1";
    await clearRateLimit(redisFailKey);
    const rf1 = await recordFailure(redisFailKey, 60000, 2);
    assert(rf1.allowed === true && rf1.remainingAttempts === 1, "Redis Failure 1: allowed with 1 remaining");

    const rf2 = await recordFailure(redisFailKey, 60000, 2);
    assert(rf2.allowed === false && rf2.remainingAttempts === 0, "Redis Failure 2: locks immediately on limit reached");
    assert(rf2.lockedUntil instanceof Date, "Redis Failure 2: returns lockedUntil Date");

    // Test graceful fallback when Redis returns HTTP 500 error
    simulateServerError = true;
    const fbKey = "redis_error_fallback_" + Date.now();
    const fbRes = await checkRateLimit(fbKey, 3, 30000);
    assert(fbRes.allowed === true && fbRes.remainingAttempts === 2, "Redis 500 error falls back safely to in-memory store");

  } finally {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    await new Promise<void>((resolve) => mockServer.close(() => resolve()));
  }

  // Fallback resilience when host is unreachable
  process.env.UPSTASH_REDIS_REST_URL = "https://unreachable-redis-host-xyz.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "bad_token";

  const unreachableKey = "verify_unreachable_" + Date.now();
  const unreachStatus = await checkRateLimit(unreachableKey, 3, 30000);
  assert(unreachStatus.allowed === true && unreachStatus.remainingAttempts === 2, "Unreachable Redis host falls back cleanly without crash");

  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log("\n==================================================");
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification script threw unhandled error:", err);
  process.exit(1);
});
