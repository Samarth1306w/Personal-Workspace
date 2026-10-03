---
name: modern-engineering-2026
description: '2026 modern engineering playbook: Next.js 16 (Cache Components, Turbopack,
  proxy.ts), React 19, Tailwind v4, uv, and MCP.'
---

# Modern Software Engineering & Architecture Playbook (2026)

This skill provides direct implementation directives and architectural standards for cutting-edge 2026 technology stacks.

---

## 1. Next.js 16 & React 19 Core Invariants

### Turbopack as Default
- Turbopack is the default bundler for both development and production.
- Avoid deprecated webpack-specific plugins; rely on standard module declarations and SWC/Rust transforms.

### Caching Architecture (`use cache`)
- Legacy partial prerendering and ad-hoc caching flags are replaced by the granular `use cache` directive:
```tsx
// Server Component / Function Granular Caching
async function getLiveMarketData() {
  'use cache';
  // Cache tags & lifetime bound declaratively
  return await fetchMarketData();
}
```

### Routing & Network Boundary: `proxy.ts`
- Legacy middleware patterns are superseded by `proxy.ts` for clean edge boundary and request interception.

### React 19 Native Primitives
- **Actions & Forms:** Standardize on `useActionState` and `useFormStatus` instead of manual `isLoading` state hooks.
- **Async Data & Context:** Use the `use()` hook for reading promises and contexts directly within render boundaries.
- **Zero Manual Memoization:** With the React Compiler active, eliminate redundant `useMemo` and `useCallback` unless strictly required for stable external object identity.
- **Server Actions:** Always enforce Zod/Valibot input schema parsing inside every server action before executing database operations.

---

## 2. Tailwind CSS v4 (CSS-First Architecture)

### The Oxide Engine & Zero-JS Config
- Do NOT generate or look for `tailwind.config.js` or `tailwind.config.ts`.
- All theme tokens, fonts, custom keyframes, and color palettes are defined directly in CSS using `@theme`:
```css
@import "tailwindcss";

@theme {
  --font-display: "Plus Jakarta Sans", sans-serif;
  --color-brand-50: oklch(0.98 0.02 240);
  --color-brand-500: oklch(0.55 0.22 250);
  --color-brand-600: oklch(0.45 0.24 250);
}
```
- Automatic content scanning is active by default; manual glob patterns in configuration are obsolete.
- Use native `@property`, container queries, and `color-mix()` syntax seamlessly.

---

## 3. High-Performance Python (Python 3.13+, `uv`, FastAPI, Pydantic v2)

### Free-Threading (No-GIL) Concurrency
- For CPU-heavy parallel computing, target free-threaded builds (`3.13t` / `3.14t`).
- Verify GIL status at runtime via `sys._is_gil_enabled()`.
- Thread safety invariant: Shared state across worker threads must utilize `threading.Lock` or atomic queue structures.

### Package & Environment Velocity via `uv`
- Lock Python versions using `.python-version`.
- Prefer `uv run` and `uv add` for deterministic, sub-second dependency resolution.

### FastAPI & Pydantic v2 Production Patterns
- **Rust-Backed JSON Parsing:** Always parse high-volume payloads with `Model.model_validate_json(raw_bytes)` to avoid dictionary allocation overhead.
- **Startup Optimization:** For large schemas, declare `ConfigDict(defer_build=True)` on root models.
- **Lifespan Context:** Always manage server state (pools, Redis connections, HTTP clients) via `@asynccontextmanager` lifespans, avoiding deprecated startup/shutdown event hooks:
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize connection pools
    yield
    # Graceful teardown
```

---

## 4. Model Context Protocol (MCP) Standards (Linux Foundation 2026)

### Stateless Architecture
- MCP connections must adhere to stateless protocol specs: each request carries its own context, versioning, and authorization scopes.
- Eliminate server-side session persistence in tool providers to allow horizontal container scaling.

### Security & Governance
- Enforce **OAuth 2.1** authentication on all remote MCP servers.
- Apply the **Principle of Least Privilege**: decouple tool servers into discrete micro-services rather than building monolithic super-servers.
- **Human-in-the-Loop (HITL):** High-risk actions (financial transactions, raw table drops, external emails) must use MCP Elicitation primitives for explicit confirmation.
