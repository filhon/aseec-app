
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CashFlowData } from "./data"

interface CashFlowChartProps {
    data: CashFlowData[]
    title?: string
    description?: string
    onDateClick?: (date: Date) => void
}

export function CashFlowChart({ 
    data, 
    title = "Fluxo de Caixa", 
    description = "Projeção financeira baseada nas receitas e despesas previstas.",
    onDateClick
}: CashFlowChartProps) {
    
    // Find today's index to draw a reference line
    const todayStr = new Date().toISOString().split('T')[0]
    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const dateStr = data.activePayload[0].payload.date
            if (dateStr && onDateClick) {
                // dateStr is YYYY-MM-DD.
                // We construct a Date object that effectively represents this local day.
                // Setting it to noon (12:00) avoids most timezone boundary issues when doing simple day comparisons
                // or when libraries try to normalize to midnight.
                const [year, month, day] = dateStr.split('-').map(Number)
                const date = new Date(year, month - 1, day, 12, 0, 0)
                onDateClick(date)
            }
        }
    }

    return (
        <Card className="shadow-sm border-0 bg-gradient-to-br from-card to-muted/20 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="grid gap-1">
                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 h-[calc(100%-80px)]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                        data={data} 
                        margin={{ top: 10, right: 10, left: 25, bottom: 0 }}
                        onClick={handleChartClick}
                        className="cursor-pointer"
                    >
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("pt-BR", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                    notation: "compact", // Compact notation to save space
                                    maximumFractionDigits: 1,
                                }).format(value)
                            }
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Data
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {new Date(data.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Saldo
                                                    </span>
                                                    <span className="font-bold text-primary">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.balance)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Receitas
                                                    </span>
                                                    <span className="font-bold text-green-600">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.revenue)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Despesas
                                                    </span>
                                                    <span className="font-bold text-red-600">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.expenses)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Hoje', fill: 'var(--muted-foreground)', fontSize: 12 }} />
                        <ReferenceLine y={0} stroke="var(--destructive)" strokeWidth={1} />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="var(--chart-1)"
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

