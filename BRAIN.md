# 🧠 SAM CODES — SYSTEM BRAIN & ARCHITECTURE RECORD
> **Master Operational State, Architectural Decisions, Infrastructure Blueprint & Changelog**  
> *Last Updated: October 2, 2026 • Verified Production Build: Next.js 16.3.4 (Turbopack) • Vercel Edge (`bom1` Mumbai)*

---

## 📌 Executive Overview & Core Identity

- **Platform Brand:** **SAM CODES** ([https://sam-codes.vercel.app](https://sam-codes.vercel.app))
- **Owner & Builder:** **Samarth Kallappa Nimangre**
- **Core Persona:** 17-year-old Full-Stack & Automation Engineer based in Karnataka, India.
- **Engineering Directive:** **Strict Zero-Fabrication**. Every metric, project, and deliverable is grounded in real, verifiable software. No agency overhead, no inflated retainers, no fake claims.
- **Repository:** [`/workspaces/Personal-Workspace`](file:///workspaces/Personal-Workspace) (GitHub: `Samarth1306w/Personal-Workspace`)

---

## 🌐 Live Services & Production Endpoints

| Service / Surface | Live URL / Endpoint | Purpose & Architecture |
| :--- | :--- | :--- |
| **Production Portfolio** | [https://sam-codes.vercel.app](https://sam-codes.vercel.app) | Next.js 16, React 19, Tailwind v4, Bento Grid, 1-hour ISR edge caching (`bom1`). |
| **Checkout Conversion Demo** | [https://sam-codes.vercel.app/demos/dokumentko](https://sam-codes.vercel.app/demos/dokumentko) | Prerendered high-converting checkout UX proof of capability. |
| **Architecture Booking** | [https://cal.com/samarth/30min](https://cal.com/samarth/30min) | Verified live 30-min discovery & architecture call scheduling. |
| **Telegram AI Qualifier** | [@samarth_master_bot](https://t.me/samarth_master_bot) | 24/7 Conversational client intake bot powered by Gemini 2.0 Flash. |
| **WhatsApp Companion Bridge** | `+91 8550816706` | Baileys multi-device socket bridge with authenticated `POST /send`. |
| **Direct Contact Email** | `samarthknimangre@gmail.com` | Primary inbox receiving real-time Resend transactional dispatches. |
| **PyPI Package** | [sutradb-core](https://pypi.org/project/sutradb-core/) | Pure Python zero-dependency hybrid vector search & BM25 engine. |

---

## 🐙 Linked GitHub Ecosystem

| Account Handle | Primary Focus | Key Highlights |
| :--- | :--- | :--- |
| **[`Sam-CodesAI`](https://github.com/Sam-CodesAI)** | **Product & Commercial Flagship** | Host for `SutraDB`, `VaniEdge-Voice-Platform`, `teleflow-agent`, `Sam-Codes`, and dynamic README. |
| **[`Samarth1306w`](https://github.com/Samarth1306w)** | **Open Source & Core Systems** | **95 Authored Pull Requests** across `commaai/openpilot`, `screenpipe` (Rust OCR), `activepieces`. GitHub Sponsors enabled. |
| **[`samarthnimangre-dev`](https://github.com/samarthnimangre-dev)** | **Development Workstation** | Tracks active Codespace environment and personal sandbox workflows. |

---

## 🏗️ Technical Architecture & Stack Breakdown

```
                                  [ Global Client / Visitor ]
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
             [ Vercel Global Edge ]                       [ Messaging Ingestion ]
           Edge Prerender (bom1 Mumbai)                     ┌──────────┴──────────┐
           1-Hour ISR Dynamic Revalidate                    ▼                     ▼
                        │                             [ WhatsApp ]           [ Telegram ]
                        ▼                           Baileys Bridge        @samarth_master_bot
                 [ Next.js 16 ]                     (Bearer Auth)         (Webhook Secret)
              React 19 + Tailwind v4                        │                     │
                        │                                   └──────────┬──────────┘
                        ▼                                              │
            [ Serverless API Routes ]                                  ▼
              - /api/contact                               [ Google Gemini 2.0 Flash ]
              - /api/telegram/webhook                         Multi-turn AI Qualifier
              - /api/admin/* (HMAC Session)                            │
                        │                                              ▼
                        ├──────────────────────────────────────────────┤
                        ▼                                              ▼
          [ Resend Transactional Email ]              [ Supabase PostgreSQL 17 ]
          Direct to samarthknimangre@gmail.com        Mumbai (`ap-south-1`)
          with reply-to client email                  Hardened Row Level Security (RLS)
```

### 1. Frontend & UI Engineering
- **Next.js 16.3.4 (Turbopack):** App Router with static ISR generation (`Route /: Revalidate 1h, Expire 1y`).
- **React 19.2.8:** Server Components for zero-bundle data fetching; client islands for micro-interactions.
- **Tailwind CSS v4.3.3:** Oxide engine, responsive Bento Grid, cyan/emerald radial gradient lighting.
- **Edge Routing (`proxy.ts`):** Edge-level request rewriting replacing legacy middleware.
- **Accessibility & Web Vitals:** 44px+ touch targets, visible focus rings (`focus-visible:ring-2`), and `navigator.webdriver` bot bypass on `CinematicIntro` to ensure sub-2s LCP.

### 2. Database & Data Layer
- **Supabase PostgreSQL 17:** Region: Mumbai, India (`ap-south-1`).
- **Zero-Cookie Public Client:** [`src/lib/supabase/server.ts`](file:///workspaces/Personal-Workspace/src/lib/supabase/server.ts) provides `createPublicClient()` which bypasses `cookies()` to enable edge caching.
- **Hardened RLS:** Migration `20260908000000_secure_site_settings.sql` enforces `site_settings.is_public DEFAULT false`, locking down WhatsApp session keys and OAuth secrets.

### 3. Messaging & AI Intelligence
- **Google Gemini 2.0 Flash:** Active models configured as `["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"]` in [`src/lib/gemini/client.ts`](file:///workspaces/Personal-Workspace/src/lib/gemini/client.ts).
- **Telegram Bot Webhook:** Listens at `/api/telegram/webhook`, authenticated with `X-Telegram-Bot-Api-Secret-Token`.
- **WhatsApp Companion Bridge:** [`src/lib/whatsapp/bridge.ts`](file:///workspaces/Personal-Workspace/src/lib/whatsapp/bridge.ts) maintains multi-device WebSockets with constant-time Bearer token authentication on `POST /send`.

### 4. Transactional Email & Notifications
- **Resend Email SDK (`resend`):** Configured with `RESEND_API_KEY`.
- **Direct-to-Inbox Dispatch:** Whenever a visitor submits the contact form, [`src/lib/email/resend.ts`](file:///workspaces/Personal-Workspace/src/lib/email/resend.ts) sends a branded HTML notification directly to `samarthknimangre@gmail.com` with `replyTo` set to the client's email.
- **Dual Direct Email Actions:** The UI provides both a copy button and an "Open App" `mailto:` link.

### 5. Rate Limiting & Edge Resilience
- **Dual-Engine Limiter (`src/lib/rate-limiter.ts`):** Supports **Upstash Redis REST API** sliding-window rate limiting via Lua script evaluation, with an automatic resilient fallback to in-memory sliding windows.

---

## 💼 Commercial Catalog & Pricing Architecture

| Tier | Service Offering | Typical Turnaround | Investment (INR / USD) | Deliverables |
| :---: | :--- | :---: | :---: | :--- |
| **1** | **Micro-Fixes & Script Automation** | 6–12 Hours | ₹1,000 – ₹2,500<br>($15 – $30) | Urgent bug patches, Python scrapers, webhook repairs. 100% on delivery / working demo. |
| **2** | **Workflow & Business Automation** | 24–48 Hours | ₹5,000 – ₹12,000<br>($70 – $150) | Multi-app webhooks (WhatsApp, Slack, Sheets), lead triage pipelines. 50% deposit / 50% launch. |
| **3** | **AI Chatbots & Autonomous Agents** | 2–4 Days | ₹8,000 – ₹18,000<br>($100 – $220) | Custom 24/7 assistants with RAG knowledge retrieval and Telegram/WhatsApp push alerts. |
| **4** | **Websites & Modern Web Applications** | 3–5 Days | ₹12,000 – ₹25,000<br>($150 – $300) | Next.js 16 + Tailwind v4 web storefronts, 95+ PageSpeed, zero CLS, mobile-first design. |
| **5** | **Rapid Prototypes & Working MVPs** | 5–10 Days | ₹25,000 – ₹50,000<br>($300 – $600) | Clickable working MVP with Supabase auth, database, and core user flows. Milestone-based terms. |

---

## 🧮 Interactive Project Calculator Specs

- **Component:** [`src/components/ProjectCalculator.tsx`](file:///workspaces/Personal-Workspace/src/components/ProjectCalculator.tsx)
- **Features:**
  - 6 Selectable feature modules with individual deliverables and turnaround estimates.
  - Automatic bundle discounting: **0%** (1 module), **5%** (2 modules), **10%** (3–4 modules), **15%** (5+ modules).
  - Delivery speed multipliers: *Standard (1.0x)*, *Rush (1.25x)*, *Staged (0.95x)*.
  - Live ROI metrics: Calculates monthly hours saved and breakeven timeline.
  - High-converting conversion actions:
    - Pre-filled WhatsApp link with custom project blueprint.
    - Compressed Telegram deep-link parameter (`calc_patch_auto_agent_web_db_pay`, 32 chars, strictly $\le 64$ chars).
    - Pre-filled Contact Form scroll trigger (`#contact`).

---

## 🔑 Environment Variables Schema

```bash
# ------------------------------------------------------------------------------
# 1. DATABASE & CLOUD STORAGE (Supabase PostgreSQL Mumbai ap-south-1)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="https://gshrgmilfpmftyrxhuwm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# ------------------------------------------------------------------------------
# 2. ADMIN AUTHENTICATION & SECURITY
# ------------------------------------------------------------------------------
ADMIN_SECRET_KEY="..."
ADMIN_EMAILS="samarthknimangre@gmail.com,admin@samcodes.dev"

# ------------------------------------------------------------------------------
# 3. GOOGLE GEMINI AI
# ------------------------------------------------------------------------------
GEMINI_API_KEY="..."

# ------------------------------------------------------------------------------
# 4. TELEGRAM BOT API (@samarth_master_bot)
# ------------------------------------------------------------------------------
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_ADMIN_CHAT_ID="..."
TELEGRAM_WEBHOOK_SECRET="..."

# ------------------------------------------------------------------------------
# 5. RESEND TRANSACTIONAL EMAIL
# ------------------------------------------------------------------------------
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="SAM CODES <onboarding@resend.dev>"
ADMIN_NOTIFY_EMAIL="samarthknimangre@gmail.com"

# ------------------------------------------------------------------------------
# 6. DISTRIBUTED RATE LIMITING (Optional - Upstash Redis REST)
# ------------------------------------------------------------------------------
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# ------------------------------------------------------------------------------
# 7. PAYMENTS & COMMERCE
# ------------------------------------------------------------------------------
UPI_PAYMENT_ID="6361209256@ibl"
```

---

## 📋 Comprehensive Execution Changelog

### Phase 1: GitHub & Workspace Discovery
- Audited GitHub accounts (`Sam-CodesAI`, `Samarth1306w`, `samarthnimangre-dev`).
- Mapped 95 authored OSS pull requests across `openpilot`, `screenpipe`, and `activepieces`.
- Authenticated Vercel CLI (`samarthnimangre`) and Supabase CLI (`sbp_...`).

### Phase 2: Full-Scope Technical & Security Audit
- Isolated cross-continental 1,145ms TTFB bottleneck (sequential `cookies()` calls dispatching to `iad1`).
- Discovered public exposure of WhatsApp session keys via `site_settings.is_public` defaulting to `true`.
- Discovered unauthenticated `POST /send` endpoint on the WhatsApp bridge.
- Found non-existent Gemini models (`gemini-3.1-flash-lite`, etc.) causing silent 404 fallbacks to regex.
- Located broken booking link (`/samarth/discovery` → resolved to `/samarth/30min`).
- Identified missing `public/` directory causing 404s on `/favicon.ico` and `/og-image.png`.

### Phase 3: Surgical Remediation & Security Hardening
- Created and pushed Supabase migration `20260908000000_secure_site_settings.sql` setting `is_public DEFAULT false`.
- Hardened `POST /send` with `crypto.timingSafeEqual` Bearer token authentication and 64KB payload limit.
- Updated all Gemini model calls to official Google Generative AI models (`gemini-2.0-flash`).
- Created public Supabase client without `cookies()`, removed `force-dynamic`, enabled 1h ISR, and pinned Vercel compute to Mumbai (`bom1`) via `vercel.json`.
- Updated `CAL_URL` to `https://cal.com/samarth/30min` and Teleflow demo to `@samarth_master_bot`.
- Seeded the 5th service tier (`micro-fixes-automation` at ₹1,000) into Supabase and eliminated `$$` pricing typos.
- Generated `public/` directory with `favicon.ico`, `manifest.webmanifest`, and OpenGraph assets.
- Added standard HTTP security headers (`X-Frame-Options: DENY`, `nosniff`, `strict-origin-when-cross-origin`).

### Phase 4: Commercial Upgrades & Distributed Rate Limiting
- Built and integrated `ProjectCalculator.tsx` with 6 interactive modules, bundle discounts, time-saved metrics, and 32-char compressed Telegram deep-links.
- Implemented Upstash Redis REST distributed rate limiting in `rate-limiter.ts` with zero-crash in-memory fallback.
- Added comprehensive verification test suite (`scripts/verify-upgrades.ts`) passing **66/66 tests**.

### Phase 5: Resend Direct-to-Inbox Email Pipeline
- Configured Resend MCP server in `~/.gemini/config/mcp_config.json`.
- Installed `resend` SDK and configured `RESEND_API_KEY` across Vercel Production, Preview, and Development.
- Created `src/lib/email/resend.ts` delivering branded HTML notification emails directly to `samarthknimangre@gmail.com`.
- Updated `POST /api/contact` to trigger dual alerts (Resend Email + Telegram Bot push notification).
- Added an "Open App" direct mailto action to the Direct Email card in `ContactSection.tsx`.
- Verified live production release at [sam-codes.vercel.app](https://sam-codes.vercel.app).

### Phase 6: Authenticated Gmail SMTP 2-Way Outreach Pipeline
- Configured official Google SMTP (`smtp.gmail.com:465` SSL) via Nodemailer with 16-character App Password.
- Added `GMAIL_USER` and `GMAIL_APP_PASSWORD` to `.env.local` and `.env.example`.
- Created [`src/lib/email/gmail.ts`](file:///workspaces/Personal-Workspace/src/lib/email/gmail.ts) supporting connection verification, client cold outreach pitches, and automated quote follow-ups.
- Verified live delivery with `scripts/test-gmail.ts` — confirmed successful delivery directly into `samarthknimangre@gmail.com`.

### Phase 7: Apex Air & Plumbing Client Deployment (Bridge Builders Benchmark)
- Implemented Florida two-party consent gate ([`src/lib/telephony/consent-gate.ts`](file:///workspaces/Personal-Workspace/src/lib/telephony/consent-gate.ts)) with DTMF 1 verification and mid-call DTMF 9 revocation.
- Authored Mike Reynolds' approved knowledge base ([`src/lib/telephony/apex-knowledge.ts`](file:///workspaces/Personal-Workspace/src/lib/telephony/apex-knowledge.ts)) with deterministic question matching ($89 diagnostic fee, emergency dispatch rules).
- Built Twilio voice webhook route ([`src/app/api/clients/apex-hvac/voice/route.ts`](file:///workspaces/Personal-Workspace/src/app/api/clients/apex-hvac/voice/route.ts)) with fail-closed timeout and human transfer fallback.
- Created high-converting public trade website ([`src/app/demos/apex-hvac/page.tsx`](file:///workspaces/Personal-Workspace/src/app/demos/apex-hvac/page.tsx)) with interactive AI Customer Assistant widget.
- Created Mike's BridgeView Client Portal ([`src/app/demos/apex-hvac/portal/page.tsx`](file:///workspaces/Personal-Workspace/src/app/demos/apex-hvac/portal/page.tsx)) featuring real-time call feed, audio playback, on-call van dispatcher, and approved knowledge rules.

---

## 🛠️ Operational Runbook & Commands

```bash
# 1. Local Development
pnpm run dev

# 2. Static Typechecking
pnpm run typecheck

# 3. Production Build Compilation
pnpm run build

# 4. Run Upgrade & Resiliency Verification Suite
npx tsx scripts/verify-upgrades.ts

# 5. Database Migrations
supabase db push

# 6. Seed CMS Tables
npx tsx --env-file=.env.local scripts/seed-cms.ts

# 7. Run 24/7 WhatsApp Bridge Locally
pnpm run whatsapp

# 8. Deploy Directly to Vercel Production
vercel --prod
```

---

*This document serves as the permanent single source of truth for the SAM CODES platform architecture, operations, and development history.*
