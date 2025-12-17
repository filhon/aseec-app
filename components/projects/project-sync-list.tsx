"use client"

import { useEffect, useState } from "react"
import { financialService, FinancialProject } from "@/lib/services/financial-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, RefreshCw, ArrowRight, CalendarDays, Wallet } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ProjectSyncList() {
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<FinancialProject[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [syncing, setSyncing] = useState(false)

    const fetchUnsynced = async () => {
        setLoading(true)
        try {
            const data = await financialService.getUnsyncedProjects()
            setProjects(data)
        } catch (error: unknown) {
            console.error(error) // Log error for debugging
            toast.error("Erro ao buscar projetos do sistema financeiro.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnsynced()
    }, [])

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
        // Simulate API call to create projects in ASEEC
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        toast.success(`${selectedIds.size} projeto(s) importado(s) com sucesso!`)
        setSyncing(false)
        setSelectedIds(new Set())
        // Remove imported from list (simulate refresh)
        setProjects(prev => prev.filter(p => !selectedIds.has(p.id)))
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Buscando atualizações do sistema financeiro...</p>
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
                <Button variant="outline" className="mt-4" onClick={fetchUnsynced}>
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
                    <Button onClick={fetchUnsynced} variant="ghost" size="icon">
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
                            <TableHead>Projeto</TableHead>
                            <TableHead>Gerente</TableHead>
                            <TableHead>Financeiro</TableHead>
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
                                            <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                                                Code: {project.costCenterCode}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                Encontrado hoje
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                {project.managerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{project.managerName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold flex items-center gap-1">
                                            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.approvedValue)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Valor Aprovado</span>
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
                        <div key={project.id} className="p-4 border-b last:border-0 flex flex-col gap-3 active:bg-muted/50 transition-colors" onClick={(e) => {
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
                                         <span className="bg-muted px-1.5 py-0.5 rounded">Code: {project.costCenterCode}</span>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="ml-7 grid grid-cols-2 gap-2 pt-1">
                                  <div className="flex items-center gap-2">
                                       <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                {project.managerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                       </Avatar>
                                       <span className="text-xs text-muted-foreground truncate">{project.managerName}</span>
                                  </div>
                                  <div className="flex items-center justify-end gap-1.5 text-right">
                                       <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                       <span className="text-sm font-semibold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.approvedValue)}
                                       </span>
                                  </div>
                             </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-4 bg-muted/20 border-t flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        {selectedIds.size} selecionado(s)
                    </div>
                    <Button 
                        onClick={handleSync} 
                        disabled={selectedIds.size === 0 || syncing}
                        className="gap-2"
                    >
                        {syncing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Importar Selecionados
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
