
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Calculator, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SimulatedExpense } from "./data"

interface ExpenseSimulatorProps {
    onSimulate: (expense: SimulatedExpense | null) => void
    simulationResult?: { type: 'success' | 'danger', text: string } | null
}

export function ExpenseSimulator({ onSimulate, simulationResult }: ExpenseSimulatorProps) {
    const [amount, setAmount] = useState<string>("")
    const [installments, setInstallments] = useState<string>("1")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isSimulating, setIsSimulating] = useState(false)

    // Format currency input: R$ 0.000,00
    const formatCurrencyInput = (value: string) => {
        // Remove non-digits
        const digits = value.replace(/\D/g, "")
        
        // Convert to number (cents)
        const numberValue = parseInt(digits) / 100
        
        if (isNaN(numberValue)) return ""

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numberValue)
    }

    const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value
        setAmount(formatCurrencyInput(rawValue))
    }

    const handleSimulate = () => {
        if (!amount || !date) return

        // Parse formatted string back to number
        // Remove "R$", dots, and convert comma to dot
        const numericAmount = parseFloat(amount.replace(/[^\d,]/g, '').replace(',', '.'))

        const expense: SimulatedExpense = {
            amount: numericAmount,
            installments: parseInt(installments) || 1,
            startDate: date
        }
        
        onSimulate(expense)
        setIsSimulating(true)
    }

    const handleClear = () => {
        setAmount("")
        setInstallments("1")
        setDate(new Date())
        setIsSimulating(false)
        onSimulate(null)
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Simulador de Despesa
                </CardTitle>
                <CardDescription>
                    Avalie o impacto de uma nova despesa no fluxo de caixa.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <div className="space-y-2">
                    <Label htmlFor="amount">Valor Total (R$)</Label>
                    <Input 
                        id="amount" 
                        type="text" 
                        placeholder="R$ 0,00" 
                        value={amount}
                        onChange={handleChangeAmount}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Input 
                        id="installments" 
                        type="number" 
                        min="1"
                        max="60"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                    />
                </div>

                <div className="space-y-2 flex flex-col">
                    <Label>Data de Início</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t pt-4">
                <div className="flex gap-2 w-full">
                    <Button className="flex-1" onClick={handleSimulate}>
                        {isSimulating ? "Atualizar Simulação" : "Simular Impacto"}
                    </Button>
                    {isSimulating && (
                        <Button variant="outline" size="icon" onClick={handleClear} title="Limpar Simulação">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                </div>
                
                {/* Result Display Area */}
                <div className={cn(
                    "w-full p-3 rounded-md text-sm min-h-[60px] flex items-center justify-center text-center",
                    simulationResult 
                        ? (simulationResult.type === 'danger' 
                            ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 border" 
                            : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 border")
                        : "bg-muted/50 text-muted-foreground border border-dashed"
                )}>
                    {simulationResult ? (
                        <span className="font-medium">{simulationResult.text}</span>
                    ) : (
                        <span>Preencha os campos acima para ver o resultado da análise.</span>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
