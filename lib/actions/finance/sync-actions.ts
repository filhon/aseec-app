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
const SYNC_COST_CENTER_CODES = new Set([
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
]);

// Internally fetches transactions from SYNC_COST_CENTER_CODES, filtering
// at the API level via costCenterIds, then groups them by description.
async function fetchAndGroupTransactions() {
    // Step 1: Resolve cost center codes → IDs via the cost centers endpoint
    let allCostCenters: { id: string; name: string; code: string }[] = [];
    try {
        // Try flat list first (simpler, more reliable)
        const costCentersResponse = await financeApi.getCostCenters();
        allCostCenters = (costCentersResponse.data || []).map(cc => ({
            id: cc.id, name: cc.name, code: cc.code
        }));

        // If flat list returned nothing, try with hierarchy and flatten
        if (allCostCenters.length === 0) {
            const hierarchicalResponse = await financeApi.getCostCenters(true);
            allCostCenters = flattenCostCenters(hierarchicalResponse.data || []);
        }
    } catch (err) {
        console.error("[Sync] Failed to fetch cost centers:", err);
        throw new Error("[Sync] Cannot resolve cost center IDs — cost centers endpoint failed");
    }

    console.log(`[Sync] Fetched ${allCostCenters.length} cost centers. Codes: ${allCostCenters.map(c => c.code).join(", ")}`);

    const relevantIds = allCostCenters
        .filter(cc => SYNC_COST_CENTER_CODES.has(cc.code))
        .map(cc => cc.id);

    if (relevantIds.length === 0) {
        console.warn("[Sync] No matching cost center IDs found for codes:", [...SYNC_COST_CENTER_CODES]);
        console.warn("[Sync] Available codes:", allCostCenters.map(c => c.code));
        return [];
    }

    // The API supports up to 10 IDs at once — we have exactly 10, perfect fit.
    const costCenterIdsParam = relevantIds.join(",");
    console.log(`[Sync] Resolved ${relevantIds.length} cost center IDs: ${costCenterIdsParam}`);


    // Step 2: Fetch transactions filtered by cost centers (API-level filter)
    const transactions: FinanceTransaction[] = [];
    const seenIds = new Set<string>();
    const currentYear = new Date().getFullYear();

    // Iterate year by year to avoid max date range limits from external APIs.
    // Go back 3 years to ensure older installments are not missed.
    for (let year = currentYear - 3; year <= currentYear + 2; year++) {
        let currentPage = 1;
        const PAGE_LIMIT = 100;
        const MAX_PAGES = 50; // Safety cap per year
        let hasNext = true;
        let yearCount = 0;

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        while (hasNext && currentPage <= MAX_PAGES) {
            try {
                const txResponse = await financeApi.getTransactions({
                    page: currentPage,
                    limit: PAGE_LIMIT,
                    startDate,
                    endDate,
                    costCenterIds: costCenterIdsParam,
                    sortBy: "dueDate",
                    sortOrder: "asc"
                });

                const txs = txResponse.data || [];

                // Deduplicate: transactions at year boundaries could appear in overlapping queries
                for (const tx of txs) {
                    if (!seenIds.has(tx.id)) {
                        seenIds.add(tx.id);
                        transactions.push(tx);
                    }
                }

                yearCount += txs.length;
                hasNext = txResponse.pagination?.hasNext ?? false;
                currentPage++;
            } catch (err) {
                console.warn(`[Sync] Error fetching year ${year}, page ${currentPage}`, err);
                break;
            }
        }
        console.log(`[Sync] Year ${year}: fetched ${yearCount} transactions across ${currentPage - 1} pages`);
    }

    console.log(`[Sync] Total unique transactions fetched: ${transactions.length}`);

    // ── Diagnostic: log transactions matching "Suzilane" to debug missing installment ──
    const DEBUG_KEYWORD = "Suzilane";
    const debugMatches = transactions.filter(t =>
        t.description?.toLowerCase().includes(DEBUG_KEYWORD.toLowerCase())
    );
    console.log(`[Sync][DEBUG] Transactions matching "${DEBUG_KEYWORD}": ${debugMatches.length}`);
    for (const dm of debugMatches) {
        console.log(`[Sync][DEBUG]   id=${dm.id} | desc="${dm.description}" | type=${dm.type} | cc=${dm.costCenter?.code ?? "NULL"} | due=${dm.dueDate} | amount=${dm.amount}`);
    }

    // Step 3: Group transactions by description (cost center filter already applied by API)
    const groupedData: Record<string, AggregatedTransaction> = {};
    let filteredByType = 0;

    for (const t of transactions) {
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

    console.log(`[Sync] Filtered out: ${filteredByType} by type`);
    console.log(`[Sync] Grouped into ${Object.keys(groupedData).length} projects`);

    // Log projects with less than 12 installments for debugging
    for (const [desc, group] of Object.entries(groupedData)) {
        if (group.transactionCount < 12 && group.transactionCount >= 10) {
            console.log(`[Sync][WARN] "${desc}" has only ${group.transactionCount} installments. Dates: ${group.dates.sort().join(", ")}`);
        }
    }

    return Object.values(groupedData);
}

type CostCenterNode = { id: string; name: string; code: string; children?: CostCenterNode[] };

/** Flatten a hierarchical cost center tree into a flat array */
function flattenCostCenters(centers: CostCenterNode[]): { id: string; name: string; code: string }[] {
    const result: { id: string; name: string; code: string }[] = [];
    for (const cc of centers) {
        result.push({ id: cc.id, name: cc.name, code: cc.code });
        if (cc.children && cc.children.length > 0) {
            result.push(...flattenCostCenters(cc.children));
        }
    }
    return result;
}

// Cache fetching all payloads heavily, we only refresh cache 
// occasionally (every 5 mins). The user saves tons of API requests.
const getCachedAggregatedTransactions = unstable_cache(
    fetchAndGroupTransactions,
    ['aggregated-sync-transactions-v12'],
    { revalidate: 300 } // Cache lifespan: 5 minutes
);

export async function fetchAggregatedTransactions(page = 1, limit = 10): Promise<{ data: AggregatedTransaction[], total: number }> {
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
        return { data: [], total: 0 };
    }
}
