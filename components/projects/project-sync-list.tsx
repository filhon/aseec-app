"use client"

import { useEffect, useState } from "react"
import { createProject } from "@/lib/services/project-service"
import { fetchAggregatedTransactions, AggregatedTransaction } from "@/lib/actions/finance/sync-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, RefreshCw, ArrowRight, Wallet, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProjectSyncList() {
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<AggregatedTransaction[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [syncing, setSyncing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pagination state
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)

    const fetchUnsynced = async (currentPage = page, currentLimit = limit) => {
        setLoading(true)
        setSelectedIds(new Set()) // Reset selection on page change
        setError(null)
        try {
            const result = await fetchAggregatedTransactions(currentPage, currentLimit)
            setProjects(result.data)
            setTotal(result.total)
            if (result.error) {
                setError(result.error)
            }
        } catch (error: unknown) {
            console.error(error)
            setError("Erro ao buscar transações financeiras.")
            toast.error("Erro ao buscar transações financeiras.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnsynced(page, limit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit])

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        if (selectedIds.size === projects.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(projects.map(p => p.id)))
        }
    }

    const handleSync = async () => {
        if (selectedIds.size === 0) return

        setSyncing(true)

        try {
            const projectsToSync = projects.filter(p => selectedIds.has(p.id))

            for (const proj of projectsToSync) {
                // If there are multiple dates, pick the earliest or latest. Let's pick the first (latest usually) or today if empty
                const rawDate = proj.dates[0] ? new Date(proj.dates[0]).toISOString() : new Date().toISOString()

                await createProject({
                    title: proj.description,
                    responsible: "Não informado",
                    financial_project_id: proj.id, // Linking source reference hash
                    approved_value: proj.totalAmount,
                    requested_value: proj.totalAmount, // Usually start requested = approved 
                    start_date: rawDate,
                    status: 'pendente',
                    extension: 'parcial'
                }, "Sem categoria", [], proj.provider || "Sem Instituição")
            }

            toast.success(`${selectedIds.size} projeto(s) importado(s) com sucesso!`)
            setSelectedIds(new Set())
            // Remove imported from list
            setProjects(prev => prev.filter(p => !selectedIds.has(p.id)))

        } catch (error) {
            console.error("Error syncing projects:", error)
            toast.error("Erro ao importar alguns projetos.")
        } finally {
            setSyncing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Buscando atualizações do sistema financeiro...</p>
            </div>
        )
    }

    if (error && projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed rounded-lg bg-destructive/5 border-destructive/20">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-destructive">Sistema financeiro indisponível</h3>
                <p className="text-sm text-center max-w-sm mt-1">
                    {error}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => fetchUnsynced()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                </Button>
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Tudo atualizado!</h3>
                <p className="text-sm text-center max-w-sm mt-1">
                    Não encontramos novos projetos no sistema financeiro para importar no momento.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => fetchUnsynced()}>
                    Verificar novamente
                </Button>
            </div>
        )
    }

    return (
        <Card className="pb-0">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Sincronização Disponível</CardTitle>
                        <CardDescription>
                            Encontramos {projects.length} novos projetos no sistema financeiro.
                        </CardDescription>
                    </div>
                    <Button onClick={() => fetchUnsynced()} variant="ghost" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] pl-4">
                                    <Checkbox
                                        checked={selectedIds.size === projects.length && projects.length > 0}
                                        onCheckedChange={toggleAll}
                                    />
                                </TableHead>
                                <TableHead>Projeto (Descrição da Transação)</TableHead>
                                <TableHead>Instituição / Fornecedor</TableHead>
                                <TableHead>Financeiro (Soma)</TableHead>
                                <TableHead className="w-[100px] text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id} className="group hover:bg-muted/40 transition-colors">
                                    <TableCell className="pl-4">
                                        <Checkbox
                                            checked={selectedIds.has(project.id)}
                                            onCheckedChange={() => toggleSelection(project.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">{project.description}</span>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] h-5 px-1.5">Novo</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {project.transactionCount > 1 && (
                                                    <Badge variant="secondary" className="px-1.5 h-5 text-[10px]">
                                                        {project.transactionCount} parcelas/transações
                                                    </Badge>
                                                )}
                                                <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                                                    CC: {project.costCenterCode || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                    {project.provider.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FO'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{project.provider}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold flex items-center gap-1">
                                                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.totalAmount)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Valor Total Importado</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => toggleSelection(project.id)}
                                        >
                                            Importar <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                    <div className="p-4 border-b bg-muted/5 flex items-center gap-2">
                        <Checkbox
                            checked={selectedIds.size === projects.length && projects.length > 0}
                            onCheckedChange={toggleAll}
                            id="select-all-mobile"
                        />
                        <label htmlFor="select-all-mobile" className="text-sm font-medium text-muted-foreground cursor-pointer">
                            Selecionar todos os {projects.length} projetos
                        </label>
                    </div>
                    {projects.map((project) => (
                        <div key={project.id} className="p-4 border-b last:border-0 flex flex-col gap-3 active:bg-muted/50 transition-colors" onClick={() => {
                            // Allow clicking anywhere to toggle, but prevent double toggle if clicking specific elements?
                            // Actually, let's keep interactions specific or on main area.
                        }}>
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    checked={selectedIds.has(project.id)}
                                    onCheckedChange={() => toggleSelection(project.id)}
                                    className="mt-1"
                                />
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="font-medium text-sm leading-tight text-foreground">{project.description}</span>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] h-5 px-1.5 shrink-0">Novo</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {project.transactionCount > 1 && (
                                            <span className="bg-muted px-1.5 py-0.5 rounded">{project.transactionCount} parcelas</span>
                                        )}
                                        <span className="bg-muted px-1.5 py-0.5 rounded">CC: {project.costCenterCode || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-7 grid grid-cols-2 gap-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {project.provider.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FO'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground truncate">{project.provider}</span>
                                </div>
                                <div className="flex items-center justify-end gap-1.5 text-right">
                                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-semibold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-muted/20 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{selectedIds.size} selecionado(s)</span>
                        <div className="flex items-center gap-2">
                            <span>itens por pág:</span>
                            <Select value={limit.toString()} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
                                <SelectTrigger className="h-8 w-16">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 justify-center w-full md:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1 || loading}
                            onClick={() => setPage(page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" /> Anterior
                        </Button>
                        <span className="text-sm shrink-0 min-w-16 text-center">
                            Pág. {page} de {Math.ceil(total / limit) || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page * limit >= total || loading}
                            onClick={() => setPage(page + 1)}
                        >
                            Próximo <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleSync}
                        disabled={selectedIds.size === 0 || syncing}
                        className="gap-2 w-full md:w-auto mr-0 md:ml-auto"
                    >
                        {syncing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Importar Selecionados
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
