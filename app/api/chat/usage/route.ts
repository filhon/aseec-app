import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database.types";

const TOKEN_LIMITS: Record<UserRole, number> = {
  admin: 100_000,
  editor: 50_000,
  director: 50_000,
  user: 20_000,
};

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role: UserRole =
    (profileRaw as { role: UserRole } | null)?.role ?? "user";
  const limit = TOKEN_LIMITS[role];

  const today = new Date().toISOString().split("T")[0];
  const { data: usageRaw } = await supabase
    .from("api_usage")
    .select("tokens_used, tokens_limit, request_count")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  const usage = usageRaw as {
    tokens_used: number;
    tokens_limit: number;
    request_count: number;
  } | null;
  const tokensUsed = usage?.tokens_used ?? 0;
  const tokensLimit = usage?.tokens_limit ?? limit;

  return NextResponse.json({
    used: tokensUsed,
    limit: tokensLimit,
    percentage: Math.min(100, Math.round((tokensUsed / tokensLimit) * 100)),
    requests: usage?.request_count ?? 0,
  });
}
