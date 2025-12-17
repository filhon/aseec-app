"use client"

import { useState, useMemo, useEffect } from "react"
import { FinancialCards } from "@/components/financeiro/financial-cards"
import { CashFlowChart } from "@/components/financeiro/cash-flow-chart"
import { ExpenseSimulator, SimulationResult } from "@/components/financeiro/expense-simulator"
import { FinancialTransactionList } from "@/components/financeiro/transaction-list"
import { 
    mockFinancialMetrics, 
    SimulatedExpense, 
    Transaction, 
    generateMockTransactions, 
    mockCostCenters, 
    calculateCashFlowFromTransactions
} from "@/components/financeiro/data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CostCenterBudgetChart } from "@/components/financeiro/cost-center-budget-chart"
import { Calculator, CalendarIcon, Search, FilterX, Filter } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { DateRange } from "react-day-picker"

export default function FinanceiroPage() {
    // Data State
    const [rawTransactions, setRawTransactions] = useState<Transaction[]>([])
    // const [projects, setProjects] = useState<ReturnType<typeof getProjectFinancials>>([]) // Unused

    // Filter States
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCostCenter, setSelectedCostCenter] = useState<string>("all")
    
    // Default: Next 30 Days
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 30)),
    })
    const [presetName, setPresetName] = useState<string | null>("Próx. 30 Dias")

    // Simulation State
    const [simulatedExpense, setSimulatedExpense] = useState<SimulatedExpense | null>(null)
    
    // Load mock data on mount (Client-side only to avoid hydration mismatch)
    useEffect(() => {
        // eslint-disable-next-line
        setRawTransactions(generateMockTransactions())
        // setProjects(getProjectFinancials()) // Unused
    }, [])

    // 1. Base Transactions (Filtered by Search and Cost Center ONLY)
    // We need this separates so the Chart can calculate the full running balance history correctly
    // before visual slicing.
    const baseTransactions = useMemo(() => {
        let transactions = [...rawTransactions]

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            transactions = transactions.filter(t => {
                const desc = t.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                const ccName = (mockCostCenters.find(c => c.id === t.costCenterId)?.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                return desc.includes(query) || ccName.includes(query)
            })
        }

        // Cost Center Filter
        if (selectedCostCenter !== "all") {
            transactions = transactions.filter(t => t.costCenterId === selectedCostCenter)
        }
        
        return transactions
    }, [searchQuery, selectedCostCenter, rawTransactions])

    // 2. Transaction List Data (Applies Date Filter strongly)
    const filteredTransactionList = useMemo(() => {
        let transactions = [...baseTransactions]

        if (dateRange?.from) {
             const fromStr = format(dateRange.from, 'yyyy-MM-dd')
             transactions = transactions.filter(t => t.date >= fromStr)
        }
        if (dateRange?.to) {
             const toStr = format(dateRange.to, 'yyyy-MM-dd')
             transactions = transactions.filter(t => t.date <= toStr)
        }

        return transactions
    }, [baseTransactions, dateRange])

    // Calculate Full Timeline Chart Data from Base Transactions (ignoring date filter for calculation)
    const fullTimelineChartData = useMemo(() => {
        const cashFlow = calculateCashFlowFromTransactions(baseTransactions)
        return cashFlow
    }, [baseTransactions])

    // Simulation & Final Visual Slicing
    const { finalChartData, currentMetrics, simulationImpact, costCenterData } = useMemo(() => {
        let data = [...fullTimelineChartData]
        let impactMessage: SimulationResult | null = null
        const metrics = { ...mockFinancialMetrics } // Modified to use const as we mutate properties, not the var itself? Wait, we spread it.

        // Metrics should reflect the VIEWED period or the FULL period?
        // Usually KPIs like "Total Revenue" reflect the current filters.
        // So we calculate them from filteredTransactionList.
        const totalRev = filteredTransactionList.filter(t => t.type === 'revenue').reduce((acc, t) => acc + t.amount, 0)
        const totalExp = filteredTransactionList.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
        
        metrics.totalRevenue = totalRev
        metrics.totalExpenses = totalExp

        if (simulatedExpense && data.length > 0) {
            data = data.map(d => ({ ...d }))
            const { amount, installments, startDate } = simulatedExpense
            const installmentAmount = amount / installments
             const installmentDates: string[] = []
            for (let i = 0; i < installments; i++) {
                const date = new Date(startDate)
                date.setMonth(date.getMonth() + i)
                installmentDates.push(date.toISOString().split('T')[0])
            }

            let minBalance = Infinity
            let firstNegativeDate = null
            
            // Track installments detail
            const installmentDetails: { number: number; date: string; amount: number; balanceAfter: number }[] = []

            installmentDates.forEach((payDate, idx) => {
                 let balanceAfter = 0;
                 for (let i = 0; i < data.length; i++) {
                    if (data[i].date >= payDate) {
                        data[i].balance -= installmentAmount
                        if (data[i].date === payDate) {
                            data[i].expenses += installmentAmount
                            balanceAfter = data[i].balance;
                        }
                    }
                    // Fallback if payDate is not in data (should be, as mock covers range)
                    // If payDate > last data date, balance is roughly last balance - amount
                 }
                 
                 // If exact date match captured balanceAfter, use it. Else find closest.
                 const exactDay = data.find(d => d.date === payDate)
                 if (exactDay) {
                     balanceAfter = exactDay.balance
                 } else {
                     // Try finding the closest day after?
                     // Mock transactions are continuous, so exact match is likely.
                 }

                 installmentDetails.push({
                     number: idx + 1,
                     date: payDate,
                     amount: installmentAmount,
                     balanceAfter: balanceAfter
                 })
            })

            for (const d of data) {
                if (d.balance < minBalance) minBalance = d.balance
                if (d.balance < 0 && !firstNegativeDate) firstNegativeDate = d.date
            }

            if (firstNegativeDate) {
                impactMessage = { 
                    type: 'danger' as const, 
                    text: `Atenção: O saldo ficará negativo em ${new Date(firstNegativeDate).toLocaleDateString('pt-BR')}.`,
                    installments: installmentDetails
                }
            } else {
                 impactMessage = { 
                     type: 'success' as const, 
                     text: `Simulação segura. O saldo mínimo será de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(minBalance)}.`,
                     installments: installmentDetails
                 }
            }
             const todayIndex = data.findIndex(d => d.date === new Date().toISOString().split('T')[0])
             if (todayIndex !== -1 && todayIndex + 30 < data.length) {
                metrics.predictedBalance = data[todayIndex + 30].balance
             }
        }
        
        // FINALLY: Slice the chart data for display based on Date Range
        if (dateRange?.from) {
             const fromStr = format(dateRange.from, 'yyyy-MM-dd')
             data = data.filter(d => d.date >= fromStr)
        }
        if (dateRange?.to) {
             const toStr = format(dateRange.to, 'yyyy-MM-dd')
             data = data.filter(d => d.date <= toStr)
        }

        // 4. Calculate Const Center Budget vs Actuals (using filtered list or base? Usually Actuals are YTD or Period? 
        // Let's use the Base transactions to get TOTAL used, or just filtered?
        // "Valor Aplicado (Valor Já Usado)" implies specific period or total?
        // If Budget is Annual, we should probably compare against Annual Applied?
        // Let's use the filtered transactions for "Applied" to allow analysis of specific periods against the budget, 
        // OR better yet, if no date selected, show YTD. If date selected, show that period's usage.
        // Let's use filteredTransactionList.
        
        const costCenterData = mockCostCenters.map(cc => {
            const used = filteredTransactionList
                .filter(t => t.costCenterId === cc.id && t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0)
            
            return {
                name: cc.name,
                budget: cc.budget, // Static budget from mock
                used: used
            }
        })

        return { finalChartData: data, currentMetrics: metrics, simulationImpact: impactMessage, costCenterData }
    }, [fullTimelineChartData, simulatedExpense, filteredTransactionList, dateRange])


    // Transaction List for Table
    const transactionList = useMemo(() => {
        return filteredTransactionList
    }, [filteredTransactionList])


    const clearFilters = () => {
        setSearchQuery("")
        setSelectedCostCenter("all")
        setPresetName(null)
        setDateRange(undefined)
    }

    // Date Presets
    const applyPreset = (days: number, type: 'next' | 'past' | 'month' | 'year' | 'year_to_date' = 'next', label: string) => {
        const today = new Date()
        let from = today
        let to = today

        if (type === 'next') {
            to = new Date(today)
            to.setDate(today.getDate() + days)
        } else if (type === 'past') {
            from = new Date(today)
            from.setDate(today.getDate() - days)
        } else if (type === 'month') {
            from = new Date(today.getFullYear(), today.getMonth(), 1)
            to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        } else if (type === 'year') {
            from = new Date(today.getFullYear(), 0, 1)
            to = new Date(today.getFullYear(), 11, 31)
        } else if (type === 'year_to_date') {
            from = new Date(today.getFullYear(), 0, 1)
            to = new Date(today)
        }

        setDateRange({ from, to })
        setPresetName(label)
    }

    return (
        <div className="container mx-auto py-6 lg:py-10 space-y-6 lg:space-y-8 animate-in fade-in duration-500">
             {/* Header */}
             <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start justify-between lg:justify-start lg:gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-primary">Financeiro</h1>
                        <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                            Visão geral do fluxo de caixa e simulações.
                        </p>
                    </div>

                    {/* Simulator Button - Mobile Only (Right of Title) */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 bg-background h-9 lg:hidden">
                                <Calculator className="h-4 w-4" />
                                <span className="hidden sm:inline">Simulador</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[90%] rounded-md max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Simulador de Despesas</DialogTitle>
                                <DialogDescription>
                                    Simule o impacto de novas despesas no fluxo de caixa.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <ExpenseSimulator 
                                    onSimulate={setSimulatedExpense} 
                                    simulationResult={simulationImpact}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-2 lg:justify-end">
                    
                    {/* Simulator Button - Desktop Only (Left of Filters) */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="hidden lg:inline-flex gap-2 bg-background">
                                <Calculator className="h-4 w-4" />
                                <span>Simulador</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Simulador de Despesas</DialogTitle>
                                <DialogDescription>
                                    Simule o impacto de novas despesas no fluxo de caixa.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <ExpenseSimulator 
                                    onSimulate={setSimulatedExpense} 
                                    simulationResult={simulationImpact}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Search */}
                    <div className="relative flex-1 lg:flex-none lg:w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-9 h-9 lg:h-10 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Cost Center Select */}
                    <div className="w-9 lg:w-[200px] shrink-0">
                         <Select value={selectedCostCenter} onValueChange={setSelectedCostCenter}>
                            <SelectTrigger className="w-full px-2 lg:px-3 h-9 lg:h-10 [&>svg]:hidden lg:[&>svg]:block">
                                <span className="lg:hidden text-muted-foreground">
                                     <Filter className="h-4 w-4" />
                                </span>
                                <span className="hidden lg:block truncate text-sm">
                                    <SelectValue placeholder="Centro de Custo" />
                                </span>
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="all">Todos os Centros</SelectItem>
                                {mockCostCenters.map(cc => (
                                    <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range Picker - Icon only on mobile */}
                    <div className="shrink-0">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    size="icon"
                                    className={cn(
                                        "w-9 lg:w-[240px] lg:justify-start lg:px-3 h-9 lg:h-10 font-normal",
                                        !dateRange?.from && "text-muted-foreground"
                                    )}
                                    title="Selecione o período"
                                >
                                    <CalendarIcon className="h-4 w-4 lg:mr-2" />
                                    <div className="hidden lg:block truncate text-sm">
                                        {presetName ? (
                                            <span>{presetName}</span>
                                        ) : (
                                            dateRange && dateRange.from ? (
                                                <>
                                                    {format(dateRange.from, "dd/MM/yyyy")}
                                                    {dateRange.to ? ` - ${format(dateRange.to, "dd/MM/yyyy")}` : ""}
                                                </>
                                            ) : (
                                                <span>Selecione o período</span>
                                            )
                                        )}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <div className="flex">
                                    <div className="flex flex-col gap-1 p-2 border-r">
                                        <Button variant="ghost" size="sm" className="justify-start text-xs font-normal" onClick={() => applyPreset(0, 'month', 'Este Mês')}>
                                            Este Mês
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-xs font-normal" onClick={() => applyPreset(30, 'next', 'Próx. 30 Dias')}>
                                            Próx. 30 Dias
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-xs font-normal" onClick={() => applyPreset(60, 'next', 'Próx. 60 Dias')}>
                                            Próx. 60 Dias
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-xs font-normal" onClick={() => applyPreset(90, 'next', 'Próx. 90 Dias')}>
                                            Próx. 90 Dias
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-xs font-normal" onClick={() => applyPreset(0, 'year', 'Este Ano')}>
                                            Este Ano
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-xs font-normal" onClick={() => applyPreset(0, 'year_to_date', 'Ano até agora')}>
                                            Ano até agora
                                        </Button>
                                    </div>
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            setDateRange(range)
                                            setPresetName(null)
                                        }}
                                        numberOfMonths={1}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {(searchQuery || selectedCostCenter !== 'all' || dateRange?.from || dateRange?.to) && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar Filtros" className="h-9 w-9 shrink-0">
                            <FilterX className="h-4 w-4" />
                        </Button>
                    )}
                </div>
             </div>

            {/* KPI Cards */}
            <FinancialCards 
                currentBalance={currentMetrics.currentBalance}
                totalRevenue={currentMetrics.totalRevenue}
                totalExpenses={currentMetrics.totalExpenses}
                predictedBalance={currentMetrics.predictedBalance}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                
                {/* Cash Flow Chart Section */}
                <div className="lg:col-span-2 h-[400px] lg:h-[500px] flex flex-col gap-2">
                    <CashFlowChart 
                        data={finalChartData} 
                        title="Fluxo de Caixa"
                        description={simulatedExpense ? "Simulação aplicada." : "Projeção baseada nos filtros atuais."}
                        onDateClick={(date) => {
                            setDateRange({ from: date, to: date })
                            setPresetName(null)
                        }}
                    />
                </div>

                {/* Cost Center Budget Chart Section */}
                <div className="h-[400px] lg:h-[500px]">
                    <CostCenterBudgetChart data={costCenterData} />
                </div>
            </div>

            {/* Transaction List Section */}
            <div className="mt-8">
                 <FinancialTransactionList 
                    key={JSON.stringify(transactionList.map(t => t.id).join(','))}
                    transactions={transactionList} 
                 />
            </div>

        </div>
    )
}
