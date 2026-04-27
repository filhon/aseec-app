import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { financeApi } from "@/lib/api/finance/client";
import { unstable_cache } from "next/cache";

export interface InsightRiskItem {
  id: string;
  title: string;
  type: "project_delay" | "budget_critical" | "budget_over";
  severity: "medium" | "high" | "critical";
  description: string;
  projectId?: string;
}

export interface InsightsProjectItem {
  id: string;
  title: string;
  responsible: string;
  status: string;
  progress: number;
  daysOverdue?: number;
  endDate?: string;
}

export interface InsightsData {
  overview: {
    healthScore: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    totalInvestment: number;
    totalPeopleReached: number;
  };
  finance: {
    currentBalance: number;
    projectedBalance: number | null;
    projectedIncome: number | null;
    projectedExpenses: number | null;
    currency: string;
    yearSummary: { income: number; expenses: number; balance: number } | null;
    topExpenses: {
      description: string;
      amount: number;
      dueDate: string;
      costCenter: string;
    }[];
    criticalBudgets: {
      name: string;
      consumed: number;
      total: number;
      percentage: number;
      status: string;
    }[];
  };
  projects: {
    total: number;
    byStatus: Record<string, number>;
    list: InsightsProjectItem[];
    totalInvestment: number;
    totalPeopleReached: number;
  };
  risks: {
    criticalCount: number;
    items: InsightRiskItem[];
  };
  updatedAt: string;
}

