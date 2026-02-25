import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Transaction, mockCostCenters } from "./data"

interface FinancialTransactionListProps {
    transactions: Transaction[]
    costCenterNames?: Map<string, string>
}

export function FinancialTransactionList({ transactions, costCenterNames }: FinancialTransactionListProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all')
    const [localSearch, setLocalSearch] = useState("")
    const itemsPerPage = 10

    // Filter by type and search by description
    const filteredTransactions = useMemo(() => {
        let result = transactions

        // Type filter
        if (typeFilter !== 'all') {
            result = result.filter(t => t.type === typeFilter)
        }

        // Search by description (accent-insensitive)
        if (localSearch.trim()) {
            const query = localSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            result = result.filter(t => {
                const desc = t.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                return desc.includes(query)
            })
        }

        return result
    }, [transactions, typeFilter, localSearch])

    const sortedTransactions = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date))

    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage)

    // Reset to page 1 when filters change (handled inline)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const getCostCenterName = (id: string) => costCenterNames?.get(id) || mockCostCenters.find(c => c.id === id)?.name || id

    return (
        <Card>
            <CardHeader className="pb-2 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            Receitas e Despesas
                        </CardTitle>
                        <CardDescription className="hidden md:block">
                            Lista detalhada de movimentações previstas para o período.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:flex-none md:w-[220px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por descrição..."
                                className="pl-9 h-9 text-sm"
                                value={localSearch}
                                onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <Tabs value={typeFilter} onValueChange={(v) => { setTypeFilter(v as 'all' | 'revenue' | 'expense'); setCurrentPage(1); }}>
                            <TabsList>
                                <TabsTrigger value="all">Todas</TabsTrigger>
                                <TabsTrigger value="revenue" className="text-green-600 data-[state=active]:text-green-700">Receitas</TabsTrigger>
                                <TabsTrigger value="expense" className="text-red-600 data-[state=active]:text-red-700">Despesas</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Centro de Custo</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTransactions.length > 0 ? (
                                currentTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(`${t.date}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getCostCenterName(t.costCenterId)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {t.type === 'revenue' ? (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <ArrowUpCircle className="h-4 w-4" />
                                                    <span>Receita</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <ArrowDownCircle className="h-4 w-4" />
                                                    <span>Despesa</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                t.status === 'paid' ? 'default' :
                                                    t.status === 'approved' || t.status === 'authorized' ? 'secondary' :
                                                        'outline'
                                            }
                                                className={
                                                    t.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        t.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            ''
                                                }
                                            >
                                                {t.status === 'paid' ? 'Pago' :
                                                    t.status === 'pending' ? 'Pendente' :
                                                        t.status === 'draft' ? 'Rascunho' :
                                                            t.status === 'approved' ? 'Aprovado' :
                                                                t.status === 'authorized' ? 'Autorizado' :
                                                                    t.status === 'rejected' ? 'Rejeitado' :
                                                                        t.status === 'cancelled' ? 'Cancelado' :
                                                                            t.status === 'deleted' ? 'Excluído' :
                                                                                t.status
                                                }
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'expense' ? '- ' : '+ '}
                                            {formatCurrency(t.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Nenhuma transação encontrada para este período.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {currentTransactions.length > 0 ? (
                        currentTransactions.map((t) => (
                            <div key={t.id} className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm bg-card">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            {format(new Date(`${t.date}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                        <p className="font-medium text-sm line-clamp-2">{t.description}</p>
                                    </div>
                                    <div className={`font-bold text-sm whitespace-nowrap ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'expense' ? '- ' : '+ '}
                                        {formatCurrency(t.amount)}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t mt-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0.5 h-auto">
                                            {getCostCenterName(t.costCenterId)}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] font-normal px-2 py-0.5 h-auto">
                                            {t.status === 'paid' ? 'Pago' :
                                                t.status === 'pending' ? 'Pendente' :
                                                    t.status === 'draft' ? 'Rascunho' :
                                                        t.status === 'approved' ? 'Aprovado' :
                                                            t.status === 'authorized' ? 'Autorizado' :
                                                                t.status === 'rejected' ? 'Rejeitado' :
                                                                    t.status
                                            }
                                        </Badge>
                                    </div>

                                    {t.type === 'revenue' ? (
                                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                            <ArrowUpCircle className="h-3.5 w-3.5" />
                                            <span>Receita</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                            <ArrowDownCircle className="h-3.5 w-3.5" />
                                            <span>Despesa</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhuma transação encontrada.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {sortedTransactions.length} transação(ões) • Página {currentPage} de {totalPages}
                        </p>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(p => p - 1); }}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const page = i + 1;
                                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === currentPage}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    }
                                    if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(p => p + 1); }}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
