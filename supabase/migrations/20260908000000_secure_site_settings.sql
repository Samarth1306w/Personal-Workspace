-- ==============================================================================
-- SAM CODES // COMMAND CENTER — SECURE SITE SETTINGS & DEFAULT PRIVACY
-- Migration: 20260908000000_secure_site_settings.sql
-- ==============================================================================

-- 1. Ensure is_public column exists and strictly defaults to false
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE site_settings ALTER COLUMN is_public SET DEFAULT false;

-- 2. Ensure Row Level Security is active on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop any legacy permissive policies and enforce that only public keys are viewable
DROP POLICY IF EXISTS "Public site settings are viewable by everyone" ON site_settings;
DROP POLICY IF EXISTS "Public can view public site settings" ON site_settings;

CREATE POLICY "Public can view public site settings" ON site_settings
  FOR SELECT USING (is_public = true);

-- 4. Restrict all sensitive/private tokens and credentials to is_public = false
-- (Secures WhatsApp auth sessions, LinkedIn tokens, Twitter tokens, Reddit tokens, Telegram config)
UPDATE site_settings
SET is_public = false
WHERE is_public IS NULL OR key NOT IN ('site_config', 'capabilities', 'global_settings');

-- 5. Explicitly allow public access ONLY for genuine public site configuration
UPDATE site_settings
SET is_public = true
WHERE key IN ('site_config', 'capabilities', 'global_settings');
