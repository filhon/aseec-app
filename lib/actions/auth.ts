"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// =============================================================================
// INVITE CODES
// =============================================================================

export async function validateInviteCode(code: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("invite_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();

  if (error || !data) {
    return { success: false, error: "Código inválido" };
  }

  // Check if already used
  if (data.status === "used") {
    return { success: false, error: "Este código já foi utilizado" };
  }

  // Check if expired
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    // Mark as expired in DB
    await supabase
      .from("invite_codes")
      .update({ status: "expired" })
      .eq("id", data.id);
    
    return { success: false, error: "Este código expirou" };
  }

  return {
    success: true,
    code: data.code,
    codeId: data.id,
    invitedName: data.invited_name,
    invitedEmail: data.invited_email,
  };
}

export async function markInviteCodeAsUsed(codeId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("invite_codes")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
    })
    .eq("id", codeId);

  if (error) {
    console.error("Error marking invite code as used:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function generateInviteCode(
  createdBy: string,
  invitedName: string,
  invitedEmail: string
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Generate random 6 character code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Expires in 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      code,
      status: "pending",
      expires_at: expiresAt.toISOString(),
      created_by: createdBy,
      invited_name: invitedName,
      invited_email: invitedEmail,
    })
    .select()
    .single();

  if (error) {
    console.error("Error generating invite code:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true, code: data.code, id: data.id };
}

export async function deleteInviteCode(codeId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Soft delete
  const { error } = await supabase
    .from("invite_codes")
    .update({ active: false })
    .eq("id", codeId);

  if (error) {
    console.error("Error deleting invite code:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function getInviteCodes() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("invite_codes")
    .select("*, created_by_profile:created_by(full_name)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invite codes:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

// =============================================================================
// USER MANAGEMENT
// =============================================================================

export async function getUsers() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

export async function updateUserRole(userId: string, role: "admin" | "editor" | "user") {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Soft delete - just mark as inactive
  const { error } = await supabase
    .from("profiles")
    .update({ active: false })
    .eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/configuracoes");
  return { success: true };
}

// =============================================================================
// AUTH HELPERS
// =============================================================================

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