function calcProgress(p: {
  start_date: string | null;
  end_date: string | null;
  status: string;
}): number {
  if (p.status === "concluido") return 100;
  if (!p.start_date || !p.end_date) return 0;
  const start = new Date(p.start_date).getTime();
  const end = new Date(p.end_date).getTime();
  const now = Date.now();
  if (end <= start) return 0;
  if (now >= end) return 99;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

async function fetchInsightsData(
  userId: string,
  supabaseClient: ReturnType<typeof createClient>,
) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentYear = today.getFullYear();

  const [
    projectsResult,
    balanceResult,
    summaryResult,
    transactionsResult,
    budgetsResult,
  ] = await Promise.allSettled([
    supabaseClient
      .from("projects")
      .select(
        "id, title, responsible, status, investment, reached_people, end_date, start_date",
      )
      .eq("active", true),
    financeApi.getBalance(true),
    financeApi.getFinancialSummary(currentYear),
    financeApi.getTransactions({
      type: "payable",
      limit: 100,
    }),
    financeApi.getBudgets(currentYear),
  ]);

  return {
    projectsResult,
    balanceResult,
    summaryResult,
    transactionsResult,
    budgetsResult,
    todayStr,
    today,
    currentYear,
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const getCachedData = unstable_cache(
      () => fetchInsightsData(user.id, supabase),
      ["insights-data", user.id],
      { revalidate: 60 },
    );

    const {
      projectsResult,
      balanceResult,
      summaryResult,
      transactionsResult,
      budgetsResult,
      todayStr,
      today,
    } = await getCachedData();

    // ── Projects ──────────────────────────────────────────────────────────────
    const projects =
      projectsResult.status === "fulfilled"
        ? (projectsResult.value.data ?? [])
        : [];

    const byStatus: Record<string, number> = {};
    let totalInvestment = 0;
    let totalPeopleReached = 0;

    const delayedItems: InsightsProjectItem[] = [];
    const activeItems: InsightsProjectItem[] = [];

    for (const p of projects) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      totalInvestment += Number(p.investment) || 0;
      totalPeopleReached += Number(p.reached_people) || 0;

      const progress = calcProgress(p);
      const item: InsightsProjectItem = {
        id: p.id,
        title: p.title,
        responsible: p.responsible,
        status: p.status,
        progress,
        endDate: p.end_date ?? undefined,
      };

      if (p.status === "em_andamento" && p.end_date && p.end_date < todayStr) {
        const daysOverdue = Math.floor(
          (today.getTime() - new Date(p.end_date).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        delayedItems.push({ ...item, daysOverdue });
      } else if (p.status === "em_andamento") {
        activeItems.push(item);
      }
    }

    // Sort delayed by most overdue first
    delayedItems.sort((a, b) => (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0));
    // Sort active by soonest end_date first
    activeItems.sort((a, b) => {
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return a.endDate.localeCompare(b.endDate);
    });

    // Merged project list: delayed first, then active (max 8)
    const projectList = [...delayedItems, ...activeItems].slice(0, 8);

    const totalProjects = projects.length;
    const activeProjects = byStatus["em_andamento"] || 0;
    const completedProjects = byStatus["concluido"] || 0;
    const cancelledProjects = byStatus["cancelado"] || 0;
    const delayedCount = delayedItems.length;

    const healthScore =
      totalProjects > 0
        ? Math.max(
            0,
            Math.round(
              100 -
                (delayedCount / totalProjects) * 40 -
                (cancelledProjects / totalProjects) * 20,
            ),
          )
        : 100;

    // ── Finance ───────────────────────────────────────────────────────────────
    const balance =
      balanceResult.status === "fulfilled" ? balanceResult.value.data : null;
    const summary =
      summaryResult.status === "fulfilled" ? summaryResult.value.data : null;
    const transactions =
      transactionsResult.status === "fulfilled"
        ? transactionsResult.value.data
        : [];
    const budgets =
      budgetsResult.status === "fulfilled" ? budgetsResult.value.data : [];

    // Sort by amount desc client-side for top expenses
    const topExpenses = [...transactions]
      .sort((a, b) => b.finalAmount - a.finalAmount)
      .slice(0, 5)
      .map((t) => ({
        description: t.description,
        amount: t.finalAmount,
        dueDate: t.dueDate,
        costCenter: t.costCenter?.name || "—",
      }));

    const criticalBudgets = budgets
      .filter((b) => b.status === "critical" || b.status === "over_budget")
      .map((b) => ({
        name: b.costCenter.name,
        consumed: b.consumed,
        total: b.budgetAmount,
        percentage: b.consumedPercentage,
        status: b.status,
      }));

    // ── Risks ─────────────────────────────────────────────────────────────────
    const riskItems: InsightRiskItem[] = [];

    for (const d of delayedItems) {
      riskItems.push({
        id: `delay-${d.id}`,
        title: d.title,
        type: "project_delay",
        severity:
          (d.daysOverdue ?? 0) > 90
            ? "critical"
            : (d.daysOverdue ?? 0) > 30
              ? "high"
              : "medium",
        description: `Atrasado há ${d.daysOverdue} dia${(d.daysOverdue ?? 0) !== 1 ? "s" : ""}. Prazo original: ${new Date(d.endDate!).toLocaleDateString("pt-BR")}.`,
        projectId: d.id,
      });
    }

    for (const b of criticalBudgets) {
      riskItems.push({
        id: `budget-${b.name}`,
        title: b.name,
        type: b.status === "over_budget" ? "budget_over" : "budget_critical",
        severity: b.status === "over_budget" ? "critical" : "high",
        description:
          b.status === "over_budget"
            ? `Orçamento esgotado. Consumo atual: ${b.percentage.toFixed(1)}% do total aprovado.`
            : `Consumo crítico: ${b.percentage.toFixed(1)}% do orçamento utilizado.`,
      });
    }

    const severityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
    };
    riskItems.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
    );

    const criticalRiskCount = riskItems.filter(
      (r) => r.severity === "critical",
    ).length;

    const data: InsightsData = {
      overview: {
        healthScore,
        totalProjects,
        activeProjects,
        completedProjects,
        delayedProjects: delayedCount,
        totalInvestment,
        totalPeopleReached,
      },
      finance: {
        currentBalance: balance?.currentBalance ?? 0,
        projectedBalance: balance?.projectedBalance ?? null,
        projectedIncome: balance?.projectedIncome ?? null,
        projectedExpenses: balance?.projectedExpenses ?? null,
        currency: balance?.currency ?? "BRL",
        yearSummary: summary
          ? {
              income: summary.totals.income,
              expenses: summary.totals.expenses,
              balance: summary.totals.balance,
            }
          : null,
        topExpenses,
        criticalBudgets,
      },
      projects: {
        total: totalProjects,
        byStatus,
        list: projectList,
        totalInvestment,
        totalPeopleReached,
      },
      risks: {
        criticalCount: criticalRiskCount,
        items: riskItems.slice(0, 10),
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/insights] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 },
    );
  }
}
