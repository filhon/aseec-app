import { NextRequest, NextResponse } from "next/server";
import { syncProjectInvestmentsFromApi } from "@/lib/actions/finance/sync-actions";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel sends the secret in the Authorization header: "Bearer <secret>"
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

// Called by Vercel Cron (GET)
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync();
}

// Called manually by the button in the financeiro page (POST)
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured, allow unauthenticated POST (development fallback)
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return runSync();
}

async function runSync() {
  try {
    const result = await syncProjectInvestmentsFromApi();
    console.log("[Cron] sync-investments result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Cron] sync-investments error:", error);
    return NextResponse.json(
      { error: "Falha ao sincronizar investimentos" },
      { status: 500 },
    );
  }
}
