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
