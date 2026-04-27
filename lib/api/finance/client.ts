import crypto from "crypto";
import https from "https";
import {
  FinanceBalanceResponse,
  FinanceTransactionsResponse,
  FinanceBudgetsResponse,
  FinanceCostCentersResponse,
  FinanceSummaryResponse,
  FinanceTransaction,
} from "./types";

/**
 * Makes an HTTPS GET request using node:https, bypassing Next.js's patched fetch.
 * Next.js patches globalThis.fetch with caching/revalidation logic that can
 * interfere with HMAC-signed requests (stale timestamps, re-encoded URLs, etc.).
 */
function httpsGet(
  url: string,
  headers: Record<string, string>,
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ status: res.statusCode || 0, body: data });
      });
    });

    req.on("error", (err) => reject(err));
    req.end();
  });
}

export class FinanceAPIClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.FINANCE_API_KEY || "";
    this.secretKey = process.env.FINANCE_API_SECRET || "";

    let url = process.env.FINANCE_API_URL || "";
    if (url.endsWith("/api/v1")) {
      url = url.replace(/\/api\/v1$/, "");
    }
    this.baseUrl = url.replace(/\/$/, "");

    if (!this.apiKey || !this.secretKey || !this.baseUrl) {
      console.warn(
        "Finance API credentials are not set in environment variables.",
      );
    }
  }

  private sign(method: string, path: string) {
    // Doc: "O PATH deve ser exatamente o path sem query params e sem trailing slash."
    let urlPath = path.split("?")[0];
    if (urlPath.endsWith("/")) {
      urlPath = urlPath.slice(0, -1);
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyHash = crypto.createHash("sha256").update("").digest("hex");
    const payload = `${method}\n${urlPath}\n${timestamp}\n${bodyHash}`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(payload)
      .digest("hex");

    return { timestamp, signature };
  }

  async request<T>(
    method: string,
    path: string,
    queryParams: Record<string, string | number | boolean | undefined> = {},
  ): Promise<T> {
    // Build query string manually with URL Encoding for safety
    const queryParts: string[] = [];
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        queryParts.push(
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
        );
      }
    });

    let finalPath = path;
    if (queryParts.length > 0) {
      finalPath = `${path}?${queryParts.join("&")}`;
    }

    // Sign with clean path only (no query string)
    const { timestamp, signature } = this.sign(method, path);
    const urlStr = `${this.baseUrl}${finalPath}`;

    const headers: Record<string, string> = {
      "X-API-Key": this.apiKey,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "Content-Type": "application/json",
    };

    // Use node:https directly to avoid Next.js fetch patching
    const { status, body } = await httpsGet(urlStr, headers);

    if (status < 200 || status >= 300) {
      let msg = body;
      try {
        const parsed = JSON.parse(body);
        msg = parsed.error?.message || body;
      } catch {
        /* use raw body */
      }
      throw new Error(`Finance API Error ${status}: ${msg}`);
    }

    return JSON.parse(body) as T;
  }

  // ── Convenience methods ──

  async getBalance(includeProjected = false): Promise<FinanceBalanceResponse> {
    return this.request<FinanceBalanceResponse>("GET", "/api/v1/balance", {
      includeProjected,
    });
  }

  async getTransactions(
    filters: {
      page?: number;
      limit?: number;
      type?: "payable" | "receivable";
      status?: string;
      startDate?: string;
      endDate?: string;
      allDates?: boolean;
      costCenterId?: string;
      costCenterIds?: string; // Comma-separated list of cost center IDs (max 10). Takes priority over costCenterId.
      costCenterCodes?: string; // Comma-separated list of cost center codes (max 10). Highest priority — overrides costCenterIds and costCenterId.
      entityId?: string;
      minAmount?: number;
      maxAmount?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ): Promise<FinanceTransactionsResponse> {
    return this.request<FinanceTransactionsResponse>(
      "GET",
      "/api/v1/transactions",
      filters,
    );
  }

  async getTransaction(id: string): Promise<FinanceTransaction> {
    return this.request<FinanceTransaction>(
      "GET",
      `/api/v1/transactions/${id}`,
    );
  }

  async searchTransactions(filters: {
    q: string;
    limit?: number;
    type?: "payable" | "receivable";
    status?: string;
    startDate?: string;
    endDate?: string;
    allDates?: boolean;
    costCenterId?: string;
    costCenterIds?: string;
    costCenterCodes?: string;
  }): Promise<{
    data: FinanceTransaction[];
    meta: {
      companyId: string;
      requestId: string;
      totalResults: number;
      scannedDocuments: number;
      scanCapped: boolean;
    };
  }> {
    return this.request("GET", "/api/v1/transactions/search", filters);
  }

  async getBudgets(
    year?: number,
    costCenterId?: string,
  ): Promise<FinanceBudgetsResponse> {
    return this.request<FinanceBudgetsResponse>("GET", "/api/v1/budgets", {
      year,
      costCenterId,
    });
  }

  async getCostCenters(
    includeHierarchy = false,
  ): Promise<FinanceCostCentersResponse> {
    return this.request<FinanceCostCentersResponse>(
      "GET",
      "/api/v1/cost-centers",
      { includeHierarchy },
    );
  }

  async getFinancialSummary(
    year?: number,
    startMonth?: string,
    endMonth?: string,
  ): Promise<FinanceSummaryResponse> {
    return this.request<FinanceSummaryResponse>(
      "GET",
      "/api/v1/financial-summary",
      { year, startMonth, endMonth },
    );
  }
}

// Singleton for application-wide use
export const financeApi = new FinanceAPIClient();
