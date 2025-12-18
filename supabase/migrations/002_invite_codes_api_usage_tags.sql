-- ASEEC App - Schema Update: Invite Codes, API Usage, and Tags
-- Generated: 2024-12-18
-- Description: Additional tables for invite codes, API usage tracking, and manageable tags

-- =============================================================================
-- INVITE CODES
-- =============================================================================

CREATE TYPE invite_code_status AS ENUM ('pending', 'used', 'expired');

CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status invite_code_status NOT NULL DEFAULT 'pending',
  
  -- Usage tracking
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  used_by_email TEXT, -- Store email even if profile is deleted
  used_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Created by
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Soft delete
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_status ON invite_codes(status);
CREATE INDEX idx_invite_codes_created_by ON invite_codes(created_by);

-- =============================================================================
-- API USAGE (Per User Daily Limit)
-- =============================================================================

CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Token tracking
  tokens_used INTEGER NOT NULL DEFAULT 0,
  tokens_limit INTEGER NOT NULL DEFAULT 1000, -- Configurable per user
  
  -- Request count (optional)
  request_count INTEGER NOT NULL DEFAULT 0,
  
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_api_usage_user ON api_usage(user_id);
CREATE INDEX idx_api_usage_date ON api_usage(date);

-- =============================================================================
-- TAGS (Manageable with Color)
-- =============================================================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280', -- Default gray
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial data
INSERT INTO tags (name, slug, color) VALUES
  ('Urgente', 'urgente', '#EF4444'),
  ('Em andamento', 'em-andamento', '#3B82F6'),
  ('Concluído', 'concluido', '#10B981'),
  ('Prioritário', 'prioritario', '#F59E0B'),
  ('Reforma', 'reforma', '#8B5CF6'),
  ('Saúde', 'saude', '#EC4899');

CREATE INDEX idx_tags_slug ON tags(slug);

-- =============================================================================
-- PROJECT TAGS (Updated to reference tags table)
-- =============================================================================

-- Drop old project_tags and recreate with foreign key
DROP TABLE IF EXISTS project_tags;

CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

CREATE INDEX idx_project_tags_project ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag ON project_tags(tag_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
-- project_tags already has RLS from first migration

-- Invite codes: Admin only for management
CREATE POLICY "Admin manage invite codes" ON invite_codes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- API usage: Users can see their own
CREATE POLICY "Own usage read" ON api_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Own usage update" ON api_usage FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System insert usage" ON api_usage FOR INSERT WITH CHECK (user_id = auth.uid());

-- Tags: Public read, admin manage
CREATE POLICY "Public read active tags" ON tags FOR SELECT USING (active = TRUE);
CREATE POLICY "Admin manage tags" ON tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Project tags: Public read active
CREATE POLICY "Public read active project tags" ON project_tags FOR SELECT USING (active = TRUE);
CREATE POLICY "Editor manage project tags" ON project_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));
