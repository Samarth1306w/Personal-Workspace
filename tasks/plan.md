# Architecture & Implementation Plan: Twilio Voice Agent v2.0 (Resilient Telephony & Failover Engine)

## Executive Summary
This document specifies the architecture, domain models, state machines, and implementation breakdown for **Twilio Voice Agent v2.0 (VaniEdge-Pro)** — a production-grade, multi-tenant AI telephony engine featuring sub-second conversational voice routing, deterministic emergency triage, and a 3-tier zero-drop failover protocol.

---

## 1. Core Architecture & Capabilities

```
                       [ Caller Phone ]
                              │
                              ▼
                      [ Twilio Telecom ]
                              │
               (HTTPS Webhook / TwiML Request)
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│             VaniEdge-Pro Telephony Edge Controller              │
│               (/src/lib/telephony/ /api/voice/)                │
│                                                                │
│  ┌───────────────────────────────┐                             │
│  │   Security & Signature Gate   │ ◄── X-Twilio-Signature      │
│  └──────────────┬────────────────┘                             │
│                 ▼                                              │
│  ┌───────────────────────────────┐                             │
│  │    Multi-Tenant Profile       │ ◄── Business Hours, FAQs,   │
│  │    Resolver & Policy Engine   │     Transfer Dials, Prompts │
│  └──────────────┬────────────────┘                             │
│                 ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              3-Tier Resilient Voice Engine               │  │
│  │                                                          │  │
│  │  [Tier 1] Fast Interactive AI Voice (Gather + LLM)       │  │
│  │    ├─ Intent Classifier (Routine, Booking, Emergency)    │  │
│  │    └─ Dynamic TwiML Response Generator                   │  │
│  │                                                          │  │
│  │  [Tier 2] Latency Circuit Breaker & Audio Safeguard      │  │
│  │    ├─ Triggers if LLM > 2,000ms or 5xx Error             │  │
│  │    └─ Seamless IVR Record & Speech-to-Text Fallback      │  │
│  │                                                          │  │
│  │  [Tier 3] Sub-5s Omnichannel SMS Rescue                  │  │
│  │    ├─ Triggers on Call Drop, Abandonment, or No-Answer   │  │
│  │    └─ Dispatches Idempotent SMS with Chat/Booking Link   │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                              │
│                 ▼                                              │
│  ┌───────────────────────────────┐  ┌───────────────────────┐  │
│  │   Smart Warm-Transfer Dial    │  │  Event Logging & CRM  │  │
│  │   (Whisper to Tech + Timeout) │  │  (Supabase + Webhooks)│  │
│  └───────────────────────────────┘  └───────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Architecture Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| **Framework: Native Next.js 16 Edge / Node Route Handlers** | Seamless integration with existing `Personal-Workspace`, Vercel global edge (`bom1`), Supabase RLS, and live deployment on `sam-codes.vercel.app`. | Standalone Cloudflare Worker only (harder to showcase interactive UI in primary portfolio). |
| **Failover Tiering: 3-Tier State Machine** | 99.9% of voice agent failures occur due to LLM latency timeouts or caller dropoffs. Combining real-time LLM with circuit-breaker recording and automatic SMS follow-up guarantees zero lost revenue for small business clients. | Raw Twilio media stream with no fallback (leaves caller in awkward silence when LLM hiccups). |
| **Multi-Tenant Schemas with Zod Validation** | Allows any business type (HVAC, dental, legal, roofing, towing) to be configured via a clean JSON/DB profile without writing custom code for each client. | Hardcoded scripts for each client (unmaintainable across 20+ clients). |
| **Cryptographic Webhook Verification** | Strict HMAC-SHA1 validation of Twilio requests using `X-Twilio-Signature` to block fraudulent webhook injection and DDoS. | Token-in-query-string (insecure, exposed in logs). |
| **Interactive In-Browser Telephony Simulator** | Allows Matthew, potential BBA clients, and developers to test inbound calls, emergency triggers, and failover SMS in a visual 2026 Bento Grid UI without spending Twilio dollars. | Requiring actual phone calls only for testing. |

---

## 3. Detailed Data Models & Contracts

### 3.1 Tenant Profile Schema (`TenantProfile`)
```typescript
export interface BusinessHours {
  timezone: string; // e.g. "America/Denver"
  schedule: Record<
    "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
    { open: string; close: string; closed?: boolean } // e.g. "08:00", "17:00"
  >;
}

