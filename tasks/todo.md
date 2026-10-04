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

---

## Phase 6: Production Transition & Live Telephony Wiring

- [x] Task 6.1: Groq Llama 3.3 70B & Multi-LLM Resiliency
  - Description: Upgraded `intent-classifier.ts` to `llama-3.3-70b-versatile` with automatic fallback to Google Gemini (`gemini-2.0-flash`), sub-1ms negation-aware emergency triage, and browser WebRTC microphone tester.
  - Files: `lib/telephony/intent-classifier.ts`, `components/voice/WebRtcVoiceTester.tsx`

- [x] Task 6.2: Production Purge & Hardening
  - Description: Purged synthetic vitest files and mock tokens. Hardened real HMAC-SHA1 signature verification, real Twilio REST SMS, real Gmail SMTP notifications, and real Supabase session tracking.
  - Files: `lib/telephony/sms-service.ts`, `lib/email/gmail.ts`, `lib/telephony/security.ts`

- [x] Task 6.3: Live Vercel Deployment & Twilio Webhook Routing
  - Description: Deployed `vaniedge.vercel.app` to production. Updated live PSTN phone number `+1 (814) 961-3703` via Twilio REST API to route voice calls directly to `https://vaniedge.vercel.app/api/voice/incoming`.
  - Verify: `scripts/update-twilio-webhook.ts` executed with 200 OK.

---

## Phase 7: Flagship Portfolio Integration (`sam-codes.vercel.app`)

- [x] Task 7.1: Interactive Hero Showcase Pill
  - Description: Added live interactive pill linking to WebRTC voice agent demo and 1-click dial to `+1 (814) 961-3703`.
  - Files: `src/components/Hero.tsx`

- [x] Task 7.2: Direct Action Buttons in The Lab
  - Description: Embedded 1-click action buttons (`🎙️ WebRTC Mic Tester` & `📞 Call Live Line`) directly into the VaniEdge-Pro project card.
  - Files: `src/components/LabSection.tsx`

- [x] Task 7.3: Production Verification & Vercel Rollout
  - Description: Clean Next.js 16.3.4 Turbopack build (48/48 routes) and live Vercel production deployment aliased to `https://sam-codes.vercel.app`.

---

## Phase 8: Active Outreach & Job Application Pipeline

- [x] Task 8.1: FitMate Coach Application (Junior Frontend Software Engineer)
  - Description: Dispatched targeted application pitching clean UI craft, responsive design, and modern React/Next.js to `hiring@fitmatecoach.com` (cc: `team@fitmatecoach.com`). Message ID: `<0eb38874-8604-c39e-ed17-7c06f84a7bfc@gmail.com>`.

- [x] Task 8.2: Aistetic Application (Junior Full Stack Engineer - Part-Time)
  - Description: Dispatched application to `team@aistetic.com` (cc: `careers@aistetic.com`) focusing on product edge-case debugging, customer engineering, and UI reliability. Message ID: `<88602e6e-bf93-ca18-5c0b-e630b3ef77b3@gmail.com>`.

- [x] Task 8.3: Billcit Application (Full Stack Developer - Next.js / TypeScript)
  - Description: Dispatched application to founder Nirmal Surani (`nirmalsurani@gmail.com`) focusing on invoicing UI, REST API routes, and database integration. Message ID: `<4152b9e3-f207-2088-234e-76b85d0935f3@gmail.com>`.

---

## Phase 9: PinForge AI (Pinterest & Amazon Affiliate Workflow System)

- [x] Task 9.1: Python Core Engine & Dependencies
  - Description: Configured high-speed `uv` virtual environment with `fastapi`, `uvicorn`, `pillow`, `curl_cffi`, `pydantic`, `google-genai`, `groq`, and `httpx`.
  - Files: `python_engine/config.py`, `python_engine/models.py`, `scripts/start-pinforge-engine.sh`.

- [x] Task 9.2: Stealth Product Resolver & Scraper
  - Description: ASIN extractor with regex, shortlink unroller (`amzn.to`), `curl_cffi` TLS Chrome 124 stealth scraper, Amazon CDN resolver, and affiliate tag injection.
  - Files: `python_engine/scraper.py`.

- [x] Task 9.3: Pillow 2:3 Vertical Pin Graphic Engine (1000x1500)
  - Description: Ultra-fast local CPU graphic compositor (<50ms) rendering 3 high-converting design systems (`bento_dark`, `warm_editorial`, `problem_solver`) with vector stars, antialiased cards, and price badges.
  - Files: `python_engine/pin_generator.py`.

- [x] Task 9.4: Multi-Model AI SEO & Copy Studio
  - Description: Google Gemini (`gemini-flash-lite-latest`) + Groq (`openai/gpt-oss-120b`) copy pipeline generating high-CTR titles (<100 chars), SEO descriptions (<500 chars), `#AmazonAssociate` FTC disclosures, and objective bridge reviews.
  - Files: `python_engine/seo_engine.py`.

- [x] Task 9.5: Triple-Channel Export & Auto-Publishing
  - Description: RFC 4180 compliant Pinterest Bulk Upload CSV generator with peak-hour staggering, plus zero-approval Media RSS 2.0 XML endpoint (`/feed.xml`).
  - Files: `python_engine/csv_exporter.py`, `python_engine/rss_generator.py`, `src/app/feed.xml/route.ts`.

- [x] Task 9.6: Next.js 16 FTC-Compliant Bridge Landing Page (`/p/[slug]`)
  - Description: Sub-second, mobile-optimized bridge landing page with live price notices, FTC disclosures, structured JSON-LD data, pros/cons breakdown, and safe Amazon redirection.
  - Files: `src/app/p/[slug]/page.tsx`, `src/data/pinforge-catalog.ts`.

- [x] Task 9.7: 2026 Bento Grid Mission Control UI (`/demos/pinforge`)
  - Description: Flagship dashboard with 1-click verified test catalog, live 2:3 graphic visualizer, template switcher, AI copy studio with character counters, bulk queue table, and 1-click CSV download.
  - Files: `src/app/demos/pinforge/page.tsx`, `src/app/api/pinforge/*`.

- [x] Task 9.8: Verification & Compilation
  - Description: Full TypeScript check (`tsc --noEmit`) and Next.js 16 Turbopack production build (54/54 static & dynamic routes compiled with 0 errors).

