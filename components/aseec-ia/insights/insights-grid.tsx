"use client";

import { Activity, DollarSign, FolderKanban, AlertOctagon } from "lucide-react";
import { InsightCard } from "./insight-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import type { InsightsData } from "@/app/api/insights/route";

interface InsightsGridProps {
  onInsightClick: (context: string, prompt: string) => void;
  data: InsightsData | null;
  loading: boolean;
}

export function InsightsGrid({
  onInsightClick,
  data,
  loading,
}: InsightsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 pb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  // ── Visão Geral ────────────────────────────────────────────────────────────
  const health = data?.overview.healthScore ?? 0;
  const healthTrend =
    health >= 80 ? "success" : health >= 60 ? "neutral" : "danger";
  const healthAnalysis = data
    ? `Saúde operacional em ${health}%. ${
        data.overview.delayedProjects > 0
          ? `${data.overview.delayedProjects} projeto${data.overview.delayedProjects !== 1 ? "s" : ""} com atraso impactam o indicador.`
          : "Todos os cronogramas estão em dia."
      } ${data.overview.totalPeopleReached.toLocaleString("pt-BR")} pessoas alcançadas no total.`
    : "Dados indisponíveis no momento.";

  // ── Financeiro ─────────────────────────────────────────────────────────────
  const balance = data?.finance.currentBalance ?? 0;
  const projBalance = data?.finance.projectedBalance;
  const financeTrend =
    balance <= 0 || (projBalance != null && projBalance < 0)
      ? "danger"
      : projBalance != null && projBalance > balance
        ? "success"
        : "neutral";
  const financeAnalysis = data
    ? `Saldo atual de ${formatCurrency(balance)}. ${
        projBalance != null
          ? projBalance >= 0
            ? `Projeção de superávit de ${formatCurrency(projBalance)} para os próximos 30 dias.`
            : `Atenção: projeção de déficit de ${formatCurrency(Math.abs(projBalance))}.`
          : data.finance.yearSummary
            ? `Receita acumulada no ano: ${formatCurrency(data.finance.yearSummary.income)}.`
            : ""
      }`
    : "Dados financeiros indisponíveis.";

  // ── Projetos ───────────────────────────────────────────────────────────────
  const delayed = data?.overview.delayedProjects ?? 0;
  const active = data?.overview.activeProjects ?? 0;
  const projectTrend =
    delayed === 0 ? "success" : delayed >= 3 ? "danger" : "neutral";
  const projectAnalysis = data
    ? `${active} projeto${active !== 1 ? "s" : ""} ativo${active !== 1 ? "s" : ""}${
        delayed > 0
          ? `, ${delayed} com atraso. Revisão de cronogramas recomendada.`
          : `. Cronogramas dentro do prazo.`
      } ${data.overview.completedProjects} concluído${data.overview.completedProjects !== 1 ? "s" : ""} no total.`
    : "Dados de projetos indisponíveis.";

  // ── Riscos ─────────────────────────────────────────────────────────────────
  const critical = data?.risks.criticalCount ?? 0;
  const totalRisks = data?.risks.items.length ?? 0;
  const riskTrend =
    critical > 0 ? "danger" : totalRisks > 0 ? "neutral" : "success";
  const riskAnalysis = data
    ? critical > 0
      ? `${critical} risco${critical !== 1 ? "s" : ""} crítico${critical !== 1 ? "s" : ""} identificado${critical !== 1 ? "s" : ""}. Ação imediata recomendada.`
      : totalRisks > 0
        ? `${totalRisks} alerta${totalRisks !== 1 ? "s" : ""} monitorado${totalRisks !== 1 ? "s" : ""}. Nenhum crítico no momento.`
        : "Nenhum risco crítico identificado. Ambiente operacional estável."
    : "Dados de riscos indisponíveis.";

  return (
    <div className="grid gap-4 md:grid-cols-2 pb-8">
      <InsightCard
        title="Visão Geral"
        icon={Activity}
        summary={data ? `Saúde Operacional: ${health}%` : "Carregando..."}
        trend={healthTrend}
        trendValue={
          data
            ? health >= 80
              ? "Saudável"
              : health >= 60
                ? "Atenção"
                : "Crítico"
            : undefined
        }
        aiAnalysis={healthAnalysis}
        onAskAI={() =>
          onInsightClick(
            "Geral",
            "Me dê um detalhamento da saúde operacional da organização.",
          )
        }
      />

      <InsightCard
        title="Financeiro"
        icon={DollarSign}
        summary={data ? `Saldo: ${formatCurrency(balance)}` : "Carregando..."}
        trend={financeTrend}
        trendValue={
          data
            ? financeTrend === "success"
              ? "Positivo"
              : financeTrend === "danger"
                ? "Atenção"
                : "Estável"
            : undefined
        }
        aiAnalysis={financeAnalysis}
        onAskAI={() =>
          onInsightClick(
            "Financeiro",
            "Analise o fluxo de caixa previsto e identifique gargalos.",
          )
        }
        relatedLink="/financeiro"
      />

      <InsightCard
        title="Projetos"
        icon={FolderKanban}
        summary={
          data
            ? `${active} Ativo${active !== 1 ? "s" : ""} / ${delayed} Atrasado${delayed !== 1 ? "s" : ""}`
            : "Carregando..."
        }
        trend={projectTrend}
        trendValue={
          data
            ? projectTrend === "success"
              ? "Em dia"
              : projectTrend === "danger"
                ? "Atenção"
                : "Monitorar"
            : undefined
        }
        aiAnalysis={projectAnalysis}
        onAskAI={() =>
          onInsightClick(
            "Projetos",
            "Quais projetos estão atrasados e qual o impacto no cronograma geral?",
          )
        }
        relatedLink="/projetos"
      />

      <InsightCard
        title="Riscos"
        icon={AlertOctagon}
        summary={
          data
            ? critical > 0
              ? `${critical} Crítico${critical !== 1 ? "s" : ""} Identificado${critical !== 1 ? "s" : ""}`
              : totalRisks > 0
                ? `${totalRisks} Alerta${totalRisks !== 1 ? "s" : ""} Ativos`
                : "Nenhum Risco Crítico"
            : "Carregando..."
        }
        trend={riskTrend}
        trendValue={
          data
            ? critical > 0
              ? "Ação Necessária"
              : totalRisks > 0
                ? "Monitorar"
                : "Estável"
            : undefined
        }
        aiAnalysis={riskAnalysis}
        onAskAI={() =>
          onInsightClick(
            "Riscos",
            "Detalhe os riscos críticos e sugira planos de mitigação.",
          )
        }
      />
    </div>
  );
}
