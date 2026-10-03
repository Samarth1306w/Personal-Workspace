# Antigravity Supercharged Operational Rules & Guidelines

## 1. Elite Engineering & Code Quality
- **Full Implementation Guarantee:** Never write placeholder code, `TODO` comments, or stubbed mock functions unless explicitly instructed. Every function, API route, and component must be complete and production-ready.
- **Strict Typing:** Always enforce strict TypeScript types; avoid `any` wherever possible.
- **Atomic Modifications:** When updating existing files, perform precise surgical diffs preserving existing comments and functionality.

## 2. 2026 Modern Design & UI Standards
- **Component Design:** Prioritize modern 2026 design systems (Bento Grid layouts, dark-mode radial gradients, glowing accents, and micro-interactions).
- **Mobile-Native:** Every interface must be 100% responsive and tested for mobile touchscreens (thumb-friendly CTAs, no horizontal scroll bugs).
- **Core Web Vitals:** Build for sub-2-second initial loads, zero Cumulative Layout Shift (CLS), and optimal Interaction to Next Paint (INP).

## 3. Autonomous Verification & Self-Healing
- **Pre-Flight Verification:** Always run `npm run build` or verify compiler output before declaring any feature complete.
- **Proactive Error Recovery:** If a command or build fails, immediately read the error logs, isolate the root cause, fix the code atomically, and re-test without waiting for user intervention.

## 4. Monetization & Commercial Velocity
- **Action-First Mindset:** When solving business problems, build working, clickable prototypes and deploy live previews immediately to eliminate client doubt.
- **Zero Friction Delivery:** Utilize serverless global hosting (Vercel, Cloudflare) for instant production URLs.

## 5. Headless Execution & Tooling Invariants
- **Non-Interactive Flag Enforcement:** All scaffolding and CLI commands executed in background tasks (e.g., `npx`, `apt`, `npm`) MUST include automated non-interactive flags (e.g., `--yes`, `-y`, `--non-interactive`) to prevent TTY input deadlocks.
- **Artifact Metadata Boundary:** Never pass `ArtifactMetadata` when writing source code files in the workspace. `ArtifactMetadata` is strictly reserved for Markdown artifacts written to `<appDataDir>/brain/<conversation-id>/`.
- **High-Speed Package Management:** Prefer `pnpm` or `uv` over raw `npm` / `pip` to avoid telemetry socket hangs in container environments. Always verify disk presence (`node_modules/<package>`) rather than idling on open process sockets.

## 6. Unrestricted Full-Scope Engineering & Maximum Autonomy
- **Zero-Limitation Scope:** Never artificially truncate, simplify, or defer complex implementations. Tackle full-scale architectures, distributed systems, deep algorithmic problems, and multi-file refactors without hesitation.
- **Exhaustive Edge-Case Coverage:** Implement comprehensive edge-case handling, data validation schemas, transaction rollbacks, rate-limiting, and resilient fallbacks in all production code.
- **Autonomous Multi-Agent Orchestration:** Flexibly deploy specialized subagents (`fullstack_engineer`, `qa_security_auditor`, `research`) to divide and conquer large feature sets in parallel.

