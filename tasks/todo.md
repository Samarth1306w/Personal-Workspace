# Task List: Twilio Voice Agent v2.0 (VaniEdge-Pro Telephony Platform)

## Phase 1: Core Telephony Architecture & Cryptography

- [x] Task 1.1: Core Types & Zod Schemas
  - Description: Define TypeScript interfaces and Zod validation schemas for `TenantProfile`, `CallSession`, `CallPhase`, `IntentResult`, and `TwilioWebhookPayload`.
  - Acceptance: Strict type safety, exportable interfaces, zero `any`, Zod schemas for tenant validation.
  - Verify: `npm run typecheck`
  - Files: `src/lib/telephony/types.ts`

- [x] Task 1.2: Cryptographic Webhook Security
  - Description: Implement Twilio signature verification (`X-Twilio-Signature`) using HMAC-SHA1 with normalized URL and parameter sorting, plus dev-mode bypass flag.
  - Acceptance: Correct signature calculation matching Twilio standard specification, timing-safe equality comparison.
  - Verify: Unit test verifying valid & invalid signatures.
  - Files: `src/lib/telephony/security.ts`

- [x] Task 1.3: Type-Safe TwiML Response Builder
  - Description: Create a pure, functional TwiML XML builder supporting `<Say>`, `<Gather>`, `<Dial>`, `<Number>`, `<Record>`, `<Hangup>`, and `<Redirect>` with Polly neural voice configuration.
  - Acceptance: Valid XML generation matching Twilio XML schema without external heavy runtime dependencies.
  - Verify: Unit test verifying XML string output.
  - Files: `src/lib/telephony/twiml-builder.ts`

- [x] Task 1.4: Multi-Tenant Profile Registry
  - Description: Implement a tenant profile store with real production-grade presets (e.g., HVAC Home Services, Dental Care, Commercial Law) and lookup by phone number or slug.
  - Acceptance: Fast retrieval by phone number or ID, fallback to default profile, validated against Zod schema.
  - Verify: Unit test verifying lookup and hours check.
  - Files: `src/lib/telephony/tenant-store.ts`

## Checkpoint 1: Foundations
- [x] Core types, security validator, TwiML builder, and tenant store compile with 0 errors (`npm run typecheck`).

---

## Phase 2: State Machine & 3-Tier Failover Engine

- [x] Task 2.1: Hybrid Intent Classifier & Emergency Gate
  - Description: Build an ultra-fast hybrid intent classifier that detects emergency keywords (gas leak, flooding, no heat) in <1ms via regex, and categorizes queries (booking, pricing, human transfer).
  - Acceptance: 100% detection rate on emergency phrases, sub-millisecond classification, fallback to LLM parser.
  - Verify: Unit test against 20+ realistic customer query phrases.
  - Files: `src/lib/telephony/intent-classifier.ts`

- [x] Task 2.2: 3-Tier Failover State Machine
  - Description: Build the state machine governing the call lifecycle: Tier 1 (AI voice), Tier 2 (latency circuit-breaker fallback to voicemail/record), and Tier 3 (call-drop SMS rescue).
  - Acceptance: State transitions correctly handle timeouts, 5xx errors, caller disconnects, and technician busy states.
  - Verify: Unit test simulating each failure trigger.
  - Files: `src/lib/telephony/failover-engine.ts`

- [x] Task 2.3: Idempotent SMS Dispatcher
  - Description: Implement SMS rescue dispatcher with in-memory / Redis deduplication cooldown (prevents spamming same caller within 1 hour).
  - Acceptance: Returns dispatch status, records sent SMS in session, respects cooldown window.
  - Verify: Unit test verifying cooldown blocks duplicate sends.
  - Files: `src/lib/telephony/sms-service.ts`

## Checkpoint 2: Core Engine
- [x] State machine and classifier tests pass with 0 errors.

---

## Phase 3: Twilio Webhook Route Handlers

