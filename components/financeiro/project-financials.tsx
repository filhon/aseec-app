
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, TrendingUp } from "lucide-react"

interface ProjectFinancial {
    id: string
    title: string
    responsible: string
    totalBudget: number
    spent: number
    status: string
    category: string
}

interface ProjectFinancialsProps {
    projects: ProjectFinancial[]
}

export function ProjectFinancials({ projects }: ProjectFinancialsProps) {
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
    }

    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                     <Building2 className="h-5 w-5 text-primary" />
                     Resumo Financeiro por Projeto
                </CardTitle>
                <CardDescription>
                    Acompanhamento orçamentário dos projetos em andamento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Projeto</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Investimento Total</TableHead>
                            <TableHead>Executado</TableHead>
                            <TableHead className="w-[100px]">Progresso</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => {
                            const progress = Math.min(100, Math.round((project.spent / project.totalBudget) * 100))
                            return (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{project.title}</span>
                                            <span className="text-xs text-muted-foreground">{project.category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{project.responsible}</TableCell>
                                    <TableCell>{formatCurrency(project.totalBudget)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{formatCurrency(project.spent)}</span>
                                            <span className="text-xs text-muted-foreground">
                                                Restante: {formatCurrency(project.totalBudget - project.spent)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={progress} className="h-2 w-[60px]" />
                                            <span className="text-xs font-medium">{progress}%</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
