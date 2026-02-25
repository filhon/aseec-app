"use server";

import { financeApi } from "@/lib/api/finance/client";
import { Transaction } from "@/components/financeiro/data";
import { FinanceTransaction } from "@/lib/api/finance/types";
import { format, addDays } from "date-fns";

export interface CostCenterBudget {
    id: string;
    name: string;
    budget: number;
    used: number;
}

// Map from external API to Frontend format
function mapTransaction(t: FinanceTransaction): Transaction {
    return {
        id: t.id,
        description: t.description || t.notes || "Transação sem descrição",
        date: t.dueDate?.split("T")[0] || new Date().toISOString().split("T")[0],
        amount: t.amount,
        type: t.type === "payable" ? "expense" : "revenue",
        costCenterId: t.costCenter?.id || "",
        status: t.status === "paid" ? "paid" : "pending"
    };
}

export async function getDashboardData(options?: { startDate?: string; endDate?: string }) {
    const today = new Date();
    const defaultStart = format(addDays(today, -30), "yyyy-MM-dd");
    const defaultEnd = format(addDays(today, 90), "yyyy-MM-dd");
    const startDate = options?.startDate || defaultStart;
    const endDate = options?.endDate || defaultEnd;
    const year = today.getFullYear();

    // Each endpoint is called independently so a single failure doesn't
    // bring down the entire dashboard.
    let transactions: Transaction[] = [];
    let costCenters: CostCenterBudget[] = [];
    const metrics = {
        currentBalance: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        predictedBalance: 0,
    };

    // 1. Transactions
    try {
        const txResponse = await financeApi.getTransactions({
            limit: 100,
            startDate,
            endDate,
            sortBy: "dueDate",
            sortOrder: "asc"
        });
        transactions = txResponse.data.map(mapTransaction);
    } catch (err) {
        console.warn("[Financeiro] Falha ao buscar transações:", err instanceof Error ? err.message : err);
    }

    // 2. Budgets / Cost Centers
    try {
        const budgetsResp = await financeApi.getBudgets(year);
        costCenters = budgetsResp.data.map(b => ({
            id: b.costCenter.id,
            name: b.costCenter.name,
            budget: b.budgetAmount,
            used: b.consumed
        }));
    } catch (err) {
        console.warn("[Financeiro] Falha ao buscar orçamentos:", err instanceof Error ? err.message : err);
    }

    // 3. Balance
    try {
        const balanceResp = await financeApi.getBalance(true);
        metrics.currentBalance = balanceResp.data.currentBalance;
        metrics.predictedBalance = balanceResp.data.projectedBalance || balanceResp.data.currentBalance;
    } catch (err) {
        console.warn("[Financeiro] Falha ao buscar saldo:", err instanceof Error ? err.message : err);
    }

    // 4. Financial Summary (known to return 500 on the external API sometimes)
    try {
        const summaryResp = await financeApi.getFinancialSummary(year);
        metrics.totalRevenue = summaryResp.data.totals.income;
        metrics.totalExpenses = summaryResp.data.totals.expenses;
    } catch (err) {
        console.warn("[Financeiro] Falha ao buscar resumo financeiro:", err instanceof Error ? err.message : err);
    }

    return {
        success: true,
        transactions,
        costCenters,
        metrics,
    };
}
