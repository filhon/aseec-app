import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AIConversation } from "@/lib/types/database.types";

export interface ConversationListItem {
  id: string;
  title: string;
  context_type: string | null;
  updated_at: string;
  preview: string;
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Fetch conversations ordered by most recent activity
  const { data: conversationsRaw, error } = await supabase
    .from("ai_conversations")
    .select("id, title, context_type, updated_at")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const conversations = (conversationsRaw ?? []) as Pick<
    AIConversation,
    "id" | "title" | "context_type" | "updated_at"
  >[];

  // Fetch the last message content for each conversation (for preview)
  const items: ConversationListItem[] = await Promise.all(
    conversations.map(async (conv) => {
      const { data: lastMsgRaw } = await supabase
        .from("ai_messages")
        .select("content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const lastMsg = lastMsgRaw as { content: string } | null;
      const preview = lastMsg?.content
        ? lastMsg.content.slice(0, 80).replace(/\n/g, " ") +
          (lastMsg.content.length > 80 ? "..." : "")
        : (conv.title ?? "");

      return {
        id: conv.id,
        title: conv.title ?? "Conversa sem título",
        context_type: conv.context_type,
        updated_at: conv.updated_at,
        preview,
      };
    }),
  );

  return NextResponse.json(items);
}

export async function DELETE() {
  // Soft-delete all conversations for the user (new chat reset)
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
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
