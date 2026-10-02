-- ==============================================================================
-- SAM CODES // COMMAND CENTER — PHASE 1 HARDENING & SECURITY ENHANCEMENTS
-- Migration: 20260906_harden_security.sql
-- Target: Supabase / PostgreSQL 17
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA HARDENING & DATA CONSTRAINTS
-- ------------------------------------------------------------------------------

-- Add is_public flag to site_settings to prevent leaking administrative configurations
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- Hardened Constraints on Inquiries (prevent spam, oversized payloads, invalid emails)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inquiries_name_len') THEN
    ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_name_len CHECK (length(trim(name)) >= 1 AND length(name) <= 150);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inquiries_message_len') THEN
    ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_message_len CHECK (length(trim(message)) >= 3 AND length(message) <= 5000);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inquiries_email_format') THEN
    ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inquiries_service_len') THEN
    ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_service_len CHECK (length(service_requested) <= 150);
  END IF;
END $$;

-- Hardened Constraints on Projects & Content
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_projects_title_len') THEN
    ALTER TABLE projects ADD CONSTRAINT chk_projects_title_len CHECK (length(trim(title)) >= 1 AND length(title) <= 200);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_projects_slug_format') THEN
    ALTER TABLE projects ADD CONSTRAINT chk_projects_slug_format CHECK (slug ~ '^[a-z0-9-]+$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_capabilities_title_len') THEN
    ALTER TABLE capabilities ADD CONSTRAINT chk_capabilities_title_len CHECK (length(trim(title)) >= 1 AND length(title) <= 200);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_services_title_len') THEN
    ALTER TABLE services ADD CONSTRAINT chk_services_title_len CHECK (length(trim(title)) >= 1 AND length(title) <= 200);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_admin_email_format') THEN
    ALTER TABLE admin_users ADD CONSTRAINT chk_admin_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. HIGH-PERFORMANCE QUERY INDEXES
-- ------------------------------------------------------------------------------

-- Projects query performance
CREATE INDEX IF NOT EXISTS idx_projects_status_created ON projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Inquiries triage and filtering
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at DESC);

-- Audit logs performance and entity lookup
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Content ordering indexes
CREATE INDEX IF NOT EXISTS idx_capabilities_order ON capabilities(order_index);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_exploring_visible ON exploring_topics(is_visible, order_index);
CREATE INDEX IF NOT EXISTS idx_milestones_visible ON milestones(is_visible, status);
CREATE INDEX IF NOT EXISTS idx_assistant_status ON assistant_knowledge(status, order_index);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) TIGHTENING
-- ------------------------------------------------------------------------------

-- Ensure function has fixed search path to avoid search-path injection
ALTER FUNCTION is_admin() SET search_path = public;

-- Drop legacy unconstrained insert policies
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON inquiries;
DROP POLICY IF EXISTS "Anyone can log an analytics event" ON analytics_events;
DROP POLICY IF EXISTS "Public site settings are viewable by everyone" ON site_settings;

-- Public Inquiries: public can submit only if status is strictly 'NEW', private_notes is NULL, and payload length is reasonable
CREATE POLICY "Public can submit clean inquiry" ON inquiries
  FOR INSERT WITH CHECK (
    status = 'NEW' AND
    private_notes IS NULL AND
    length(message) >= 3 AND
    length(message) <= 5000 AND
    length(name) >= 1 AND
    length(name) <= 150
  );

-- Public Analytics: restricted to bounded strings to prevent unbounded spam
CREATE POLICY "Public can log analytics event" ON analytics_events
  FOR INSERT WITH CHECK (
    length(event_name) > 0 AND
    length(event_name) <= 100 AND
    length(session_id) >= 1 AND
    length(session_id) <= 100
  );

-- Public Site Settings: restricted strictly to public configuration keys
CREATE POLICY "Public can view public site settings" ON site_settings
  FOR SELECT USING (is_public = true);
