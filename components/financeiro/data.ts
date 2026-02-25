
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
// - Uses the real currentBalance from the API
// - Derives timeline from the transaction dates
// - Groups by week when the period exceeds 60 days
export const calculateCashFlowFromTransactions = (
    transactions: Transaction[],
    currentBalance: number = 0
): CashFlowData[] => {
    if (transactions.length === 0) return []

    // 1. Build a map of daily revenue / expenses
    const transactionMap = new Map<string, { revenue: number; expenses: number }>()

    transactions.forEach(t => {
        const existing = transactionMap.get(t.date) || { revenue: 0, expenses: 0 }
        if (t.type === 'revenue') existing.revenue += t.amount
        else existing.expenses += t.amount
        transactionMap.set(t.date, existing)
    })

    // 2. Determine the date range from transactions
    const allDates = transactions.map(t => t.date).sort()
    const minDate = new Date(allDates[0])
    const maxDate = new Date(allDates[allDates.length - 1])

    // 3. Generate continuous daily data points
    const today = new Date()

    // Calculate balance at minDate by working backwards from today's known balance
    // currentBalance is the balance "now" (today).
    // Balance(day) = Balance(day-1) + revenue(day) - expenses(day)
    // So Balance(minDate-1) = currentBalance - Σ(revenue until today) + Σ(expenses until today)
    // Then we simulate forward from there.

    // Sum all transactions from minDate up to today (inclusive)
    let revUpToToday = 0
    let expUpToToday = 0
    for (let d = new Date(minDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dayData = transactionMap.get(dateStr)
        if (dayData) {
            revUpToToday += dayData.revenue
            expUpToToday += dayData.expenses
        }
    }

    // Balance at start (before minDate's transactions) = currentBalance - netUpToToday
    const balanceAtStart = currentBalance - revUpToToday + expUpToToday

    // 4. Build daily data
    const dailyData: CashFlowData[] = []
    let runningBalance = balanceAtStart

    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dayData = transactionMap.get(dateStr) || { revenue: 0, expenses: 0 }
        runningBalance = runningBalance + dayData.revenue - dayData.expenses

        dailyData.push({
            date: dateStr,
            revenue: dayData.revenue,
            expenses: dayData.expenses,
            balance: runningBalance
        })
    }

    // 5. If period > 60 days, group by ISO week
    const diffDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 60) {
        return groupByWeek(dailyData)
    }

    return dailyData
}

// Group daily cash flow data by ISO week
function groupByWeek(dailyData: CashFlowData[]): CashFlowData[] {
    const weeks = new Map<string, CashFlowData>()

    dailyData.forEach(d => {
        const date = new Date(d.date)
        // ISO week: get the Monday of this week as key
        const dayOfWeek = date.getDay() || 7 // 1=Mon ... 7=Sun
        const monday = new Date(date)
        monday.setDate(date.getDate() - dayOfWeek + 1)
        const weekKey = monday.toISOString().split('T')[0]

        const existing = weeks.get(weekKey)
        if (existing) {
            existing.revenue += d.revenue
            existing.expenses += d.expenses
            existing.balance = d.balance // use end-of-week balance (last day wins)
        } else {
            weeks.set(weekKey, { ...d, date: weekKey })
        }
    })

    return Array.from(weeks.values()).sort((a, b) => a.date.localeCompare(b.date))
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

