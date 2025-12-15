"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"

// Mock updates data
const recentUpdates = [
    {
        id: 1,
        project: "Hebron Base 1",
        update: "Início da fase de acabamento da estrutura principal.",
        date: "Há 2 horas",
        type: "progresso"
    },
    {
        id: 2,
        project: "Hospital de Campanha",
        update: "Recebimento de novos equipamentos médicos.",
        date: "Há 5 horas",
        type: "logistica"
    },
    {
        id: 3,
        project: "Escola do Amanhã",
        update: "Conclusão das matrículas para o ano letivo de 2025.",
        date: "Ontem",
        type: "admin"
    },
    {
        id: 4,
        project: "Poços Artesianos",
        update: "Inauguração do terceiro poço na comunidade local.",
        date: "Há 2 dias",
        type: "conclusao"
    },
    {
        id: 5,
        project: "Projeto Esperança",
        update: "Visita técnica realizada com sucesso.",
        date: "Há 3 dias",
        type: "monitoramento"
    }
]

export function ProjectUpdates() {
  return (
    <Card className="h-full shadow-sm flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Últimas Atualizações</CardTitle>
            <Badge variant="outline" className="text-xs font-normal">Hoje</Badge>
        </div>
        <CardDescription>Acompanhe o progresso recente dos projetos.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px] px-6">
            <div className="space-y-6 pb-6">
                {recentUpdates.map((item) => (
                    <div key={item.id} className="relative pl-6 border-l last:border-0 border-muted-foreground/20 pb-1">
                        <div className="absolute top-0 left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-primary">{item.project}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.date}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-snug">
                                {item.update}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
