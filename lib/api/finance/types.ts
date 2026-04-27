export interface FinanceBalance {
  currentBalance: number;
  projectedIncome?: number;
  projectedExpenses?: number;
  projectedBalance?: number;
  currency: string;
  updatedAt: string;
}

export interface FinanceBalanceResponse {
  data: FinanceBalance;
  meta: {
    companyId: string;
    requestId: string;
  };
}

export interface FinanceTransaction {
  id: string;
  description: string;
  amount: number;
  finalAmount: number;
  discount: number;
  interest: number;
  type: "payable" | "receivable";
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "pending_authorization"
    | "authorized"
    | "paid"
    | "rejected";
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  supplier?: string;
  entityId?: string;
  costCenter?: {
    id: string;
    name: string;
    code: string;
  };
  costCenterAllocations?: Array<{
    costCenterId: string;
    costCenterName: string;
    percentage: number;
    amount: number;
  }>;
  installments?: {
    current: number;
    total: number;
    groupId: string;
  };
  recurrence?: {
    isRecurring: boolean;
    frequency: string;
  };
  requestOrigin?: {
    type: string;
    name: string;
  };
  notes?: string;
  reconciled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTransactionsResponse {
  data: FinanceTransaction[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    companyId: string;
    requestId: string;
    dateRange?: {
      startDate: string;
      endDate: string;
      isDefault: boolean;
    };
  };
}

export interface FinanceBudget {
  costCenter: {
    id: string;
    name: string;
    code: string;
  };
  year: number;
  budgetAmount: number;
  consumed: number;
  remaining: number;
  consumedPercentage: number;
  monthlyBreakdown: Array<{
    month: string;
    consumed: number;
  }>;
  status: "on_track" | "warning" | "critical" | "over_budget" | "no_budget";
}

export interface FinanceBudgetsResponse {
  data: FinanceBudget[];
  meta: {
    companyId: string;
    year: number;
    requestId: string;
  };
}

export interface FinanceCostCenter {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  budget: number;
  budgetYear: number;
  children: FinanceCostCenter[];
}

export interface FinanceCostCentersResponse {
  data: FinanceCostCenter[];
  meta: {
    companyId: string;
    requestId: string;
  };
}

export interface FinanceSummary {
  year: number;
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  monthly: Array<{
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

export interface FinanceSummaryResponse {
  data: FinanceSummary;
  meta: {
    companyId: string;
    requestId: string;
  };
}