## 7. Two-Tier Skill Routing & On-Demand Mastery
- **Active Everyday Skills:** The 153 flagship development, architecture, UI/UX, database, distributed systems, and verification skills reside directly in `.agents/skills/` and are actively evaluated against incoming prompts.
- **Specialized Library Skills:** For off-stack languages (Go, Rust, Python ML, C++, C#, Kotlin, Swift, PHP), specialized protocols, hardware/GPU (NVIDIA), and enterprise workflows, consult [`.agents/skills/skill-library/SKILL.md`](file:///workspaces/Personal-Workspace/.agents/skills/skill-library/SKILL.md) and inspect the target instructions at `.agents/skills-library/<skill-name>/SKILL.md` via `view_file`.
- **Context Budget Protection:** Keep all active skill frontmatter descriptions concise (< 200 characters) to preserve context budget headroom and prevent truncation.

## 8. Peak-Level Workspace Engineering Protocols

### A. Architecture & System Design
- **Spec-Driven Architecture ("No Spec, No Code"):** Author structured PRDs, domain models, failure modes, and API contracts before generating code (`spec-driven-development`).
- **Doubt-Driven Adversarial Review:** Subject irreversible architectural decisions to the adversarial protocol: `Claim → Doubt → Experiment → Reconcile → Freeze` (`doubt-driven-development`).
- **Living Docs & Immutable ADRs:** Document significant decisions in sequential ADR markdown records (`docs/adr/`) capturing context, alternatives, and consequences (`documentation-and-adrs`).

### B. Frontend & Accessibility
- **React & Next.js Performance:** Adhere to 70+ performance rules: eliminate async waterfalls, optimize bundle splitting, enforce strict React Server Component (RSC) boundaries, and guarantee zero layout shifts (`react-nextjs-performance`).
- **Web Design Accessibility:** Guarantee WCAG 2.2 Level AA compliance, semantic HTML5 landmarks, modal focus trapping (`dialog`/`inert`), screen-reader usability, and minimum 44x44px touch targets (`web-design-accessibility`).
- **Frontend Design Excellence:** Anti-AI-slop visual design, cohesive design tokens, responsive typography, fluid micro-interactions, dark-mode radial gradients, and modern Bento Grid layouts (`frontend-design`).

### C. Backend & Distributed Systems
- **Contract-First API & Boundary Design:** Author machine-readable contracts (OpenAPI 3.1, gRPC/Protobuf, GraphQL) before implementation. Validate all external inputs at boundaries via strict Zod/Pydantic schemas. Standardize errors on RFC 7807 problem details (`application/problem+json`) and implement base64 opaque cursor pagination (`api-and-interface-design`).
- **Distributed Systems Reliability:** Mandate `Idempotency-Key` headers on mutating requests, exponential backoff with full jitter on retries, circuit breakers, dead-letter queues (DLQ), and HMAC-SHA256 webhook signatures with 300s replay windows (`distributed-reliability`).

### D. Database & Zero-Downtime Migrations
- **Zero-Downtime Database Migrations:** Enforce the 4-Phase Expand/Contract migration sequence (Expand → Dual-Write → Backfill → Contract). Mandate non-blocking DDL (`CREATE INDEX CONCURRENTLY`, `SET lock_timeout = '2s'`), safe `NOT NULL` constraints, and batched background backfills (`zero-downtime-migrations`).
- **Relational Query Tuning:** Profile slow paths using `EXPLAIN (ANALYZE, BUFFERS)`; enforce ESR (Equality, Sort, Range) B-Tree index topologies, partial/covering/GIN indexes, and eliminate N+1 queries via DataLoader or lateral joins (`database-query-optimization`).

### E. DevOps, IaC & Containerization
- **Terraform & OpenTofu IaC Engineering:** Enforce remote state locking (S3/DynamoDB), speculative plan verification (`tofu plan -detailed-exitcode`), sensitive variable masking (`sensitive = true`), and zero hardcoded secrets (`terraform-opentofu`).
- **Kubernetes Systematic Triage:** Follow deterministic triage playbooks for `CrashLoopBackOff`, `OOMKilled` (Exit 137), CoreDNS resolution errors (`ndots:5` avalanche), and PVC volume mount deadlocks (`kubernetes-root-cause`).
- **Hardened Container Security:** Multi-stage Docker builds, unprivileged non-root users (`USER nonroot` / `10001`), minimal/distroless base images, BuildKit secret mounts (`--mount=type=secret`), and secret leak scanning (`hardened-containers`).

### F. Automated Testing & Verification
- **Strict Test-Driven Development (TDD):** Red-Green-Refactor TDD protocol. Prohibits altering production code without an executable test proving failure first (`test-driven-development`).
- **Property-Based & Mutation Testing:** Invariant testing (`fast-check`/`hypothesis`) for roundtrip, idempotence, and invariance; coverage-guided fuzzing; mutation testing kill rates ≥ 80% via Stryker/mutmut (`property-and-mutation-testing`).
- **Scientific Systematic Debugging:** Eliminate shotgun edits via 5-phase scientific debugging: Reproduce → Hypothesize → Isolate → Falsify → Resolve with single-variable isolation (`systematic-debugging`).

### G. Security & Performance
- **Application Security & Hardening:** OWASP Top 10 compliance, AST10 agentic skill prompt injection defenses, secret leak scanning, and SSRF private IP blocking (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.169.254`, `fc00::/7`) (`security-and-hardening`).
- **Measure-First Profiling:** Follow the Measure → Isolate → Optimize → Verify (MIOV) loop using CPU flamegraphs (`pprof`, `py-spy`, `clinic.js`), memory heap profiling, and Core Web Vitals maintenance (LCP ≤ 2.0s, INP ≤ 150ms, CLS = 0.00) (`performance-profiling`).

### H. Meta-Engineering & Quality Gates
- **Meta-Writing-Skills:** TDD-for-skills methodology, Anti-Rationalization Tables for cognitive excuse prevention, and deterministic binary quality gates (`meta-writing-skills`).

### I. Built-in Platform Mastery
- **Platform Capability Suite:** Leverage `agy-customizations` (rules, skills, plugins, lifecycle hooks, MCP servers), `antigravity-guide` (CLI, IDE surfaces, Python SDK), `automation` (cron-scheduled background tasks), `generative_ui` (interactive chat widgets & visual artifacts), `plugin` (namespaced bundles), `ui-extension` (side pane panels), `permissioned-github` (least-privilege `gh` operations), `migrate-workflows` (skill migrations), and `ui-plugin-navigation` (one-click side pane pills).


