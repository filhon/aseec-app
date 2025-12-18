"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightsGrid } from "./insights-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancialCards } from "@/components/financeiro/financial-cards"; 
import { AlertTriangle, ArrowRight } from "lucide-react";

interface InsightsTabsProps {
    onInsightClick: (context: string, prompt: string) => void;
}

export function InsightsTabs({ onInsightClick }: InsightsTabsProps) {
    return (
        <Tabs defaultValue="geral" className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between pb-4">
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="geral">Visão Geral</TabsTrigger>
                    <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                    <TabsTrigger value="projetos">Projetos</TabsTrigger>
                    <TabsTrigger value="riscos">Riscos</TabsTrigger>
                </TabsList>
            </div>

            {/* TAB: Visão Geral (The original Grid) */}
            <TabsContent value="geral" className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight">Resumo Executivo</h2>
                        <span className="text-xs text-muted-foreground">Atualizado hoje às 14:30</span>
                    </div>
                    <InsightsGrid onInsightClick={onInsightClick} />
                </div>
            </TabsContent>

            {/* TAB: Financeiro */}
            <TabsContent value="financeiro" className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Detalhamento Financeiro</h2>
                            <p className="text-sm text-muted-foreground">Análise de fluxo de caixa e orçamento.</p>
                        </div>
                         <Button variant="outline" size="sm" onClick={() => onInsightClick("Financeiro", "Faça uma análise profunda dos gastos deste mês em comparação com o orçamento.")}>
                            <span className="mr-2">✨</span> Analisar com IA
                        </Button>
                    </div>

                    {/* Reusing Financial Cards with dummy data representing current state */}
                    <div className="p-1">
                         <FinancialCards 
                            currentBalance={142500.00}
                            predictedBalance={158000.00}
                            totalRevenue={450000.00}
                            totalExpenses={307500.00}
                        />
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Maiores Despesas do Mês</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: "Folha de Pagamento", val: "R$ 45.000,00", date: "05/12" },
                                    { name: "Infraestrutura Cloud", val: "R$ 12.500,00", date: "10/12" },
                                    { name: "Material de Escritório", val: "R$ 3.200,00", date: "12/12" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.date}</p>
                                        </div>
                                        <div className="font-semibold text-sm">{item.val}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* TAB: Projetos */}
            <TabsContent value="projetos" className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <div>
                            <h2 className="text-lg font-semibold tracking-tight">Status dos Projetos</h2>
                            <p className="text-sm text-muted-foreground">Monitoramento de prazos e entregas.</p>
                        </div>
                         <Button variant="outline" size="sm" onClick={() => onInsightClick("Projetos", "Quais projetos precisam de atenção imediata e por quê?")}>
                             <span className="mr-2">✨</span> Sugerir Ações
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { name: "Expansão Norte", status: "Atrasado", progress: 65, color: "text-red-500 bg-red-500" },
                            { name: "Implementação ERP", status: "Em dia", progress: 88, color: "text-green-500 bg-green-500" },
                            { name: "Reforma Sede", status: "Em risco", progress: 40, color: "text-yellow-500 bg-yellow-500" },
                        ].map((proj, i) => (
                             <Card key={i} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onInsightClick("Projetos", `Detalhes sobre o projeto ${proj.name}`)}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${proj.color.split(" ")[1]}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-semibold">{proj.name}</h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-muted ${proj.color.split(" ")[0]}`}>
                                                {proj.status}
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${proj.color.split(" ")[1]}`} style={{ width: `${proj.progress}%` }} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{proj.progress}% concluído</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </TabsContent>

            {/* TAB: Riscos */}
            <TabsContent value="riscos" className="mt-0 flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div className="space-y-6">
                     <div className="flex items-center justify-between">
                         <div>
                            <h2 className="text-lg font-semibold tracking-tight">Matriz de Riscos</h2>
                            <p className="text-sm text-muted-foreground">Alertas críticos e planos de mitigação.</p>
                        </div>
                         <Button variant="outline" size="sm" onClick={() => onInsightClick("Riscos", "Gere um relatório de mitigação para os riscos críticos.")}>
                             <span className="mr-2">✨</span> Gerar Relatório
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                         <Card className="border-l-4 border-l-red-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base text-red-600">
                                    <AlertTriangle className="w-4 h-4" /> Regulatório - Sul
                                </CardTitle>
                                <CardDescription>Probabilidade: Alta | Impacto: Alto</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-4">Mudanças na legislação local podem impactar o cronograma da obra em 3 meses.</p>
                                <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => onInsightClick("Riscos", "Plano de ação para Risco Regulatório Sul")}>Ver Plano de Contingência</Button>
                            </CardContent>
                         </Card>
                         
                         <Card className="border-l-4 border-l-yellow-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base text-yellow-600">
                                    <AlertTriangle className="w-4 h-4" /> Fornecedor - TI
                                </CardTitle>
                                <CardDescription>Probabilidade: Média | Impacto: Médio</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-4">Atraso na entrega de servidores pode adiar a migração do ERP.</p>
                                <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => onInsightClick("Riscos", "Alternativas para o fornecedor de TI")}>Ver Alternativas</Button>
                            </CardContent>
                         </Card>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