export interface TenantProfile {
  id: string; // e.g. "mile-high-hvac"
  name: string; // e.g. "Mile High Heating & Air"
  industry: "home_services" | "healthcare" | "professional" | "general";
  phone: string; // Twilio Inbound Number: "+13035550199"
  emergencyNumbers: {
    primaryDispatcher: string; // "+13035550100"
    onCallTechnician: string;   // "+13035550101"
  };
  businessHours: BusinessHours;
  knowledgeBase: {
    serviceArea: string[];
    pricingRules: { service: string; price: string }[];
    emergencyKeywords: string[]; // ["gas leak", "no heat", "flooding", "burst pipe"]
    faq: { question: string; answer: string }[];
  };
  bookingUrl: string; // Cal.com or booking endpoint
  smsFallbackMessage: string;
}
```

### 3.2 Telephony Call Session State (`CallSession`)
```typescript
export type CallPhase = 
  | "initiated"
  | "greeting"
  | "gathering_intent"
  | "processing_ai"
  | "transferring_live"
  | "recording_fallback"
  | "completed"
  | "failed"
  | "sms_rescued";

export interface CallSession {
  callSid: string;
  tenantId: string;
  from: string;
  to: string;
  direction: "inbound" | "outbound";
  phase: CallPhase;
  intent?: "routine_inquiry" | "book_appointment" | "emergency" | "human_transfer" | "unclear";
  transcript: { role: "agent" | "caller"; text: string; timestamp: number }[];
  latencyMs: {
    stt?: number;
    llm?: number;
    tts?: number;
    total: number;
  };
  failoverTriggered: boolean;
  failoverReason?: "llm_timeout" | "caller_hangup" | "tech_no_answer" | "api_error";
  smsRescueSent: boolean;
  createdAt: number;
  updatedAt: number;
}
```

---

## 4. Phase Breakdown & Milestones

### Phase 1: Core Telephony Architecture & Cryptography
* `src/lib/telephony/types.ts`: Core interfaces, Zod schemas, and session models.
* `src/lib/telephony/security.ts`: Twilio HMAC-SHA1 signature verification.
* `src/lib/telephony/tenant-store.ts`: Tenant registry with default profiles (HVAC, Dental, Legal, General Contractor).
* `src/lib/telephony/twiml-builder.ts`: Type-safe TwiML response generator (Speak, Gather, Dial with Whisper, Record, Hangup).

### Phase 2: State Machine & 3-Tier Failover Engine
* `src/lib/telephony/failover-engine.ts`: State machine with circuit breakers (timeout watchdog, emergency keyword classifier, SMS rescue trigger).
* `src/lib/telephony/intent-classifier.ts`: Fast hybrid classifier (regex-first for instant emergency routing, fallback to LLM).
* `src/lib/telephony/sms-service.ts`: Idempotent SMS dispatcher with cooldown tracking.

### Phase 3: REST & Twilio Webhook Endpoints
* `POST /api/voice/incoming`: Primary Twilio inbound webhook (greeting, disclosure, gather).
* `POST /api/voice/process`: Webhook for speech input processing & AI response generation.
* `POST /api/voice/transfer`: Handles warm transfer `<Dial>` with private whisper audio.
* `POST /api/voice/status`: Call status callback (monitors call duration, detects dropped calls, triggers Tier 3 SMS rescue).
* `POST /api/voice/fallback`: Twilio emergency fallback URL if primary server experiences 5xx.

### Phase 4: Interactive Mission Control Dashboard & Simulator
* `src/app/demos/voice-agent/page.tsx`: 2026 Bento Grid Mission Control UI:
  * In-Browser Live Call Simulator (dial, speak/type prompt, simulate timeout, trigger drop).
  * Real-Time Event Stream (shows TwiML generation, state machine transitions, SMS triggers).
  * Tenant Profile Selector & Editor (test HVAC vs Dental vs Legal).
  * Telemetry Gauges (P95 latency, failover rate, rescue success rate).

### Phase 5: Verification & Automated Test Suites
* Unit tests for signature verification, TwiML generation, and intent classification.
* Integration test simulating end-to-end call:
  * Happy Path: Caller books tune-up.
  * Emergency Path: Caller reports gas leak -> live warm transfer.
  * Failover Path: LLM timeout -> IVR recording.
  * Dropoff Path: Caller hangs up in 4s -> automatic SMS rescue.
* Run full TypeScript typecheck and `next build` validation.
