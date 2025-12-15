
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Wallet, TrendingUp } from "lucide-react"

interface FinancialCardsProps {
    currentBalance: number
    totalRevenue: number
    totalExpenses: number
    predictedBalance: number
}

export function FinancialCards({ currentBalance, totalRevenue, totalExpenses, predictedBalance }: FinancialCardsProps) {
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {formatCurrency(currentBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                         Posição atual em caixa
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receitas (Ano)</CardTitle>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(totalRevenue)}
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">
                        +12% comparado ao ano anterior
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Despesas (Ano)</CardTitle>
                    <ArrowDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(totalExpenses)}
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">
                        -4% comparado ao ano anterior
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo Previsto (30d)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${predictedBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600"}`}>
                        {formatCurrency(predictedBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Projeção baseada no fluxo
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
