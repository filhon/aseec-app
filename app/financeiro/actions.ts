"use server";

import { financeApi } from "@/lib/api/finance/client";
import { Transaction } from "@/components/financeiro/data";
import { FinanceTransaction } from "@/lib/api/finance/types";
import { format, addDays } from "date-fns";
import { unstable_cache } from "next/cache";

export interface CostCenterBudget {
  id: string;
  name: string;
  budget: number;
  used: number;
}

// Map from external API to Frontend format
function mapTransaction(t: FinanceTransaction): Transaction {
  // Map the API status to the frontend status type
  const statusMap: Record<string, Transaction["status"]> = {
    draft: "draft",
    pending_approval: "pending",
    approved: "approved",
    pending_authorization: "pending",
    authorized: "authorized",
    paid: "paid",
    rejected: "rejected",
  };

  return {
    id: t.id,
    description: t.description || t.notes || "Transação sem descrição",
    date: t.dueDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    amount: t.amount,
    type: t.type === "payable" ? "expense" : "revenue",
    costCenterId: t.costCenter?.id || "",
    status: statusMap[t.status] || "pending",
  };
}

// Inner fetching function (not exported directly, instead we export a cached version wrapper)
async function fetchDashboardData(
  startDate: string,
  endDate: string,
  year: number,
) {
  // Each endpoint is called independently so a single failure doesn't
  // bring down the entire dashboard.
  const transactions: Transaction[] = [];
  let costCenters: CostCenterBudget[] = [];
  const metrics = {
    currentBalance: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    predictedBalance: 0,
  };

  // 1. Transactions — fetch ALL pages
  try {
    let page = 1;
    const PAGE_LIMIT = 100;
    const MAX_PAGES = 20; // safety cap to avoid infinite loops
    let hasNext = true;

    while (hasNext && page <= MAX_PAGES) {
      const txResponse = await financeApi.getTransactions({
        page,
        limit: PAGE_LIMIT,
        startDate,
        endDate,
        sortBy: "dueDate",
        sortOrder: "asc",
      });

      transactions.push(...txResponse.data.map(mapTransaction));
      hasNext = txResponse.pagination?.hasNext ?? false;
      page++;
    }
  } catch (err) {
    console.warn(
      "[Financeiro] Falha ao buscar transações:",
      err instanceof Error ? err.message : err,
    );
  }

  // 2. Budgets / Cost Centers
  try {
    const budgetsResp = await financeApi.getBudgets(year);
    costCenters = budgetsResp.data.map((b) => ({
      id: b.costCenter.id,
      name: b.costCenter.name,
      budget: b.budgetAmount,
      used: b.consumed,
    }));
  } catch (err) {
    console.warn(
      "[Financeiro] Falha ao buscar orçamentos:",
      err instanceof Error ? err.message : err,
    );
  }

  // 3. Balance
  try {
    const balanceResp = await financeApi.getBalance(true);
    metrics.currentBalance = balanceResp.data.currentBalance;
    metrics.predictedBalance =
      balanceResp.data.projectedBalance || balanceResp.data.currentBalance;
  } catch (err) {
    console.warn(
      "[Financeiro] Falha ao buscar saldo:",
      err instanceof Error ? err.message : err,
    );
  }

  // 4. Financial Summary (known to return 500 on the external API sometimes)
  try {
    const summaryResp = await financeApi.getFinancialSummary(year);
    metrics.totalRevenue = summaryResp.data.totals.income;
    metrics.totalExpenses = summaryResp.data.totals.expenses;
  } catch (err) {
    console.warn(
      "[Financeiro] Falha ao buscar resumo financeiro:",
      err instanceof Error ? err.message : err,
    );
  }

  return {
    success: true,
    transactions,
    costCenters,
    metrics,
  };
}

// Create a cached version of the fetch function.
// This caches the API responses for 60 seconds based on the arguments (dates).
const getCachedDashboardData = unstable_cache(
  fetchDashboardData,
  ["finance-dashboard-data"],
  { revalidate: 60 }, // Cache lifespan in seconds
);

// Final exported server action: resolves the query params and invokes the cached fetcher
export async function getDashboardData(options?: {
  startDate?: string;
  endDate?: string;
}) {
  const today = new Date();
  // Default: past 30 days to future 90 days if nothing is provided
  const defaultStart = format(addDays(today, -30), "yyyy-MM-dd");
  const defaultEnd = format(addDays(today, 90), "yyyy-MM-dd");

  // Resolve dates
  const startDate = options?.startDate || defaultStart;
  const endDate = options?.endDate || defaultEnd;
  const year = today.getFullYear();

  // Call the fast, cached layer
  return getCachedDashboardData(startDate, endDate, year);
}
