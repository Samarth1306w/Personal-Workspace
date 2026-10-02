-- ==============================================================================
-- SAM CODES // COMMAND CENTER — PRODUCTION DATABASE SEED SCRIPT
-- Imports verified authentic content into PostgreSQL / Supabase
-- ==============================================================================

-- 1. Profiles
INSERT INTO profiles (
  id, full_name, preferred_name, age, location, identity_headline, bio,
  hero_title, hero_description, philosophy_statement, values, status
) VALUES (
  'samarth-profile',
  'Samarth Nimangre',
  'Sam',
  17,
  'Karnataka, India',
  'Student • AI Developer • Automation Builder • Digital Creator',
  'I am Sam — a student and builder based in Karnataka, India. I am deeply curious about what becomes possible when human creativity, AI, automation, and software engineering intersect. Rather than treating AI as a buzzword, I focus on understanding the core problem first and use modern tools as a force multiplier to ship clean, dependable software.',
  'Building thoughtful digital experiences that actually work.',
  'I am Sam — a student and builder from Karnataka, India exploring what happens when AI, automation, and software come together to turn ideas into useful systems.',
  'Focused engineering with direct communication. No agency overhead, no inflated retainers, and no layers of middle management — just clean craft and honest progress.',
  '[
    {"title": "AI as a Force Multiplier", "description": "Modern AI tools accelerate exploration and implementation without sacrificing code quality.", "tag": "VELOCITY"},
    {"title": "Problem-First Thinking", "description": "Start with what actually needs to work in the real world, then choose the simplest, most dependable technology.", "tag": "CLARITY"},
    {"title": "Transparent Building", "description": "Clear scope, visible milestone progress, honest communication, and zero fabricated claims.", "tag": "HONESTY"},
    {"title": "Built to Evolve", "description": "Systems are structured cleanly with modular code so the first working version can scale naturally.", "tag": "LONGEVITY"}
  ]'::jsonb,
  'Open for interesting builds & collaborations'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  preferred_name = EXCLUDED.preferred_name,
  bio = EXCLUDED.bio,
  hero_title = EXCLUDED.hero_title,
  hero_description = EXCLUDED.hero_description,
  philosophy_statement = EXCLUDED.philosophy_statement,
  values = EXCLUDED.values,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 2. Services
INSERT INTO services (id, title, short_description, full_description, deliverables, typical_delivery, cta_label, cta_link, is_available, order_index, status) VALUES
('micro-fixes-automation', 'Micro-Fixes & Script Automation', 'Rapid bug fixes, Python scrapers, and webhook repairs delivered in hours', 'For founders, store owners, and freelancers who need a quick engineering fix, API connection, data scraping script, or checkout repair without delays.', '["Same-day bug investigation and surgical code patch", "Custom Python scraping scripts or data extractors", "API webhook debugging and error alert routing", "Video walkthrough or live test verification before payment"]'::jsonb, 'Same-day (6–12 hrs)', 'Start a conversation', '#contact', true, 1, 'PUBLISHED'),
('business-automation', 'Workflow & Business Automation', 'Connecting your software so repetitive tasks run themselves', 'Automated pipelines that connect your tools — automatically qualifying leads, routing notifications, syncing spreadsheets, and updating databases.', '["Multi-app triggers (Stripe, Slack, WhatsApp, Notion, Airtable, Sheets)", "Automated lead triage and notification routing", "Scheduled data syncs and background batch processing", "Reliable error handling and alert notifications to your phone"]'::jsonb, '24–48 hrs', 'Start a conversation', '#contact', true, 2, 'PUBLISHED'),
('ai-assistants', 'AI Chatbots & Autonomous Agents', 'Helpful conversational tools grounded in your real business information', 'Custom 24/7 assistants for your website, Telegram, or WhatsApp that answer user questions, explain products, guide visitors, and gather inquiries around the clock.', '["Custom system prompt tailored to your brand voice & policies", "Knowledge retrieval from your documents, FAQs, or site (RAG)", "Automated lead qualification and CRM database insertion", "Real-time push alerts to your personal Telegram or WhatsApp"]'::jsonb, '2–4 days', 'Start a conversation', '#contact', true, 3, 'PUBLISHED'),
('websites-webapps', 'Websites & Modern Web Applications', 'Fast, responsive web experiences designed with care', 'Modern, mobile-friendly landing pages and interactive web applications built with Next.js 16 and Tailwind CSS. Focused on clarity, sub-2s load times, and turning visitors into paying clients.', '["Mobile-first, responsive layouts tested across all screen sizes", "95+ Google PageSpeed performance with zero Cumulative Layout Shift", "Clean metadata, OpenGraph tags, and SEO foundations", "Global deployment on Vercel with custom domain setup & SSL"]'::jsonb, '3–5 days', 'Start a conversation', '#contact', true, 4, 'PUBLISHED'),
('rapid-mvps', 'Rapid Prototypes & Working MVPs', 'From concept to interactive software to validate your idea', 'For founders, creators, and teams who want to test a concept with real users. I build functional, clickable working prototypes with auth and database in days so you can gather real feedback.', '["Quick turnaround from idea to functional demo link", "Interactive core flows with Supabase auth and database tables", "Clean, modular TypeScript code structured to grow into production", "Direct collaboration, preview links, and post-launch revision support"]'::jsonb, '5–10 days', 'Start a conversation', '#contact', true, 5, 'PUBLISHED')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  deliverables = EXCLUDED.deliverables,
  typical_delivery = EXCLUDED.typical_delivery,
  cta_label = EXCLUDED.cta_label,
  cta_link = EXCLUDED.cta_link,
  is_available = EXCLUDED.is_available,
  order_index = EXCLUDED.order_index,
  status = EXCLUDED.status;

