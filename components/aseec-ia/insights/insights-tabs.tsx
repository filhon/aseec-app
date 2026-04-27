"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightsGrid } from "./insights-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FinancialCards } from "@/components/financeiro/financial-cards";
import {
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { InsightsData } from "@/app/api/insights/route";
import { cn } from "@/lib/utils";

interface InsightsTabsProps {
  onInsightClick: (context: string, prompt: string) => void;
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-400",
  medium: "border-l-yellow-400",
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const STATUS_COLOR: Record<string, string> = {
  em_andamento: "bg-blue-500",
  concluido: "bg-green-500",
  pendente: "bg-yellow-400",
  cancelado: "bg-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
  pendente: "Pendente",
  cancelado: "Cancelado",
};

export function InsightsTabs({ onInsightClick }: InsightsTabsProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error("Erro ao buscar insights");
      const json: InsightsData = await res.json();
      setData(json);
    } catch {
      setError("Não foi possível carregar os insights.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const updatedAtLabel = data
    ? new Date(data.updatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Tabs defaultValue="geral" className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="riscos">
            Riscos
            {data && data.risks.criticalCount > 0 && (
              <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {data.risks.criticalCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          {updatedAtLabel && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Atualizado às {updatedAtLabel}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={refreshing}
            onClick={() => fetchInsights(true)}
            title="Atualizar dados"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}{" "}
          <button
            className="underline underline-offset-2"
            onClick={() => fetchInsights()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* TAB: Visão Geral */}
      <TabsContent
        value="geral"
        className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Resumo Executivo
          </h2>
          <InsightsGrid
            onInsightClick={onInsightClick}
            data={data}
            loading={loading}
          />
        </div>
      </TabsContent>

      {/* TAB: Financeiro */}
      <TabsContent
        value="financeiro"
        className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Detalhamento Financeiro
              </h2>
              <p className="text-sm text-muted-foreground">
                Análise de fluxo de caixa e orçamento.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onInsightClick(
                  "Financeiro",
                  "Faça uma análise profunda dos gastos deste mês em comparação com o orçamento.",
                )
              }
            >
              <span className="mr-2">✨</span> Analisar com IA
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="p-1">
                <FinancialCards
                  currentBalance={data?.finance.currentBalance ?? 0}
                  predictedBalance={
                    data?.finance.projectedBalance ??
                    data?.finance.currentBalance ??
                    0
                  }
                  totalRevenue={
                    data?.finance.yearSummary?.income ??
                    data?.finance.projectedIncome ??
                    0
                  }
                  totalExpenses={
                    data?.finance.yearSummary?.expenses ??
                    data?.finance.projectedExpenses ??
                    0
                  }
                />
              </div>

              {/* Top Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle>Maiores Despesas do Período</CardTitle>
                  <CardDescription>
                    Transações a pagar ordenadas por valor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.finance.topExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Nenhuma despesa encontrada no período.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(data?.finance.topExpenses ?? []).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                        >
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="text-sm font-medium truncate">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.costCenter} ·{" "}
                              {new Date(item.dueDate).toLocaleDateString(
                                "pt-BR",
                              )}
                            </p>
                          </div>
                          <div className="font-semibold text-sm whitespace-nowrap">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Critical Budgets */}
              {(data?.finance.criticalBudgets.length ?? 0) > 0 && (
                <Card className="border-orange-200 dark:border-orange-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="h-4 w-4" />
                      Orçamentos em Alerta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(data?.finance.criticalBudgets ?? []).map((b, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{b.name}</span>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                b.status === "over_budget"
                                  ? "text-red-600"
                                  : "text-orange-600",
                              )}
                            >
                              {b.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                b.status === "over_budget"
                                  ? "bg-red-500"
                                  : "bg-orange-400",
                              )}
                              style={{
                                width: `${Math.min(b.percentage, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(b.consumed)} /{" "}
                            {formatCurrency(b.total)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </TabsContent>

      {/* TAB: Projetos */}
      <TabsContent
        value="projetos"
        className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Status dos Projetos
              </h2>
              <p className="text-sm text-muted-foreground">
                Monitoramento de prazos e entregas.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onInsightClick(
                  "Projetos",
                  "Quais projetos precisam de atenção imediata e por quê?",
                )
              }
            >
              <span className="mr-2">✨</span> Sugerir Ações
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Summary chips */}
              {data && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.projects.byStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs"
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            STATUS_COLOR[status] ?? "bg-muted-foreground",
                          )}
                        />
                        <span className="font-medium">
                          {STATUS_LABEL[status] ?? status}
                        </span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="grid gap-3">
                {(data?.projects.list ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum projeto ativo encontrado.
                  </p>
                ) : (
                  (data?.projects.list ?? []).map((proj) => {
                    const isDelayed = proj.daysOverdue != null;
                    const barColor = isDelayed
                      ? "bg-red-500"
                      : proj.progress >= 80
                        ? "bg-green-500"
                        : "bg-blue-500";
                    const statusText = isDelayed
                      ? `Atrasado ${proj.daysOverdue}d`
                      : (STATUS_LABEL[proj.status] ?? proj.status);
                    const statusClass = isDelayed
                      ? "text-red-600 dark:text-red-400"
                      : proj.progress >= 80
                        ? "text-green-600 dark:text-green-400"
                        : "text-blue-600 dark:text-blue-400";

                    return (
                      <Card
                        key={proj.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                          onInsightClick(
                            "Projetos",
                            `Detalhes sobre o projeto "${proj.title}": status, prazos e próximos passos.`,
                          )
                        }
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div
                            className={cn(
                              "w-2 h-12 rounded-full shrink-0",
                              barColor,
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1 gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {proj.title}
                              </h3>
                              <span
                                className={cn(
                                  "text-xs font-bold px-2 py-0.5 rounded-full bg-muted whitespace-nowrap shrink-0",
                                  statusClass,
                                )}
                              >
                                {statusText}
                              </span>
                            </div>
                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", barColor)}
                                style={{ width: `${proj.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {proj.progress}% do prazo decorrido
                              {proj.endDate && (
                                <>
                                  {" "}
                                  · até{" "}
                                  {new Date(proj.endDate).toLocaleDateString(
                                    "pt-BR",
                                  )}
                                </>
                              )}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/projetos">
                    Ver todos os projetos{" "}
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </TabsContent>

      {/* TAB: Riscos */}
      <TabsContent
        value="riscos"
        className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Matriz de Riscos
              </h2>
              <p className="text-sm text-muted-foreground">
                Alertas críticos derivados de projetos e orçamentos.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onInsightClick(
                  "Riscos",
                  "Gere um relatório de mitigação para os riscos críticos identificados.",
                )
              }
            >
              <span className="mr-2">✨</span> Gerar Relatório
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (data?.risks.items.length ?? 0) === 0 ? (
            <Card className="border-green-200 dark:border-green-900/50">
              <CardContent className="py-10 text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  Nenhum risco crítico identificado
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Todos os projetos e orçamentos estão dentro dos parâmetros
                  normais.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(data?.risks.items ?? []).map((risk) => {
                const isProjectRisk = risk.type === "project_delay";
                const aiPrompt = isProjectRisk
                  ? `Plano de ação para recuperar o prazo do projeto "${risk.title}".`
                  : `Estratégia para mitigar o risco orçamentário em "${risk.title}".`;

                return (
                  <Card
                    key={risk.id}
                    className={cn(
                      "border-l-4",
                      SEVERITY_COLOR[risk.severity] ?? "border-l-muted",
                    )}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between gap-2 text-base">
                        <span className="flex items-center gap-2 min-w-0">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{risk.title}</span>
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 border-0 text-xs",
                            SEVERITY_BADGE[risk.severity],
                          )}
                        >
                          {SEVERITY_LABEL[risk.severity]}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {isProjectRisk
                          ? "Atraso de projeto"
                          : "Risco orçamentário"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{risk.description}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => onInsightClick("Riscos", aiPrompt)}
                      >
                        Ver Plano de Contingência
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
