"use client";

import { Activity, DollarSign, FolderKanban, AlertOctagon } from "lucide-react";
import { InsightCard } from "./insight-card";

interface InsightsGridProps {
    onInsightClick: (context: string, prompt: string) => void;
}

export function InsightsGrid({ onInsightClick }: InsightsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 pb-8">
            {/* 1. General Overview */}
            <InsightCard 
                title="Visão Geral"
                icon={Activity}
                summary="Saúde Operacional: 88%"
                trend="up"
                trendValue="+5% vs mês anterior"
                aiAnalysis="O desempenho geral da organização está positivo. A eficiência nos projetos aumentou, embora existam riscos pontuais que merecem atenção."
                onAskAI={() => onInsightClick("Geral", "Me dê um detalhamento da saúde operacional da organização.")}
            />

            {/* 2. Financeiro */}
            <InsightCard 
                title="Financeiro"
                icon={DollarSign}
                summary="Saldo: R$ 142.500,00"
                trend="success"
                trendValue="Positivo"
                aiAnalysis="Fluxo de caixa saudável para os próximos 30 dias. Previsão de superávit, mas fique atento às despesas programadas para a próxima semana."
                onAskAI={() => onInsightClick("Financeiro", "Analise o fluxo de caixa previsto e identifique gargalos.")}
                relatedLink="/dashboard"
            />

            {/* 3. Projetos */}
            <InsightCard 
                title="Projetos"
                icon={FolderKanban}
                summary="12 Ativos / 3 Atrasados"
                trend="danger"
                trendValue="Atenção"
                aiAnalysis="A maioria dos projetos está no prazo, mas 3 projetos críticos (incluindo 'Expansão Norte') estão reportando atrasos nos marcos principais."
                onAskAI={() => onInsightClick("Projetos", "Quais projetos estão atrasados e qual o impacto no cronograma geral?")}
                relatedLink="/projetos"
            />

            {/* 4. Riscos */}
            <InsightCard 
                title="Riscos"
                icon={AlertOctagon}
                summary="2 Críticos Identificados"
                trend="danger"
                trendValue="Ação Necessária"
                aiAnalysis="Riscos regulatórios na região Sul elevaram o nível de alerta. Recomenda-se revisão imediata dos planos de contingência."
                onAskAI={() => onInsightClick("Riscos", "Detalhe os riscos críticos e sugira planos de mitigação.")}
            />
        </div>
    );
}