-- 3. Social Links
INSERT INTO social_links (id, platform, display_name, username, url, description, priority, is_visible) VALUES
('instagram', 'Instagram', 'Instagram', '@samarth.buildss', 'https://www.instagram.com/samarth.buildss/', 'Fastest response for project chats, ideas, and quick questions', 1, true),
('linkedin', 'LinkedIn', 'LinkedIn', 'Samarth Nimangre', 'https://www.linkedin.com/in/samarth-nimangre-0a3b02421/', 'For client engagements, academic discussions, and professional network', 2, true),
('x', 'X (Twitter)', 'X', '@Sam_CodeAI', 'https://x.com/Sam_CodeAI', 'Tech discussions, build progress, and direct messaging', 3, true),
('reddit', 'Reddit', 'Reddit', 'u/Sam_CodeAI', 'https://www.reddit.com/user/SamarthBuilds_/', 'Builder community, discussions, and open-source feedback', 4, true),
('github', 'GitHub', 'GitHub', 'Sam-CodesAI', 'https://github.com/Sam-CodesAI', 'Open source code, repositories, and build activity', 5, true),
('email', 'Email', 'Email', 'samarthknimangre@gmail.com', 'mailto:samarthknimangre@gmail.com', 'For formal project specifications, briefs, and scopes', 6, true)
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  username = EXCLUDED.username,
  description = EXCLUDED.description,
  priority = EXCLUDED.priority,
  is_visible = EXCLUDED.is_visible;

-- 4. Exploring Topics
INSERT INTO exploring_topics (id, name, category, status, focus, order_index, is_visible) VALUES
('exp-1', 'AI Agents', 'AI', 'Active Research', 'Goal-directed reasoning loops, memory graphs, and dynamic tool execution.', 1, true),
('exp-2', 'Agentic Systems', 'AI', 'Experimenting', 'Multi-agent coordination, subagent task delegation, and fallback protocols.', 2, true),
('exp-3', 'Business Automation', 'Workflows', 'Building', 'Event-driven pipelines connecting CRMs, communication channels, and databases.', 3, true),
('exp-4', 'Generative AI', 'AI', 'Active Research', 'Structured outputs, function calling, context window optimization, and prompt chaining.', 4, true),
('exp-5', 'AI-Assisted Development', 'Engineering', 'Building', 'Harnessing agentic development tools to rapidly build and ship production software.', 5, true),
('exp-6', 'Modern Web Stacks', 'Engineering', 'Building', 'Next.js 16 App Router, React 19 Server Components, and Tailwind CSS v4.', 6, true),
('exp-7', 'APIs & Integrations', 'Workflows', 'Building', 'OAuth2 flows, webhook streaming, third-party connectors, and REST endpoints.', 7, true),
('exp-8', 'Interactive Interfaces', 'Interface', 'Experimenting', 'Subtle micro-interactions, spatial glass layouts, and generative canvas systems.', 8, true),
('exp-9', 'Rapid Prototyping', 'Engineering', 'Building', 'Validating functional software concepts in days rather than months.', 9, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  focus = EXCLUDED.focus;

-- 5. Site Settings
INSERT INTO site_settings (key, value, description, is_public) VALUES
('site_config', '{
  "site_title": "Sam Codes — AI Developer & Automation Builder",
  "meta_description": "Samarth Nimangre — student, AI developer and automation builder creating AI systems, workflows, web experiences and digital experiments.",
  "availability_status": "Available for custom builds",
  "allow_contact_form": true,
  "analytics_enabled": true,
  "cinematic_intro_enabled": true,
  "sound_effects_enabled": true
}'::jsonb, 'Global public site configuration and toggles', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, is_public = EXCLUDED.is_public;
