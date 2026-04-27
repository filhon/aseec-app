import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AIMessage } from "@/lib/types/database.types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Verify the conversation belongs to the user (RLS also enforces this)
  const { data: convRaw } = await supabase
    .from("ai_conversations")
    .select("id, title, context_type")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (!convRaw) {
    return NextResponse.json(
      { error: "Conversa não encontrada." },
      { status: 404 },
    );
  }

  const { data: messagesRaw } = await supabase
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  const messages = (messagesRaw ?? []) as Pick<
    AIMessage,
    "id" | "role" | "content" | "created_at"
  >[];

  return NextResponse.json({ conversation: convRaw, messages });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await supabase
    .from("ai_conversations")
    .update({ active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
