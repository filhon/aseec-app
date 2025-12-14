import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
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
    
    // Reset page when data changes
    useEffect(() => {
        setCurrentPage(1)
    }, [transactions])

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
                        Próximas Receitas e Despesas
                    </CardTitle>
                    <CardDescription>
                        Lista detalhada de movimentações previstas para o período.
                    </CardDescription>
                </div>
                <Tabs value={typeFilter} onValueChange={(v) => { setTypeFilter(v as any); setCurrentPage(1); }}>
                    <TabsList>
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="revenue" className="text-green-600 data-[state=active]:text-green-700">Receitas</TabsTrigger>
                        <TabsTrigger value="expense" className="text-red-600 data-[state=active]:text-red-700">Despesas</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>
                        <div className="text-sm font-medium">
                            Página {currentPage} de {totalPages}
                        </div>
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
