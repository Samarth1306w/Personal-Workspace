import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function seedCMS(): Promise<void> {
  console.log("Seeding Supabase CMS tables...");

  // 1. Services
  const services = [
    {
      id: "micro-fixes-automation",
      title: "Micro-Fixes & Script Automation",
      short_description: "Rapid bug fixes, Python scrapers, and webhook repairs delivered in hours",
      full_description:
        "For founders, store owners, and freelancers who need a quick engineering fix, API connection, data scraping script, or checkout repair without delays.",
      deliverables: [
        "Same-day bug investigation and surgical code patch",
        "Custom Python scraping scripts or data extractors",
        "API webhook debugging and error alert routing",
        "Video walkthrough or live test verification before payment",
      ],
      typical_delivery: "Same-day (6–12 hrs)",
      cta_label: "Start a conversation",
      cta_link: "#contact",
      is_available: true,
      order_index: 1,
      status: "PUBLISHED",
    },
    {
      id: "business-automation",
      title: "Workflow & Business Automation",
      short_description: "Connecting your software so repetitive tasks run themselves",
      full_description:
        "Automated pipelines that connect your tools — automatically qualifying leads, routing notifications, syncing spreadsheets, and updating databases.",
      deliverables: [
        "Multi-app triggers (Stripe, Slack, WhatsApp, Notion, Airtable, Sheets)",
        "Automated lead triage and notification routing",
        "Scheduled data syncs and background batch processing",
        "Reliable error handling and alert notifications to your phone",
      ],
      typical_delivery: "24–48 hrs",
      cta_label: "Start a conversation",
      cta_link: "#contact",
      is_available: true,
      order_index: 2,
      status: "PUBLISHED",
    },
    {
      id: "ai-assistants",
      title: "AI Chatbots & Autonomous Agents",
      short_description: "Helpful conversational tools grounded in your real business information",
      full_description:
        "Custom 24/7 assistants for your website, Telegram, or WhatsApp that answer user questions, explain products, guide visitors, and gather inquiries around the clock.",
      deliverables: [
        "Custom system prompt tailored to your brand voice & policies",
        "Knowledge retrieval from your documents, FAQs, or site (RAG)",
        "Automated lead qualification and CRM database insertion",
        "Real-time push alerts to your personal Telegram or WhatsApp",
      ],
      typical_delivery: "2–4 days",
      cta_label: "Start a conversation",
      cta_link: "#contact",
      is_available: true,
      order_index: 3,
      status: "PUBLISHED",
    },
    {
      id: "websites-webapps",
      title: "Websites & Modern Web Applications",
      short_description: "Fast, responsive web experiences designed with care",
      full_description:
        "Modern, mobile-friendly landing pages and interactive web applications built with Next.js 16 and Tailwind CSS. Focused on clarity, sub-2s load times, and turning visitors into paying clients.",
      deliverables: [
        "Mobile-first, responsive layouts tested across all screen sizes",
        "95+ Google PageSpeed performance with zero Cumulative Layout Shift",
        "Clean metadata, OpenGraph tags, and SEO foundations",
        "Global deployment on Vercel with custom domain setup & SSL",
      ],
      typical_delivery: "3–5 days",
      cta_label: "Start a conversation",
      cta_link: "#contact",
      is_available: true,
      order_index: 4,
      status: "PUBLISHED",
    },
    {
      id: "rapid-mvps",
      title: "Rapid Prototypes & Working MVPs",
      short_description: "From concept to interactive software to validate your idea",
      full_description:
        "For founders, creators, and teams who want to test a concept with real users. I build functional, clickable working prototypes with auth and database in days so you can gather real feedback.",
      deliverables: [
        "Quick turnaround from idea to functional demo link",
        "Interactive core flows with Supabase auth and database tables",
        "Clean, modular TypeScript code structured to grow into production",
        "Direct collaboration, preview links, and post-launch revision support",
      ],
      typical_delivery: "5–10 days",
      cta_label: "Start a conversation",
      cta_link: "#contact",
      is_available: true,
      order_index: 5,
      status: "PUBLISHED",
    },
  ];

  const { error: sErr } = await supabase.from("services").upsert(services);
  console.log("Services seed:", sErr ? sErr.message : "OK (5 services)");

  // 2. Exploring Topics
  const exploring = [
    { id: "exp-ai-agents", name: "AI Agents", category: "AI", status: "Active Research", focus: "Goal-directed reasoning loops, memory graphs, and dynamic tool execution.", order_index: 1, is_visible: true },
    { id: "exp-agentic-systems", name: "Agentic Systems", category: "AI", status: "Experimenting", focus: "Multi-agent coordination, subagent task delegation, and fallback protocols.", order_index: 2, is_visible: true },
    { id: "exp-biz-auto", name: "Business Automation", category: "Workflows", status: "Building", focus: "Event-driven pipelines connecting CRMs, communication channels, and databases.", order_index: 3, is_visible: true },
    { id: "exp-gen-ai", name: "Generative AI", category: "AI", status: "Active Research", focus: "Structured outputs, function calling, context window optimization, and prompt chaining.", order_index: 4, is_visible: true },
    { id: "exp-ai-dev", name: "AI-Assisted Development", category: "Engineering", status: "Building", focus: "Harnessing agentic development tools to rapidly build and ship production software.", order_index: 5, is_visible: true },
    { id: "exp-modern-web", name: "Modern Web Stacks", category: "Engineering", status: "Building", focus: "Next.js 16 App Router, React 19 Server Components, and Tailwind CSS v4.", order_index: 6, is_visible: true },
    { id: "exp-apis", name: "APIs & Integrations", category: "Workflows", status: "Building", focus: "OAuth2 flows, webhook streaming, third-party connectors, and REST endpoints.", order_index: 7, is_visible: true },
    { id: "exp-interface", name: "Interactive Interfaces", category: "Interface", status: "Experimenting", focus: "Subtle micro-interactions, spatial glass layouts, and generative canvas systems.", order_index: 8, is_visible: true },
    { id: "exp-prototypes", name: "Rapid Prototyping", category: "Engineering", status: "Building", focus: "From product requirements to functional interactive deployments in days.", order_index: 9, is_visible: true },
  ];

  const { error: eErr } = await supabase.from("exploring_topics").upsert(exploring);
  console.log("Exploring seed:", eErr ? eErr.message : "OK (9 topics)");

  // 3. Social Links
  const socials = [
    { id: "telegram", platform: "Telegram", display_name: "Telegram (AI Bot)", username: "@samarth_master_bot", url: "https://t.me/samarth_master_bot", description: "24/7 AI lead qualification, instant requirement scoping, and direct message routing", priority: 1, is_visible: true },
    { id: "instagram", platform: "Instagram", display_name: "Instagram", username: "@samarth.buildss", url: "https://www.instagram.com/samarth.buildss/", description: "Fastest response for project chats, ideas, and quick questions", priority: 2, is_visible: true },
    { id: "linkedin", platform: "LinkedIn", display_name: "LinkedIn", username: "Samarth Nimangre", url: "https://www.linkedin.com/in/samarth-nimangre-0a3b02421/", description: "Professional networking, collaboration scopes, and career journey", priority: 3, is_visible: true },
    { id: "twitter", platform: "Twitter", display_name: "X (Twitter)", username: "@Sam_CodeAI", url: "https://x.com/Sam_CodeAI", description: "Daily tech thoughts, builder updates, and AI developments", priority: 4, is_visible: true },
    { id: "github", platform: "Github", display_name: "GitHub", username: "Sam-CodesAI", url: "https://github.com/Sam-CodesAI", description: "Open source contributions, build repositories, and clean architectures", priority: 5, is_visible: true },
    { id: "reddit", platform: "Reddit", display_name: "Reddit", username: "u/Sam_CodeAI", url: "https://www.reddit.com/user/SamarthBuilds_/", description: "Participating in engineering and builder communities", priority: 6, is_visible: true },
  ];

  const { error: soErr } = await supabase.from("social_links").upsert(socials);
  console.log("Socials seed:", soErr ? soErr.message : "OK (6 links)");

  // 4. Assistant Knowledge Base
  const knowledge = [
    {
      id: "what-does-sam-build",
      question: "What does Sam build?",
      keywords: ["build", "create", "what", "services", "capabilities", "skills", "product"],
      answer: "Sam builds focused digital systems: custom AI chatbots, workflow automations that connect apps and eliminate repetitive manual tasks, fast modern web applications (Next.js & React), and clickable MVPs to validate ideas quickly.",
      category: "SERVICES",
      order_index: 1,
      status: "PUBLISHED",
    },
    {
      id: "how-can-sam-help",
      question: "How can Sam help?",
      keywords: ["help", "benefit", "solve", "problem", "assist", "use case", "why hire"],
      answer: "If you have manual tasks to automate (like lead qualification, CRM syncing, or notification routing), need an intelligent assistant trained on your business data, or want a high-converting website shipped fast without agency bureaucracy, Sam can build and deploy a working system for you.",
      category: "SERVICES",
      order_index: 2,
      status: "PUBLISHED",
    },
    {
      id: "what-is-sam-exploring",
      question: "What is Sam currently exploring?",
      keywords: ["exploring", "learning", "research", "interests", "current", "stack"],
      answer: "Sam is currently studying and experimenting with autonomous agent reasoning loops, local small language models (SLMs via Ollama) for privacy-first offline inference, the Model Context Protocol (MCP), and Next.js 16 edge patterns.",
      category: "EXPLORING",
      order_index: 3,
      status: "PUBLISHED",
    },
    {
      id: "show-me-sams-work",
      question: "Show me Sam's work.",
      keywords: ["work", "projects", "lab", "portfolio", "examples", "case study", "show", "teleflow", "bot"],
      answer: "Under Sam's strict zero-fabrication policy, only real verified engineering is showcased. In 'The Lab' section, check out Teleflow Agent (github.com/Sam-CodesAI/teleflow-agent) — an autonomous Telegram AI lead qualifier running at ~284ms latency with interactive inline keyboards, active 24/7 on Telegram (@samarth_master_bot).",
      category: "PROJECTS",
      order_index: 4,
      status: "PUBLISHED",
    },
    {
      id: "how-to-work-with-sam",
      question: "How can I work with Sam?",
      keywords: ["work", "hire", "contact", "reach", "collaborate", "start", "dm", "message", "telegram", "book"],
      answer: "You can chat immediately with our 24/7 Telegram AI Qualifier (@samarth_master_bot) or DM Sam directly on Telegram (@Samarth1306), Instagram (@samarth.buildss), LinkedIn, or email samarthknimangre@gmail.com. You can also schedule an architecture session at https://cal.com/samarth/30min.",
      category: "CONTACT",
      order_index: 5,
      status: "PUBLISHED",
    },
    {
      id: "who-is-sam",
      question: "Who is Sam?",
      keywords: ["who", "sam", "samarth", "background", "about", "location", "student", "age", "years old"],
      answer: "Sam (Samarth Nimangre) is a 17-year-old student and builder based in Karnataka, India. He builds with curiosity, velocity, and craftsmanship — using modern AI tools as a force multiplier to turn ideas into working digital systems.",
      category: "ABOUT",
      order_index: 6,
      status: "PUBLISHED",
    },
  ];

  const { error: kErr } = await supabase.from("assistant_knowledge").upsert(knowledge);
  console.log("Assistant knowledge seed:", kErr ? kErr.message : "OK (6 QnAs)");

  // 6. Verified Projects (The Lab)
  const projects = [
    {
      id: "proj-telegram-agent",
      slug: "telegram-ai-lead-agent",
      title: "Teleflow Agent: Autonomous Telegram AI Lead Qualifier & Edge CRM Router",
      short_description:
        "Instant 24/7 conversational Telegram bot qualifying client project briefs, extracting structured requirements, and inserting verified leads into Supabase PostgreSQL.",
      full_description:
        "A production-grade agentic workflow solving inquiry response delays. The system ingests incoming messages via an authenticated Telegram Bot API webhook, maintains multi-turn conversation state, grounds responses in Samarth's live service catalog, extracts structured lead entities (service requested, timeline, contact info), and logs them directly into Supabase PostgreSQL with real-time audit trails.",
      category: "Agentic Workflow",
      status: "PUBLISHED",
      featured: true,
      publication_date: "2026-09-01T00:00:00Z",
      problem_statement:
        "Prospective clients reaching out via chat channels often face 4 to 8 hour delays before initial triage, leading to lost momentum. Manual requirement gathering is repetitive, prone to missing critical scope details (timelines, specific deliverables, contact info), and requires human manual entry into databases.",
      approach:
        "Engineered an autonomous multi-turn state machine running on Next.js 16 serverless edge endpoints. Built a custom Telegram API client with timeout protection, rate limiting, and zero external runtime dependencies. Integrated deterministic knowledge grounding to eliminate LLM hallucinations and automatically route structured briefs into Supabase PostgreSQL with instantaneous Command Center alerts.",
      architecture: [
        "Telegram Webhook Endpoint (/api/telegram/webhook) with X-Telegram-Bot-Api-Secret-Token validation",
        "Sliding-Window Rate Limiter preventing message spam and DDoS vectors",
        "Deterministic Knowledge Grounding Engine retrieving active services and Q&A entries",
        "Multi-Turn Conversation State Machine (INITIAL -> DISCOVERY -> QUALIFICATION -> CONFIRMED)",
        "Structured Entity Extractor capturing contact email/handle, timeline, and problem brief",
        "Atomic Supabase Client inserting inquiries (status = 'NEW') and logging audit trails",
      ],
      tech_stack: ["Next.js 16", "TypeScript", "Telegram Bot API", "Supabase", "PostgreSQL", "Tailwind CSS v4"],
      tools: ["Telegram Webhooks", "Web Crypto", "Supabase SSR", "Node.js 22"],
      results:
        "Eliminated client inquiry intake latency from hours to under 300ms. In multi-turn verification suites, achieved 100% deterministic schema extraction with zero false promises or hallucinated pricing. Leads are automatically organized in the Command Center ready for immediate architectural scoping.",
      lessons:
        "Webhook endpoints must immediately acknowledge external webhooks with 200 OK while processing execution to avoid Telegram retry cascades. Separating intent classification from entity extraction ensures reliable qualification even when clients provide requirements across fragmented messages.",
      metrics: [
        {
          label: "Avg Response Latency",
          value: "284ms",
          type: "performance",
          evidenceNotes: "Measured across multi-turn verification suite on serverless runtime",
        },
        {
          label: "Triage Delay Saved",
          value: "~4-8 hrs",
          type: "time-saved",
          evidenceNotes: "Instantaneous conversational qualification vs manual asynchronous messaging",
        },
        {
          label: "Schema Compliance",
          value: "100%",
          type: "measurements",
          evidenceNotes: "Deterministic JSON validation before database insertion",
        },
        {
          label: "Uptime & Availability",
          value: "24/7 Global",
          type: "performance",
          evidenceNotes: "Serverless edge deployment on Vercel with zero cold-start bottlenecks",
        },
      ],
      hero_image: "/og-image.png",
      live_url: "https://t.me/samarth_master_bot",
      github_url: "https://github.com/Sam-CodesAI/teleflow-agent",
    },
  ];

  const { error: pErr } = await supabase.from("projects").upsert(projects);
  console.log("Projects seed:", pErr ? pErr.message : "OK (1 verified project)");
}

if (require.main === module) {
  seedCMS().catch(console.error);
}
