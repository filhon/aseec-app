"use server";

import { financeApi } from "@/lib/api/finance/client";
import { FinanceTransaction } from "@/lib/api/finance/types";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

export interface AggregatedTransaction {
    id: string; // Using the first transaction's ID or a unique hash
    description: string;
    provider: string; // The specific provider/entity from the transactions
    totalAmount: number;
    transactionCount: number;
    dates: string[];
    costCenterCode?: string;
}

// Cost centers allowed for project sync: CC-OFERTAS and all its children.
// Passed directly to the API via the costCenterCodes parameter (v1.1).
const SYNC_COST_CENTER_CODES = [
    "CC-OFERTAS",
    "CC-CAPELOWSKI",
    "CC-CONST",
    "CC-CUIDADO",
    "CC-EDUC",
    "CC-MISER",
    "CC-MISNAC",
    "CC-MISTRANS",
    "CC-PROJSOC",
    "CC-SAUDE",
] as const;

/** Retry a function up to `maxRetries` times with exponential backoff. */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 1000): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            const isServerError = err instanceof Error && /5\d{2}/.test(err.message);
            if (!isServerError || attempt === maxRetries) break;
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.warn(`[Sync] Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`, err);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw lastError;
}

// Fetches ALL transactions from SYNC_COST_CENTER_CODES via the API's
// costCenterCodes + allDates parameters, then groups them by description.
async function fetchAndGroupTransactions() {
    const costCenterCodesParam = SYNC_COST_CENTER_CODES.join(",");
    console.log(`[Sync] Using costCenterCodes filter: ${costCenterCodesParam}`);

    // Single paginated pass: costCenterCodes filters at the API level,
    // allDates=true removes date range restrictions, so we get EVERYTHING.
    const transactions: FinanceTransaction[] = [];
    let currentPage = 1;
    const PAGE_LIMIT = 100;
    const MAX_PAGES = 200; // Safety cap (up to 20,000 transactions)
    let hasNext = true;

    while (hasNext && currentPage <= MAX_PAGES) {
        try {
            const txResponse = await withRetry(() => financeApi.getTransactions({
                page: currentPage,
                limit: PAGE_LIMIT,
                costCenterCodes: costCenterCodesParam,
                allDates: true,
                sortBy: "dueDate",
                sortOrder: "asc"
            }));

            const txs = txResponse.data || [];
            transactions.push(...txs);

            hasNext = txResponse.pagination?.hasNext ?? false;
            currentPage++;

            // Log progress for large datasets
            if (currentPage % 10 === 0) {
                console.log(`[Sync] Progress: ${transactions.length} transactions fetched so far (page ${currentPage - 1})...`);
            }
        } catch (err) {
            console.error(`[Sync] Error fetching page ${currentPage}:`, err);
            break;
        }
    }

    console.log(`[Sync] Total transactions fetched: ${transactions.length} across ${currentPage - 1} pages`);

    // Safety filter: discard any transactions from non-allowed cost centers.
    // This is a temporary safeguard until the API's costCenterCodes filtering
    // is fully confirmed. Can be removed once validated.
    const allowedCodesSet = new Set<string>(SYNC_COST_CENTER_CODES);
    const filteredTransactions = transactions.filter(t => {
        const code = t.costCenter?.code;
        return code && allowedCodesSet.has(code);
    });

    if (filteredTransactions.length < transactions.length) {
        console.warn(`[Sync] Client-side filter removed ${transactions.length - filteredTransactions.length} transactions with non-allowed cost centers`);
    }

    // Group transactions by description
    const groupedData: Record<string, AggregatedTransaction> = {};
    let filteredByType = 0;

    for (const t of filteredTransactions) {
        if (t.type !== "payable") {
            filteredByType++;
            continue;
        }

        let desc = t.description?.trim() || "Sem descrição";

        // Remove installment numbers like (1/12), (02/12), etc.
        desc = desc.replace(/\s*\(\d+\/\d+\)\s*$/, "").trim();

        if (!groupedData[desc]) {
            groupedData[desc] = {
                id: t.id,
                description: desc,
                provider: t.supplier || "Desconhecido",
                totalAmount: 0,
                transactionCount: 0,
                dates: [],
                costCenterCode: t.costCenter?.code
            };
        }

        groupedData[desc].totalAmount += t.amount || 0;
        groupedData[desc].transactionCount += 1;
        if (t.dueDate) {
            groupedData[desc].dates.push(t.dueDate);
        }
    }

    console.log(`[Sync] Filtered out: ${filteredByType} non-payable transactions`);
    console.log(`[Sync] Grouped into ${Object.keys(groupedData).length} projects`);

    return Object.values(groupedData);
}

// Cache fetching all payloads heavily, we only refresh cache 
// occasionally (every 5 mins). The user saves tons of API requests.
const getCachedAggregatedTransactions = unstable_cache(
    fetchAndGroupTransactions,
    ['aggregated-sync-transactions-v15'],
    { revalidate: 300 } // Cache lifespan: 5 minutes
);

