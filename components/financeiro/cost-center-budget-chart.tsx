"use client";

import { useState, useMemo } from "react";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

export const description = "A multiple bar chart";

const chartConfig = {
  budget: {
    label: "Valor Previsto",
    color: "var(--chart-1)",
  },
  used: {
    label: "Valor Aplicado",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface CostCenterBudgetChartProps {
  data: {
    name: string;
    budget: number;
    used: number;
  }[];
}

const ITEMS_PER_PAGE = 5;

export function CostCenterBudgetChart({ data }: CostCenterBudgetChartProps) {
  const [page, setPage] = useState(0);

  // Sort descending by budget (defensive — parent should already sort)
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.budget - a.budget),
    [data],
  );

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const visibleData = sortedData.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );
  const showPagination = sortedData.length > ITEMS_PER_PAGE;

  return (
    <Card className="flex flex-col h-full shadow-sm border-0 bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orçamento por Centro de Custo</CardTitle>
            <CardDescription>Previsto vs Aplicado</CardDescription>
          </div>
          {showPagination && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums min-w-[3ch] text-center">
                {page + 1}/{totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0 min-h-0">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <BarChart accessibilityLayer data={visibleData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.length > 10 ? value.slice(0, 10) + "…" : value
              }
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
  );
}
