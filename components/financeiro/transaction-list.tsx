import { useState } from "react"
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
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Transaction, mockCostCenters } from "./data"

interface FinancialTransactionListProps {
    transactions: Transaction[]
}

export function FinancialTransactionList({ transactions }: FinancialTransactionListProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all')
    const itemsPerPage = 10
    


    // Filter and Sort
    const filteredTransactions = transactions.filter(t => {
        if (typeFilter === 'all') return true
        return t.type === typeFilter
    })

    const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }
    
    const getCostCenterName = (id: string) => mockCostCenters.find(c => c.id === id)?.name || id

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        Receitas e Despesas
                    </CardTitle>
                    <CardDescription className="hidden md:block">
                        Lista detalhada de movimentações previstas para o período.
                    </CardDescription>
                </div>
                <Tabs value={typeFilter} onValueChange={(v) => { setTypeFilter(v as 'all' | 'revenue' | 'expense'); setCurrentPage(1); }}>
                    <TabsList>
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="revenue" className="text-green-600 data-[state=active]:text-green-700">Receitas</TabsTrigger>
                        <TabsTrigger value="expense" className="text-red-600 data-[state=active]:text-red-700">Despesas</TabsTrigger>
                    </TabsList>
                </Tabs>
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
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentTransactions.length > 0 ? (
                                currentTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}
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
                                        <TableCell className={`text-right font-bold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'expense' ? '- ' : '+ '}
                                            {formatCurrency(t.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
                                            {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                        <p className="font-medium text-sm line-clamp-2">{t.description}</p>
                                    </div>
                                    <div className={`font-bold text-sm whitespace-nowrap ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'expense' ? '- ' : '+ '}
                                        {formatCurrency(t.amount)}
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-2 border-t mt-1">
                                    <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0.5 h-auto">
                                        {getCostCenterName(t.costCenterId)}
                                    </Badge>
                                    
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
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4">
                        <Pagination>
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