export async function fetchAggregatedTransactions(page = 1, limit = 10): Promise<{ data: AggregatedTransaction[], total: number, error?: string }> {
    try {
        const aggregatedArray = await getCachedAggregatedTransactions();

        // Now we must filter out those already imported in `projects` (matching financial_project_id == group.id or matching title/description)
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Try to get all projects that have financial source linked
        const { data: existingProjects } = await supabase
            .from('projects')
            .select('financial_project_id, title')
            .not('financial_project_id', 'is', null);

        const importedIds = new Set((existingProjects || []).map(p => p.financial_project_id));
        const importedTitles = new Set((existingProjects || []).map(p => p.title.toLowerCase()));

        const newProjects = aggregatedArray.filter(g =>
            !importedIds.has(g.id) &&
            !importedTitles.has(g.description.toLowerCase())
        );

        // Manual Pagination of grouped results
        const totalItems = newProjects.length;
        const startIndex = (page - 1) * limit;
        const paginatedArray = newProjects.slice(startIndex, startIndex + limit);

        return {
            data: paginatedArray,
            total: totalItems
        };
    } catch (error) {
        console.error("Error fetching aggregated transactions:", error);
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        const isApiError = message.includes("Finance API Error") || message.includes("cost centers endpoint failed");
        return {
            data: [],
            total: 0,
            error: isApiError
                ? "O sistema financeiro está temporariamente indisponível. Tente novamente em alguns minutos."
                : "Erro ao buscar transações financeiras."
        };
    }
}

export async function searchFinanceProjects(query: string): Promise<{ results: FinanceTransaction[], alreadyLinkedCount: number }> {
    try {
        if (!query || query.length < 2) return { results: [], alreadyLinkedCount: 0 };

        const costCenterCodesParam = SYNC_COST_CENTER_CODES.join(",");

        const result = await financeApi.getTransactions({
            search: query,
            limit: 100, // Busca ampla para garantir as parcelas a agrupar
            costCenterCodes: costCenterCodesParam,
            allDates: true,
        });

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: existingProjects } = await supabase
            .from('projects')
            .select('financial_project_id')
            .not('financial_project_id', 'is', null);

        const importedIds = new Set((existingProjects || []).map(p => p.financial_project_id));

        const groupedData: Record<string, FinanceTransaction & { _allIds: string[] }> = {};

        for (const t of result.data || []) {
            if (t.type !== "payable") continue;

            let desc = t.description?.trim() || "Sem descrição";
            // Remove the installment occurrences: (1/12), (2/10), etc
            desc = desc.replace(/\s*\(\d+\/\d+\)\s*$/, "").trim();

            if (!groupedData[desc]) {
                groupedData[desc] = {
                    ...t,
                    description: desc,
                    amount: 0, // Resetting the amount to sum later
                    _allIds: []
                };
            }
            groupedData[desc].amount += (t.amount || 0);
            groupedData[desc]._allIds.push(t.id);
        }

        const finalResults: FinanceTransaction[] = [];
        let alreadyLinkedCount = 0;

        for (const group of Object.values(groupedData)) {
            const isImported = group._allIds.some(id => importedIds.has(id));
            if (isImported) {
                alreadyLinkedCount++;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _allIds, ...rest } = group;
                finalResults.push(rest);
            }
        }

        return {
            results: finalResults.slice(0, 50),
            alreadyLinkedCount
        };
    } catch (error) {
        console.error("[Sync API] Error searching finance projects:", error);
        return { results: [], alreadyLinkedCount: 0 };
    }
}

export async function getProjectPaidAmount(financialProjectId?: string | null): Promise<number> {
    if (!financialProjectId) return 0;
    try {
        const txResponse = await financeApi.getTransaction(financialProjectId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tx = (txResponse as any).data || txResponse;
        if (!tx) return 0;

        let desc = tx.description?.trim() || "";
        desc = desc.replace(/\s*\(\d+\/\d+\)\s*$/, "").trim();

        if (!desc) return 0;

        const result = await financeApi.getTransactions({
            search: desc,
            costCenterCodes: SYNC_COST_CENTER_CODES.join(","),
            allDates: true,
            limit: 100
        });

        let paidTotal = 0;
        for (const t of result.data || []) {
            if (t.type !== 'payable') continue;
            let tDesc = t.description?.trim() || "";
            tDesc = tDesc.replace(/\s*\(\d+\/\d+\)\s*$/, "").trim();

            if (tDesc.toLowerCase() === desc.toLowerCase() && t.status?.toLowerCase() === 'paid') {
                paidTotal += (t.amount || 0);
            }
        }
        return paidTotal;
    } catch (e) {
        console.error("Failed to fetch paid investment", e);
        return 0;
    }
}
