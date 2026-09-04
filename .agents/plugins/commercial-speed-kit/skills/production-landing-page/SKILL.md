---
name: production-landing-page
description: Guide for rapidly building, styling, and deploying 2026 Bento Grid landing pages with Tailwind CSS v4, Lucide icons, and Next.js 16.
---

# 2026 Modern Landing Page Blueprint

## 1. Structure
- Header: Sticky blur backdrop with quick CTA.
- Hero: Kinetic typography, gradient text clip, animated live badge pill.
- Proof: Social proof numbers or infinite marquee.
- Bento Grid: Asymmetric 4-card layout (2-col large, 1-col tall, 1-col standard, 2-col wide).
- Pricing: Interactive monthly/yearly switcher.
- Form: Inline frictionless consultation/booking form.

## 2. Verification
- Always execute `npm run build` and verify 0 TypeScript/ESLint regressions before deployment.
- Deploy directly to Vercel via `vercel --prod`.
