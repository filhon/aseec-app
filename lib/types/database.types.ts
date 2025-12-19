/**
 * ASEEC App - Database Types
 * 
 * These types are manually created based on the database schema.
 * For production, generate types using: npx supabase gen types typescript
 */

// =============================================================================
// ENUMS
// =============================================================================

export type ProjectStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
export type ProjectExtension = 'parcial' | 'completo';
export type PostType = 'history' | 'testimonial' | 'acknowledgment' | 'report' | 'update' | 'general';
export type AttachmentType = 'image' | 'video' | 'document';
export type ReactionType = 'like' | 'prayer';
export type FavoriteType = 'project' | 'entity';
export type AIMessageRole = 'user' | 'assistant';
export type UserRole = 'admin' | 'editor' | 'director' | 'user';

// =============================================================================
// BASE TYPES
// =============================================================================

interface BaseEntity {
  id: string;
  active: boolean;
  created_at: string;
}

interface TimestampedEntity extends BaseEntity {
  updated_at: string;
}

// =============================================================================
// PROFILES
// =============================================================================

export interface Profile extends TimestampedEntity {
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
}

// =============================================================================
// ENTITIES
// =============================================================================

export interface Entity extends TimestampedEntity {
  name: string;
  slug: string;
  icon_url: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  bank_name: string | null;
  bank_agency: string | null;
  bank_account: string | null;
  pix_key: string | null;
}

// =============================================================================
// CATEGORIES
// =============================================================================

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
}

export interface ProjectCategory {
  project_id: string;
  category_id: string;
  active: boolean;
}

// =============================================================================
// PROJECTS
// =============================================================================

export interface Project extends TimestampedEntity {
  title: string;
  description: string | null;
  responsible: string;
  
  // Relationships
  entity_id: string | null;
  
  // Location
  country: string | null;
  state: string | null;
  municipality: string | null;
  address: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  
  // Status
  status: ProjectStatus;
  extension: ProjectExtension;
  
  // Financial
  requested_value: number | null;
  approved_value: number | null;
  investment: number | null;
  
  // Dates
  start_date: string | null;
  end_date: string | null;
  last_visit: string | null;
  
  // Metadata
  indication: string | null;
  observations: string | null;
  thanked: boolean;
  reached_people: number;
  featured_image_url: string | null;
  
  // External API
  financial_project_id: string | null;
  financial_last_sync: string | null;
  
  created_by: string | null;
}

// Extended project with relationships
export interface ProjectWithRelations extends Project {
  entity?: Entity | null;
  categories?: Category[];
  tags?: string[];
  investments?: ProjectInvestment[];
  posts?: ProjectPost[];
  attachments?: ProjectAttachment[];
}

// =============================================================================
// PROJECT TAGS
// =============================================================================

export interface ProjectTag {
  project_id: string;
  tag_id: string;
  active: boolean;
  created_at: string;
}

// =============================================================================
// PROJECT INVESTMENTS (Manual, until 2025)
// =============================================================================

export interface ProjectInvestment extends BaseEntity {
  project_id: string;
  year: number;
  value: number;
  description: string | null;
}

// =============================================================================
// INVITE CODES
// =============================================================================

export type InviteCodeStatus = 'pending' | 'used' | 'expired';

export interface InviteCode extends BaseEntity {
  code: string;
  status: InviteCodeStatus;
  invited_name: string | null;
  invited_email: string | null;
  used_at: string | null;
  expires_at: string;
  created_by: string | null;
}

// =============================================================================
// API USAGE (Per User Daily)
// =============================================================================

export interface APIUsage {
  id: string;
  user_id: string;
  date: string;
  tokens_used: number;
  tokens_limit: number;
  request_count: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// TAGS (Manageable)
// =============================================================================

export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  color: string;
  description: string | null;
}

// =============================================================================
// PROJECT POSTS
// =============================================================================

export interface AuditMetadata {
  field: string;
  old_value: unknown;
  new_value: unknown;
  changed_at: string;
}

export interface ProjectPost extends TimestampedEntity {
  project_id: string;
  type: PostType;
  title: string | null;
  content: string;
  
