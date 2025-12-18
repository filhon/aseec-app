-- ASEEC App - Database Schema Migration
-- Generated: 2024-12-17
-- Description: Initial schema for missionary project management system

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE project_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE project_extension AS ENUM ('parcial', 'completo');
CREATE TYPE post_type AS ENUM ('history', 'testimonial', 'acknowledgment', 'report', 'update', 'general');
CREATE TYPE attachment_type AS ENUM ('image', 'video', 'document');
CREATE TYPE reaction_type AS ENUM ('like', 'prayer');
CREATE TYPE favorite_type AS ENUM ('project', 'entity');
CREATE TYPE ai_message_role AS ENUM ('user', 'assistant');

-- =============================================================================
-- PROFILES (Auth Extension)
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ENTITIES
-- =============================================================================

CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  bank_name TEXT,
  bank_agency TEXT,
  bank_account TEXT,
  pix_key TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entities_slug ON entities(slug);
CREATE INDEX idx_entities_active ON entities(active);

-- =============================================================================
-- CATEGORIES
-- =============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT, -- Hex color for display (e.g., #3B82F6)
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial data
INSERT INTO categories (name, slug, color) VALUES
  ('Educação', 'educacao', '#3B82F6'),
  ('Saúde', 'saude', '#10B981'),
  ('Infraestrutura', 'infraestrutura', '#F59E0B'),
  ('Social', 'social', '#8B5CF6'),
  ('Evangelismo', 'evangelismo', '#EC4899');

CREATE INDEX idx_categories_slug ON categories(slug);

-- =============================================================================
-- PROJECTS
-- =============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic data
  title TEXT NOT NULL,
  description TEXT,
  responsible TEXT NOT NULL,

  -- Relationships
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,

  -- Location (via OSM autocomplete)
  country TEXT,
  state TEXT,
  municipality TEXT,
  address TEXT,
  street TEXT,
  number TEXT,
  neighborhood TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Status and type
  status project_status NOT NULL DEFAULT 'pendente',
  extension project_extension NOT NULL DEFAULT 'parcial',

  -- Financial
  requested_value DECIMAL(15, 2),
  approved_value DECIMAL(15, 2),
  investment DECIMAL(15, 2) DEFAULT 0,

  -- Dates
  start_date DATE,
  end_date DATE,
  last_visit DATE,

  -- Metadata
  indication TEXT,
  observations TEXT,
  thanked BOOLEAN DEFAULT FALSE,
  reached_people INTEGER DEFAULT 0,
  featured_image_url TEXT,

  -- External financial API link
  financial_project_id TEXT,
  financial_last_sync TIMESTAMPTZ,

  -- Soft delete
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_projects_entity ON projects(entity_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_location ON projects(latitude, longitude);
CREATE INDEX idx_projects_active ON projects(active);
CREATE INDEX idx_projects_country ON projects(country);

-- =============================================================================
-- PROJECT CATEGORIES (Many-to-Many)
-- =============================================================================

CREATE TABLE project_categories (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (project_id, category_id)
);

CREATE INDEX idx_project_categories_category ON project_categories(category_id);

-- =============================================================================
-- PROJECT TAGS
-- =============================================================================

CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (project_id, tag)
);

CREATE INDEX idx_project_tags_tag ON project_tags(tag);

-- =============================================================================
-- PROJECT INVESTMENTS (Manual data until 2025)
-- =============================================================================

CREATE TABLE project_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year <= 2025),
  value DECIMAL(15, 2) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, year)
);

CREATE INDEX idx_project_investments_project ON project_investments(project_id);
CREATE INDEX idx_project_investments_year ON project_investments(year);

-- =============================================================================
-- PROJECT POSTS (Feed/Mural)
-- =============================================================================

CREATE TABLE project_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  type post_type NOT NULL DEFAULT 'general',
  title TEXT,
  content TEXT NOT NULL,

  -- Author
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,

  -- Audit log metadata (JSON with old_value/new_value)
  metadata JSONB,

  -- Counters (denormalized for performance)
  likes_count INTEGER DEFAULT 0,
  prayers_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Soft delete
  active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_posts_project ON project_posts(project_id);
CREATE INDEX idx_project_posts_created ON project_posts(created_at DESC);
CREATE INDEX idx_project_posts_active ON project_posts(active);
CREATE INDEX idx_project_posts_type ON project_posts(type);

-- =============================================================================
-- POST ATTACHMENTS
-- =============================================================================

CREATE TABLE post_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES project_posts(id) ON DELETE CASCADE,
  title TEXT,
  type attachment_type NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_attachments_post ON post_attachments(post_id);

-- =============================================================================
-- PROJECT ATTACHMENTS (General, not tied to posts)
-- =============================================================================

CREATE TABLE project_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type attachment_type NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_attachments_project ON project_attachments(project_id);

-- =============================================================================
-- POST COMMENTS
-- =============================================================================

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES project_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);

-- =============================================================================
-- POST REACTIONS
-- =============================================================================

CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES project_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type reaction_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, type)
);

CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);

-- =============================================================================
-- USER FAVORITES
-- =============================================================================

CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type favorite_type NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);

-- =============================================================================
-- AI CONVERSATIONS (aseecIA)
-- =============================================================================

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated from first message

  -- Optional context (e.g., conversation about a specific project)
  context_type TEXT, -- 'project', 'entity', 'general'
  context_id UUID,   -- ID of project/entity if applicable

  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_updated ON ai_conversations(updated_at DESC);

-- =============================================================================
-- AI MESSAGES
-- =============================================================================

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role ai_message_role NOT NULL,
  content TEXT NOT NULL,

  -- Optional metadata (tokens used, model, etc)
  metadata JSONB,

  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON ai_messages(created_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Public read (active records only)
CREATE POLICY "Public read active" ON projects FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON project_posts FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON entities FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON post_attachments FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON project_attachments FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON post_comments FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON project_tags FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON project_categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read active" ON project_investments FOR SELECT USING (active = TRUE);

-- Write access: editor and admin
CREATE POLICY "Editor insert" ON projects FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

CREATE POLICY "Editor update" ON projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

CREATE POLICY "Editor insert" ON project_posts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

-- Admin full access (including inactive records)
CREATE POLICY "Admin full access" ON projects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin full access" ON categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin full access" ON entities FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Own reactions and favorites
CREATE POLICY "Own reactions" ON post_reactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Own favorites" ON user_favorites FOR ALL USING (user_id = auth.uid());

-- Own comments insert
CREATE POLICY "Own comments insert" ON post_comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- AI Conversations: own only
CREATE POLICY "Own conversations" ON ai_conversations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Own messages" ON ai_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid()
  ));

-- Profile read (own)
CREATE POLICY "Own profile read" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Own profile update" ON profiles FOR UPDATE USING (id = auth.uid());

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('project-images', 'project-images', true),
  ('post-attachments', 'post-attachments', true),
  ('entity-icons', 'entity-icons', true),
  ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Public read for project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Public read for post attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-attachments');

CREATE POLICY "Public read for entity icons"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'entity-icons');

CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('project-images', 'post-attachments', 'entity-icons', 'documents')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated update own files"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner)
  WITH CHECK (bucket_id IN ('project-images', 'post-attachments', 'entity-icons', 'documents'));

CREATE POLICY "Authenticated delete own files"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner AND bucket_id IN ('project-images', 'post-attachments', 'entity-icons', 'documents'));
