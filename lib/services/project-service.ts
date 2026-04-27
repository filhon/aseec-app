import { createClient } from "@/lib/supabase/client";
import type {
  Project,
  ProjectWithRelations,
  Entity,
  Category,
  ProjectPost,
  ProjectInvestment,
} from "@/lib/types/database.types";

// =============================================================================
// Types for service responses
// =============================================================================

export interface ProjectLocation {
  id: string;
  title: string;
  responsible: string;
  address: string;
  lat: number;
  lng: number;
  type: "blue" | "green";
  latestImage?: string;
}

export interface DashboardProject extends Project {
  institution: string;
  category: string;
  tags: string[];
  investmentByYear: { year: number; value: number }[];
  feed?: ProjectPost[];
}

export interface ProjectStats {
  totalProjects: number;
  totalInvestment: number;
  projectsByStatus: Record<string, number>;
  projectsByCountry: Record<string, { count: number; investment: number }>;
  projectsByCategory: Record<string, number>;
  reachedPeople: number;
}

// =============================================================================
// Client-side Project Service
// =============================================================================

/**
 * Get all projects with optional filters (client-side)
 */
export async function getProjects(filters?: {
  status?: string;
  country?: string;
  entityId?: string;
  search?: string;
  limit?: number;
}): Promise<Project[]> {
  const supabase = createClient();

  let query = supabase
    .from("projects")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.country) {
    query = query.eq("country", filters.country);
  }
  if (filters?.entityId) {
    query = query.eq("entity_id", filters.entityId);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,responsible.ilike.%${filters.search}%,municipality.ilike.%${filters.search}%`,
    );
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single project by ID with all relations
 */
export async function getProjectById(
  id: string,
): Promise<ProjectWithRelations | null> {
  const supabase = createClient();

  // Get the project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (projectError || !project) {
    console.error("Error fetching project:", projectError);
    return null;
  }

  // Get entity if exists
  let entity: Entity | null = null;
  if (project.entity_id) {
    const { data: entityData } = await supabase
      .from("entities")
      .select("*")
      .eq("id", project.entity_id)
      .single();
    entity = entityData;
  }

  // Get categories
  const { data: categoryLinks } = await supabase
    .from("project_categories")
    .select("category_id")
    .eq("project_id", id)
    .eq("active", true);

  let categories: Category[] = [];
  if (categoryLinks && categoryLinks.length > 0) {
    const categoryIds = categoryLinks.map((c) => c.category_id);
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .in("id", categoryIds);
    categories = categoriesData || [];
  }

  // Get tags
  const { data: tagsData } = await supabase
    .from("project_tags")
    .select("tags(name)")
    .eq("project_id", id)
    .eq("active", true);

  const tags =
    (tagsData
      ?.map((t: { tags: { name: string } | { name: string }[] | null }) =>
        Array.isArray(t.tags) ? t.tags[0]?.name : t.tags?.name,
      )
      .filter(Boolean) as string[]) || [];

  // Get investments
  const { data: investmentsData } = await supabase
    .from("project_investments")
    .select("*")
    .eq("project_id", id)
    .eq("active", true)
    .order("year", { ascending: true });

  // Get posts
  const { data: postsData } = await supabase
    .from("project_posts")
    .select("*")
    .eq("project_id", id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  return {
    ...project,
    entity,
    categories,
    tags,
    investments: investmentsData || [],
    posts: postsData || [],
  };
}

/**
 * Get projects formatted for map display
 */
export async function getProjectsForMap(): Promise<ProjectLocation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, responsible, address, latitude, longitude, status, featured_image_url",
    )
    .eq("active", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) {
    console.error("Error fetching projects for map:", error);
    return [];
  }

  return (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    responsible: p.responsible,
    address: p.address || "",
    lat: p.latitude!,
    lng: p.longitude!,
    type: p.status === "concluido" ? "green" : "blue",
    latestImage: p.featured_image_url || undefined,
  }));
}

/**
 * Get projects formatted for dashboard display
 */
export async function getProjectsForDashboard(): Promise<DashboardProject[]> {
  const supabase = createClient();

  // Get all projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (!projects || projects.length === 0) return [];

  // Get all entities in one query
  const entityIds = [
    ...new Set(projects.filter((p) => p.entity_id).map((p) => p.entity_id!)),
  ];
  const entitiesMap: Record<string, Entity> = {};
  if (entityIds.length > 0) {
    const { data: entities } = await supabase
      .from("entities")
      .select("*")
      .in("id", entityIds);
    entities?.forEach((e) => {
      entitiesMap[e.id] = e;
    });
  }

  // Get all categories for projects
  const projectIds = projects.map((p) => p.id);
  const { data: categoryLinks } = await supabase
    .from("project_categories")
    .select("project_id, category_id")
    .in("project_id", projectIds)
    .eq("active", true);

  // Get category details
  const categoryIds = [
    ...new Set(categoryLinks?.map((c) => c.category_id) || []),
  ];
  const categoriesMap: Record<string, Category> = {};
  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .in("id", categoryIds);
    categories?.forEach((c) => {
      categoriesMap[c.id] = c;
    });
  }

  // Build project-to-category mapping
  const projectCategoryMap: Record<string, string> = {};
  categoryLinks?.forEach((link) => {
    if (
      !projectCategoryMap[link.project_id] &&
      categoriesMap[link.category_id]
    ) {
      projectCategoryMap[link.project_id] =
        categoriesMap[link.category_id].name;
    }
  });

  // Get all tags for projects
  const { data: tagsData } = await supabase
    .from("project_tags")
    .select("project_id, tags(name)")
    .in("project_id", projectIds)
    .eq("active", true);

  const projectTagsMap: Record<string, string[]> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tagsData?.forEach((t: any) => {
    if (!projectTagsMap[t.project_id]) projectTagsMap[t.project_id] = [];
    if (t.tags?.name) {
      projectTagsMap[t.project_id].push(t.tags.name);
    }
  });

  // Get all investments
  const { data: investmentsData } = await supabase
    .from("project_investments")
    .select("*")
    .in("project_id", projectIds)
    .eq("active", true);

  const projectInvestmentsMap: Record<string, ProjectInvestment[]> = {};
  investmentsData?.forEach((inv) => {
    if (!projectInvestmentsMap[inv.project_id])
      projectInvestmentsMap[inv.project_id] = [];
    projectInvestmentsMap[inv.project_id].push(inv);
  });

  return projects.map((p) => ({
    ...p,
    institution:
      p.entity_id && entitiesMap[p.entity_id]
        ? entitiesMap[p.entity_id].name
        : "Sem entidade",
    category: projectCategoryMap[p.id] || "Sem categoria",
    tags: projectTagsMap[p.id] || [],
    investmentByYear: (projectInvestmentsMap[p.id] || [])
      .sort((a, b) => a.year - b.year)
      .map((inv) => ({ year: inv.year, value: Number(inv.value) })),
  }));
}

/**
 * Get project statistics for dashboard
 */
export async function getProjectStats(): Promise<ProjectStats> {
  const projects = await getProjectsForDashboard();

  const stats: ProjectStats = {
    totalProjects: projects.length,
    totalInvestment: projects.reduce(
      (sum, p) => sum + (Number(p.investment) || 0),
      0,
    ),
    projectsByStatus: {},
    projectsByCountry: {},
    projectsByCategory: {},
    reachedPeople: projects.reduce(
      (sum, p) => sum + (p.reached_people || 0),
      0,
    ),
  };

  projects.forEach((p) => {
    // By status
    stats.projectsByStatus[p.status] =
      (stats.projectsByStatus[p.status] || 0) + 1;

    // By country
    const country = p.country || "Desconhecido";
    if (!stats.projectsByCountry[country]) {
      stats.projectsByCountry[country] = { count: 0, investment: 0 };
    }
    stats.projectsByCountry[country].count++;
    stats.projectsByCountry[country].investment += Number(p.investment) || 0;

    // By category
    stats.projectsByCategory[p.category] =
      (stats.projectsByCategory[p.category] || 0) + 1;
  });

  return stats;
}

/**
 * Create a new project
 */
export async function createProject(
  data: Partial<Project>,
  categoryName?: string,
  tags: string[] = [],
  institutionName?: string,
): Promise<Project | null> {
  const supabase = createClient();

  let finalEntityId = data.entity_id;

  if (institutionName && !finalEntityId) {
    const { data: existingEntity } = await supabase
      .from("entities")
      .select("id")
      .eq("name", institutionName)
      .single();

    if (existingEntity) {
      finalEntityId = existingEntity.id;
    } else {
      const { data: newEntity } = await supabase
        .from("entities")
        .insert({
          name: institutionName,
          slug: institutionName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, ""),
          active: true,
        })
        .select()
        .single();
      if (newEntity) {
        finalEntityId = newEntity.id;
      }
    }
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      title: data.title!,
      responsible: data.responsible!,
      description: data.description,
      entity_id: finalEntityId,
      country: data.country,
      state: data.state,
      municipality: data.municipality,
      address: data.address,
      street: data.street,
      number: data.number,
      neighborhood: data.neighborhood,
      zip_code: data.zip_code,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status || "pendente",
      extension: data.extension || "parcial",
      requested_value: data.requested_value,
      approved_value: data.approved_value,
      investment: data.investment || 0,
      start_date: data.start_date,
      end_date: data.end_date,
      indication: data.indication,
      observations: data.observations,
      financial_project_id: data.financial_project_id,
      active: true,
    })
    .select()
    .single();

  if (error || !project) {
    console.error("Error creating project:", error);
    return null;
  }

  // Insert Category Link
  if (categoryName) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single();
    if (cat) {
      const { error: catError } = await supabase
        .from("project_categories")
        .insert({
          project_id: project.id,
          category_id: cat.id,
          active: true,
        });
      if (catError) {
        console.error("Error inserting project_categories:", catError);
      }
    } else {
      console.warn("Category not found for name:", categoryName);
    }
  }

  // Insert tags
  if (tags && tags.length > 0) {
    const { data: dbTags } = await supabase
      .from("tags")
      .select("id")
      .in("name", tags);

    if (dbTags && dbTags.length > 0) {
      const tagsToInsert = dbTags.map((dbTag) => ({
        project_id: project.id,
        tag_id: dbTag.id,
        active: true,
      }));
      const { error: tagsError } = await supabase
        .from("project_tags")
        .insert(tagsToInsert);
      if (tagsError) {
        console.error("Error creating tags:", tagsError);
      }
    }
  }

  return project;
}

/**
 * Get all entities
 */
export async function getEntities(): Promise<Entity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("entities")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("Error fetching entities:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all tags
 */
export async function getTags(): Promise<
  { id: string; name: string; color: string }[]
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all project posts for the global feed
 */
export async function getGlobalProjectPosts() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("project_posts")
    .select(
      `
      *,
      projects (
        id,
        title
      )
    `,
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching global posts:", error);
    return [];
  }

  // Clean up format matching the frontend structure EnrichedPost expects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((post: any) => ({
    id: post.id,
    type: post.type,
    title: post.title || undefined,
    content: post.content,
    author: post.author_name,
    avatar: undefined, // Optional
    role: post.author_role || undefined,
    date: post.created_at,
    likes: post.likes_count,
    prayers: post.prayers_count,
    projectTitle: post.projects?.title || "Projeto Desconhecido",
    projectId: post.project_id,
  }));
}

/**
 * Update project field
 */
export async function updateProject(projectId: string, data: Partial<Project>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .update(data)
    .eq("id", projectId);
  if (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

/**
 * Update project classification (Category, Extension, Tags)
 */
export async function updateProjectClassification(
  projectId: string,
  extension: string,
  categoryName: string,
  tags: string[],
) {
  const supabase = createClient();

  // Update extension
  const { error: extError } = await supabase
    .from("projects")
    .update({ extension })
    .eq("id", projectId);
  if (extError) throw extError;

  // Update Category
  await supabase
    .from("project_categories")
    .delete()
    .eq("project_id", projectId);
  if (categoryName && categoryName !== "Sem categoria") {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single();
    if (cat) {
      await supabase
        .from("project_categories")
        .insert({ project_id: projectId, category_id: cat.id, active: true });
    }
  }

  // Update Tags
  await supabase.from("project_tags").delete().eq("project_id", projectId);
  if (tags && tags.length > 0) {
    const { data: dbTags } = await supabase
      .from("tags")
      .select("id")
      .in("name", tags);
    if (dbTags && dbTags.length > 0) {
      const tagsToInsert = dbTags.map((dbTag) => ({
        project_id: projectId,
        tag_id: dbTag.id,
        active: true,
      }));
      await supabase.from("project_tags").insert(tagsToInsert);
    }
  }
}

/**
 * Update project investments explicitly
 */
export async function updateProjectInvestments(
  projectId: string,
  investments: { year: number; value: number }[],
  approvedValue: number,
  requestedValue: number,
) {
  const supabase = createClient();

  // Update values
  await supabase
    .from("projects")
    .update({
      approved_value: approvedValue,
      requested_value: requestedValue,
      investment: approvedValue,
    })
    .eq("id", projectId);

  // Update history - delete existing then insert new
  await supabase
    .from("project_investments")
    .delete()
    .eq("project_id", projectId);
  if (investments.length > 0) {
    const invsToInsert = investments.map((inv) => ({
      project_id: projectId,
      year: inv.year,
      value: inv.value,
      active: true,
    }));
    await supabase.from("project_investments").insert(invsToInsert);
  }
}

/**
 * Add a post to the feed
 */
export async function addProjectPost(
  projectId: string,
  title: string | undefined,
  content: string,
  type: string = "update",
  authorName: string = "Sistema",
  authorRole: string = "Automático",
  attachments?: Array<{
    title: string;
    type: "image" | "video" | "document";
    url: string;
    originalUrl?: string;
    thumbnailUrl?: string;
  }>,
) {
  const supabase = createClient();
  const newPostData = {
    project_id: projectId,
    type,
    author_name: authorName,
    author_role: authorRole,
    title,
    content,
    active: true,
  };
  const { data, error } = await supabase
    .from("project_posts")
    .insert(newPostData)
    .select()
    .single();
  if (error) {
    console.error("Error adding post:", error);
    throw error;
  }

  // Save attachments if any
  if (data && attachments && attachments.length > 0) {
    const attachmentRows = attachments.map((att) => ({
      post_id: data.id,
      title: att.title,
      type: att.type,
      url: att.url,
      original_url: att.originalUrl || null,
      storage_path: att.thumbnailUrl || null,
      active: true,
    }));
    const { error: attError } = await supabase
      .from("post_attachments")
      .insert(attachmentRows);
    if (attError) {
      console.error("Error saving post attachments:", attError);
    }
  }

  return data;
}

/**
 * Toggle a reaction on a project post
 */
export async function togglePostReaction(
  postId: string,
  type: "like" | "prayer",
  isAdding: boolean,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (isAdding) {
    // Add reaction

    await supabase
      .from("post_reactions")
      .insert({ post_id: postId, user_id: user.id, type: type as string });
  } else {
    // Remove reaction

    await supabase
      .from("post_reactions")
      .delete()
      .match({ post_id: postId, user_id: user.id, type: type as string });
  }

  // Determine counter column name
  const counterCol = type === "like" ? "likes_count" : "prayers_count";

  // Update post counter
  const { data: currentPost } = await supabase
    .from("project_posts")
    .select(counterCol)
    .eq("id", postId)
    .single();
  if (currentPost) {
    const currentCount =
      Number(currentPost[counterCol as keyof typeof currentPost]) || 0;
    const newVal = isAdding ? currentCount + 1 : Math.max(0, currentCount - 1);
    await supabase
      .from("project_posts")
      .update({ [counterCol]: newVal })
      .eq("id", postId);
  }
}

/**
 * Add a comment to a project post
 */
export async function addPostComment(postId: string, content: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Get profile to use as author name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const authorName = profile?.full_name || "Usuário";

  const { data: comment, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      author_name: authorName,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    throw error;
  }

  // Update comments counter
  const { data: currentPost } = await supabase
    .from("project_posts")
    .select("comments_count")
    .eq("id", postId)
    .single();
  if (currentPost) {
    await supabase
      .from("project_posts")
      .update({ comments_count: (currentPost.comments_count || 0) + 1 })
      .eq("id", postId);
  }

  return comment;
}

export async function updatePostComment(commentId: string, content: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: comment, error } = await supabase
    .from("post_comments")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    console.error("Error updating comment:", error);
    throw error;
  }

  return comment;
}

export async function deletePostComment(commentId: string, postId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Soft delete
  const { error } = await supabase
    .from("post_comments")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }

  // Update comments counter
  const { data: currentPost } = await supabase
    .from("project_posts")
    .select("comments_count")
    .eq("id", postId)
    .single();
  if (currentPost) {
    await supabase
      .from("project_posts")
      .update({
        comments_count: Math.max(0, (currentPost.comments_count || 0) - 1),
      })
      .eq("id", postId);
  }

  return true;
}