  // Author
  author_id: string | null;
  author_name: string;
  author_role: string | null;
  
  // Audit log
  metadata: AuditMetadata | null;
  
  // Counters
  likes_count: number;
  prayers_count: number;
  comments_count: number;
}

export interface PostWithRelations extends ProjectPost {
  attachments?: PostAttachment[];
  comments?: PostComment[];
  user_reacted?: boolean;
  user_prayed?: boolean;
}

// =============================================================================
// ATTACHMENTS
// =============================================================================

export interface PostAttachment extends BaseEntity {
  post_id: string;
  title: string | null;
  type: AttachmentType;
  url: string;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
}

export interface ProjectAttachment extends BaseEntity {
  project_id: string;
  title: string;
  type: AttachmentType;
  url: string;
  storage_path: string | null;
  file_size: number | null;
  mime_type: string | null;
}

// =============================================================================
// POST COMMENTS
// =============================================================================

export interface PostComment extends BaseEntity {
  post_id: string;
  author_id: string | null;
  author_name: string;
  content: string;
}

// =============================================================================
// POST REACTIONS
// =============================================================================

export interface PostReaction extends BaseEntity {
  post_id: string;
  user_id: string;
  type: ReactionType;
}

// =============================================================================
// USER FAVORITES
// =============================================================================

export interface UserFavorite extends BaseEntity {
  user_id: string;
  item_id: string;
  item_type: FavoriteType;
  title: string;
  subtitle: string | null;
}

// =============================================================================
// AI CONVERSATIONS
// =============================================================================

export interface AIConversation extends TimestampedEntity {
  user_id: string;
  title: string | null;
  context_type: string | null;
  context_id: string | null;
}

export interface AIMessage extends BaseEntity {
  conversation_id: string;
  role: AIMessageRole;
  content: string;
  metadata: Record<string, unknown> | null;
}

export interface AIConversationWithMessages extends AIConversation {
  messages: AIMessage[];
}

// =============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      entities: {
        Row: Entity;
        Insert: Omit<Entity, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Entity, 'id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id'>>;
      };
      project_posts: {
        Row: ProjectPost;
        Insert: Omit<ProjectPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProjectPost, 'id'>>;
      };
      project_investments: {
        Row: ProjectInvestment;
        Insert: Omit<ProjectInvestment, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectInvestment, 'id'>>;
      };
      post_attachments: {
        Row: PostAttachment;
        Insert: Omit<PostAttachment, 'id' | 'created_at'>;
        Update: Partial<Omit<PostAttachment, 'id'>>;
      };
      project_attachments: {
        Row: ProjectAttachment;
        Insert: Omit<ProjectAttachment, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectAttachment, 'id'>>;
      };
      post_comments: {
        Row: PostComment;
        Insert: Omit<PostComment, 'id' | 'created_at'>;
        Update: Partial<Omit<PostComment, 'id'>>;
      };
      post_reactions: {
        Row: PostReaction;
        Insert: Omit<PostReaction, 'id' | 'created_at'>;
        Update: Partial<Omit<PostReaction, 'id'>>;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: Omit<UserFavorite, 'id' | 'created_at'>;
        Update: Partial<Omit<UserFavorite, 'id'>>;
      };
      ai_conversations: {
        Row: AIConversation;
        Insert: Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIConversation, 'id'>>;
      };
      ai_messages: {
        Row: AIMessage;
        Insert: Omit<AIMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<AIMessage, 'id'>>;
      };
      invite_codes: {
        Row: InviteCode;
        Insert: Omit<InviteCode, 'id' | 'created_at'>;
        Update: Partial<Omit<InviteCode, 'id'>>;
      };
      api_usage: {
        Row: APIUsage;
        Insert: Omit<APIUsage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<APIUsage, 'id'>>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'>;
        Update: Partial<Omit<Tag, 'id'>>;
      };
    };
    Enums: {
      project_status: ProjectStatus;
      project_extension: ProjectExtension;
      post_type: PostType;
      attachment_type: AttachmentType;
      reaction_type: ReactionType;
      favorite_type: FavoriteType;
      ai_message_role: AIMessageRole;
      invite_code_status: InviteCodeStatus;
    };
  };
}