- [x] Task 3.1: Inbound Call Webhook (`POST /api/voice/incoming`)
  - Description: Implement Twilio webhook handling incoming calls, resolving tenant by dialed number, playing TCPA consent disclosure, and issuing `<Gather>` for caller intent.
  - Acceptance: Returns valid TwiML XML with 200 OK, logs session, validates signature in production.
  - Verify: `curl -X POST http://localhost:3000/api/voice/incoming` returns valid TwiML.
  - Files: `src/app/api/voice/incoming/route.ts`

- [x] Task 3.2: Voice Processing & Intent Handler (`POST /api/voice/process`)
  - Description: Handle speech recognition result from Twilio `<Gather>`. Routes emergency to warm transfer, booking to scheduler, or conversational response.
  - Acceptance: Emits `<Dial>` with whisper on emergency, scheduling confirmation on booking, or graceful Tier 2 `<Record>` on failure.
  - Verify: Integration test sending mock SpeechResult payload.
  - Files: `src/app/api/voice/process/route.ts`

- [x] Task 3.3: Call Status Callback & Dropped Call Rescue (`POST /api/voice/status`)
  - Description: Handle Twilio status callback (`completed`, `busy`, `no-answer`, `failed`). If call dropped < 15s or aborted during transfer, triggers Tier 3 SMS rescue.
  - Acceptance: Detects short dropped calls, triggers SMS rescue, updates session metrics.
  - Verify: Test sending status callback with `CallDuration: "8"`.
  - Files: `src/app/api/voice/status/route.ts`

- [x] Task 3.4: Warm Transfer Status & Whisper Handler (`POST /api/voice/whisper` & `transfer-status`)
  - Description: Provide private whisper audio to technician ("Incoming emergency call from...") and handle technician no-answer fallback.
  - Acceptance: Plays whisper only to called party; if tech fails to answer, routes caller to priority recording with immediate SMS alert.
  - Verify: Unit test verifying whisper TwiML and no-answer fallback.
  - Files: `src/app/api/voice/whisper/route.ts`, `src/app/api/voice/transfer-status/route.ts`

## Checkpoint 3: End-to-End Telephony API
- [x] All 5 Twilio API routes functional and verified via script.

---

## Phase 4: Interactive Mission Control UI & Simulator

- [x] Task 4.1: Live Telephony Mission Control Dashboard
  - Description: Build a modern 2026 Bento Grid UI (`/voice-agent` or `/demos/voice-agent`) showing real-time call simulator, latency monitors, tenant switcher, and call activity logs.
  - Acceptance: 100% responsive, dark-mode 2026 aesthetic, interactive call simulation with visual audio waveform and state transitions.
  - Verify: Interactive test in browser, zero layout shift.
  - Files: `src/app/demos/voice-agent/page.tsx`, `src/components/voice/CallSimulator.tsx`, `src/components/voice/TelemetryStats.tsx`

- [x] Task 4.2: Navigation & Showcase Linkage
  - Description: Add entry point in homepage capabilities / demo carousel and navigation links.
  - Acceptance: Accessible from `/demos` or homepage, indexed in sitemap.
  - Verify: Check sitemap and navigation links.
  - Files: `src/app/sitemap.ts`, `src/data/projects.ts`

---

## Phase 5: Verification & Automated Test Suite

- [x] Task 5.1: Comprehensive End-to-End Test Suite
  - Description: Write executable test script (`scripts/verify-telephony-api.ts`) testing all call flows (Happy Path Booking, Emergency Warm Transfer, Latency Timeout Circuit Breaker, and Dropped Call SMS Rescue).
  - Acceptance: 100% passing tests, detailed latency output, verified TwiML structure.
  - Verify: `npx tsx scripts/verify-telephony-api.ts`
  - Files: `scripts/verify-telephony-api.ts`

- [x] Task 5.2: Production Build & Lint Gate
  - Description: Run full TypeScript compilation and production Next.js build.
  - Acceptance: 0 TypeScript errors, 0 ESLint errors, clean build output.
  - Verify: `npm run build`
