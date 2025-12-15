"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A multiple bar chart"

const chartConfig = {
  budget: {
    label: "Valor Previsto",
    color: "var(--chart-1)",
  },
  used: {
    label: "Valor Aplicado",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface CostCenterBudgetChartProps {
    data: {
        name: string
        budget: number
        used: number
    }[]
}

export function CostCenterBudgetChart({ data }: CostCenterBudgetChartProps) {
  return (
    <Card className="flex flex-col h-full shadow-sm border-0 bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <CardTitle>Orçamento por Centro de Custo</CardTitle>
        <CardDescription>Previsto vs Aplicado</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
            <Bar dataKey="used" fill="var(--color-used)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm text-muted-foreground mt-auto pt-4">
        <div className="flex gap-2 leading-none font-medium">
          Análise de orçamento <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Comparativo de execução orçamentária.
        </div>
      </CardFooter>
    </Card>
  )
}
