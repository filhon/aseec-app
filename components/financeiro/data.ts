
import { mockDashboardProjects } from "@/components/dashboard/data"

export interface CashFlowData {
    date: string
    revenue: number
    expenses: number
    balance: number
}

export interface FinancialMetric {
    label: string
    value: number
    trend: number // percentage change
    status: 'positive' | 'negative' | 'neutral'
}

export interface SimulatedExpense {
    amount: number
    installments: number
    startDate: Date
}

// Helper to generate dates
const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

// Generate Mock Cash Flow Data (Past 30 days + Future 60 days)
export interface CostCenter {
    id: string
    name: string
    budget: number
}

export interface Transaction {
    id: string
    description: string
    date: string
    amount: number
    type: 'revenue' | 'expense'
    costCenterId: string
    projectId?: string
    status: 'pending' | 'paid'
}

export const mockCostCenters: CostCenter[] = [
    { id: 'cc1', name: 'Administrativo', budget: 500000 },
    { id: 'cc2', name: 'Projetos', budget: 2000000 },
    { id: 'cc3', name: 'Marketing', budget: 300000 },
    { id: 'cc4', name: 'TI', budget: 400000 },
    { id: 'cc5', name: 'RH', budget: 250000 },
]

// Determine if a date is a weekend
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

// Generate Mock Transactions (Past 30 days + Future 90 days)
export const generateMockTransactions = (): Transaction[] => {
    const transactions: Transaction[] = []
    const today = new Date()
    
    // Generate transactions for past 30 days and future 90 days
    for (let i = -30; i <= 90; i++) {
        const date = addDays(today, i)
        const dateStr = date.toISOString().split('T')[0]
        
        if (isWeekend(date)) continue;

        // Daily Revenue Chance
        if (Math.random() > 0.6) {
            transactions.push({
                id: `rev-${i}`,
                description: `Receita Operacional - ${dateStr}`,
                date: dateStr,
                amount: Math.floor(Math.random() * 20000) + 5000,
                type: 'revenue',
                costCenterId: 'cc2', // Most revenue from Projects
                projectId: mockDashboardProjects[Math.floor(Math.random() * mockDashboardProjects.length)].id,
                status: i <= 0 ? 'paid' : 'pending'
            })
        }

        // Daily Expense Chance
        if (Math.random() > 0.4) {
            const cc = mockCostCenters[Math.floor(Math.random() * mockCostCenters.length)]
            transactions.push({
                id: `exp-${i}`,
                description: `Despesa ${cc.name} - Material de Escritório`,
                date: dateStr,
                amount: Math.floor(Math.random() * 3000) + 100,
                type: 'expense',
                costCenterId: cc.id,
                status: i <= 0 ? 'paid' : 'pending'
            })
        }

        // Specific Monthly Bills
        if (date.getDate() === 5) {
             transactions.push({
                id: `payroll-${i}`,
                description: 'Folha de Pagamento',
                date: dateStr,
                amount: 150000,
                type: 'expense',
                costCenterId: 'cc5', // RH
                status: i <= 0 ? 'paid' : 'pending'
            })
        }
    }
    
    return transactions
}

export const mockTransactions = generateMockTransactions()

// Calculate Cash Flow Data based on Transactions
export const calculateCashFlowFromTransactions = (transactions: Transaction[], initialBalance: number = 1250000): CashFlowData[] => {
    const data: CashFlowData[] = []
    const today = new Date()
    let currentBalance = initialBalance
    
    // Create map of days for O(1) lookup or just iterate days
    // Iterating days is cleaner to ensure continuity
    const transactionMap = new Map<string, { revenue: number, expenses: number }>()
    
    transactions.forEach(t => {
        const existing = transactionMap.get(t.date) || { revenue: 0, expenses: 0 }
        if (t.type === 'revenue') existing.revenue += t.amount
        else existing.expenses += t.amount
        transactionMap.set(t.date, existing)
    })

    // Sort dates? No, we need continuous timeline
    // Range: -30 to +90 from today

    
    // Backtrack to find balance at day -30
    let balanceAtStart = initialBalance
    for (let i = 0; i >= -30; i--) {
         const date = addDays(today, i)
         const dateStr = date.toISOString().split('T')[0]
         const dayData = transactionMap.get(dateStr) || { revenue: 0, expenses: 0 }
         
         // If today is index 0, balance today includes today's transactions? 
         // Let's assume initialBalance is "Balance at beginning of today" (before today's txs) or "End of today"?
         // Usually "Current Balance" is accurate as of now.
         // Let's assume it's "End of Today".
         
         // Balance[i-1] = Balance[i] - Revenue[i] + Expenses[i]
         balanceAtStart = balanceAtStart - dayData.revenue + dayData.expenses
    }
    
    // Now simulate forward
    currentBalance = balanceAtStart
    for (let i = -30; i <= 90; i++) {
        const date = addDays(today, i)
        const dateStr = date.toISOString().split('T')[0]
        const dayData = transactionMap.get(dateStr) || { revenue: 0, expenses: 0 }
        
        currentBalance = currentBalance + dayData.revenue - dayData.expenses
        
        data.push({
            date: dateStr,
            revenue: dayData.revenue,
            expenses: dayData.expenses,
            balance: currentBalance
        })
    }

    return data
}


export const mockFinancialMetrics = {
    currentBalance: 1250000,
    totalRevenue: 4500000,
    totalExpenses: 3250000,
    predictedBalance: 1380000 // Predicted in 30 days
}

export const getProjectFinancials = () => mockDashboardProjects.map(project => ({
    ...project,
    totalBudget: project.investment,
    spent: project.investment * (Math.random() * 0.8), // Random spent amount
    lastTransaction: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
}))

