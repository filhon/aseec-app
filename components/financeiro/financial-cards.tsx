
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Wallet, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FinancialCardsProps {
    currentBalance: number
    totalRevenue: number
    totalExpenses: number
    predictedBalance: number
}

export function FinancialCards({ currentBalance, totalRevenue, totalExpenses, predictedBalance }: FinancialCardsProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    return (
        <div className="space-y-2">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {/* 1. Current Balance */}
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow lg:border-l lg:border-l-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {formatCurrency(currentBalance)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                             Posição atual
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Predicted Balance (Moved up for Mobile first row) */}
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow lg:border-l lg:border-l-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Previsto (30d)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${predictedBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600"}`}>
                            {formatCurrency(predictedBalance)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                            Projeção
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Revenue (Collapsible on mobile) */}
                <Card className={`${!isExpanded ? 'hidden' : 'block'} lg:block animate-in fade-in slide-in-from-top-2 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow lg:border-l lg:border-l-border`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(totalRevenue)}
                        </div>
                         <p className="text-xs text-muted-foreground mt-1 truncate">
                            Acumulado Ano
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Expenses (Collapsible on mobile) */}
                <Card className={`${!isExpanded ? 'hidden' : 'block'} lg:block animate-in fade-in slide-in-from-top-2 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow lg:border-l lg:border-l-border`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                        <ArrowDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(totalExpenses)}
                        </div>
                         <p className="text-xs text-muted-foreground mt-1 truncate">
                            Acumulado Ano
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Mobile Toggle Button */}
            <div className="flex justify-center lg:hidden">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 gap-1 text-xs text-muted-foreground"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <>Menos detalhes <ChevronUp className="h-3 w-3" /></>
                    ) : (
                        <>Mais detalhes <ChevronDown className="h-3 w-3" /></>
                    )}
                </Button>
            </div>
        </div>
    )
}
