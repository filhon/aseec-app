"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// --- CATEGORIES ---

export async function getCategories() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function createCategory(name: string, color?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Generate a simple slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      color: color || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true, data };
}

export async function updateCategory(id: string, name: string, color?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { data, error } = await supabase
    .from("categories")
    .update({ name, slug, color: color || null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true, data };
}

export async function deleteCategory(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Soft delete
  const { error } = await supabase
    .from("categories")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

// --- TAGS ---

export async function getTags() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function createTag(name: string, color?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { data, error } = await supabase
    .from("tags")
    .insert({
      name,
      slug,
      color: color || "#6B7280", // Default gray if empty
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true, data };
}

export async function updateTag(id: string, name: string, color?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { data, error } = await supabase
    .from("tags")
    .update({ name, slug, color: color || "#6B7280" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true, data };
}

export async function deleteTag(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Soft delete
  const { error } = await supabase
    .from("tags")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}
