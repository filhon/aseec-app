"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, Search, Link as LinkIcon, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Checkbox } from "@/components/ui/checkbox"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { createProject, getCategories, getTags } from "@/lib/services/project-service"
import { ProjectExtension, Category } from "@/lib/types/database.types"
import { searchFinanceProjects } from "@/lib/actions/finance/sync-actions"
import { FinanceTransaction } from "@/lib/api/finance/types"


const projectSchema = z.object({
    title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
    institution: z.string().min(2, "Instituição é obrigatória"),
    responsible: z.string().min(2, "Responsável é obrigatório"),
    category: z.string().min(1, "Selecione uma categoria"),
    country: z.string().optional(),
    state: z.string().optional(),
    municipality: z.string().optional(),
    description: z.string().optional(),
    financialProjectId: z.string().optional(), // Link to external ID
    extension: z.string().optional(),
    tags: z.array(z.string()).optional(),
    indication: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    // New Address Fields
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    neighborhood: z.string().optional(),
    zipCode: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export function NewProjectForm() {
    const [searching, setSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<{ results: FinanceTransaction[], alreadyLinkedCount: number }>({ results: [], alreadyLinkedCount: 0 })
    const [selectedFinancialProject, setSelectedFinancialProject] = useState<FinanceTransaction | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [tagsList, setTagsList] = useState<{ id: string; name: string; color: string }[]>([])

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [cats, tgs] = await Promise.all([
                    getCategories(),
                    getTags(),
                ])
                setCategories(cats)
                setTagsList(tgs)
            } catch (error) {
                console.error("Error loading initial data", error)
            }
        }
        loadInitialData()
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults({ results: [], alreadyLinkedCount: 0 })
                return
            }
            setSearching(true)
            try {
                const res = await searchFinanceProjects(searchQuery)
                setSearchResults(res)
            } catch {
                setSearchResults({ results: [], alreadyLinkedCount: 0 })
            } finally {
                setSearching(false)
            }
        }, 400)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])



    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            institution: "",
            responsible: "",
            category: "",
            country: "Brasil",
            state: "",
            municipality: "",
            description: "",
            financialProjectId: "",
            extension: "parcial",
            tags: [],
            indication: "",
            // Dates default to undefined for optional fields
            // New Address Fields
            address: "",
            latitude: 0,
            longitude: 0,
            street: "",
            number: "",
            neighborhood: "",
            zipCode: "",
        },
    })

    const selectFinancialProject = (project: FinanceTransaction) => {
        setSelectedFinancialProject(project)
        form.setValue("financialProjectId", project.id)

        // Auto-fill fields if empty
        if (!form.getValues("title")) form.setValue("title", project.description)
        if (!form.getValues("institution")) form.setValue("institution", project.supplier || "")

        setSearchResults({ results: [], alreadyLinkedCount: 0 })
        setSearchQuery("")
        toast.info("Vínculo financeiro selecionado", {
            description: `Valores de aprovado e investido serão sincronizados de: ${project.description}`
        })
    }

    const router = useRouter()
    const onSubmit = async (values: ProjectFormValues) => {
        setSubmitting(true)
        try {
            const result = await createProject({
                title: values.title,
                responsible: values.responsible,
                country: values.country,
                state: values.state,
                municipality: values.municipality,
                description: values.description,
                extension: (values.extension as ProjectExtension) || "parcial",
                start_date: values.startDate?.toISOString(),
                end_date: values.endDate?.toISOString(),
                indication: values.indication,
                address: values.address,
                latitude: values.latitude,
                longitude: values.longitude,
                street: values.street,
                number: values.number,
                neighborhood: values.neighborhood,
                zip_code: values.zipCode,
                financial_project_id: values.financialProjectId,
                // If there's a selected financial project, we might want to sync these values immediately:
                approved_value: selectedFinancialProject?.amount || 0,
                requested_value: selectedFinancialProject?.amount || 0,
            }, values.category, values.tags, values.institution)

            if (result) {
                toast.success("Projeto criado com sucesso!")
                router.push("/projetos")
            } else {
                toast.error("Erro ao criar projeto. Verifique os dados e tente novamente.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro inesperado ao criar projeto.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Financial Link Section */}
                <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <LinkIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium">Vincular Projeto Financeiro</h3>
                                <p className="text-sm text-muted-foreground">
                                    Pesquise para conectar este projeto aos dados financeiros (orçamento, gastos).
                                </p>
                            </div>

                            {!selectedFinancialProject ? (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nome ou centro de custo..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                    {(searchResults.results.length > 0 || searchResults.alreadyLinkedCount > 0) && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-[250px] overflow-auto flex flex-col">
                                            {searchResults.results.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted focus:bg-muted flex flex-col shrink-0"
                                                    onClick={() => selectFinancialProject(p)}
                                                >
                                                    <span className="font-medium">{p.description}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center justify-between mt-1 w-full">
                                                        <span>{p.supplier || "Sem Instituição"} {p.costCenter?.code ? `• CC: ${p.costCenter.code}` : ''}</span>
                                                        <span className="font-medium text-foreground ml-2">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
                                                        </span>
                                                    </span>
                                                </button>
                                            ))}
                                            {searchResults.alreadyLinkedCount > 0 && (
                                                <div className="px-3 py-2.5 text-xs text-muted-foreground bg-amber-50/50 dark:bg-amber-900/10 border-t flex flex-col shrink-0 mt-auto sticky bottom-0">
                                                    <span className="font-medium text-amber-700 dark:text-amber-400">
                                                        {searchResults.alreadyLinkedCount} projeto(s) financeiro(s) não estão na lista
                                                    </span>
                                                    <span>Eles já se encontram vinculados a outros projetos da base de dados.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {searchQuery.length >= 2 && !searching && searchResults.results.length === 0 && searchResults.alreadyLinkedCount === 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 p-4 text-center text-sm text-muted-foreground">
                                            Nenhum projeto financeiro encontrado para &quot;{searchQuery}&quot;.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-background border p-3 rounded-md">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium flex items-center gap-2">
                                            {selectedFinancialProject.description}
                                            <Badge variant="outline" className="text-[10px] h-5 bg-green-50 text-green-700 border-green-200">Vinculado</Badge>
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                            {selectedFinancialProject.supplier || "Sem Instituição"}
                                            {selectedFinancialProject.costCenter?.code && `• CC: ${selectedFinancialProject.costCenter.code}`}
                                            • <span className="font-medium text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedFinancialProject.amount)}</span>
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFinancialProject(null)
                                            form.setValue("financialProjectId", undefined)
                                            form.setValue("title", "")
                                            form.setValue("institution", "")
                                        }}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Projeto</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Reforma Base Hebron" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instituição</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Missão Hebron" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Address Autocomplete Section */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex flex-col space-y-2">
                            <FormLabel>Localização</FormLabel>
                            <AddressAutocomplete
                                onAddressSelect={(data) => {
                                    form.setValue("address", data.display_name)
                                    form.setValue("street", data.street)
                                    form.setValue("number", data.number)
                                    form.setValue("neighborhood", data.neighborhood)
                                    form.setValue("municipality", data.city)
                                    form.setValue("state", data.state)
                                    form.setValue("country", data.country)
                                    form.setValue("zipCode", data.zipCode)
                                    form.setValue("latitude", data.latitude)
                                    form.setValue("longitude", data.longitude)
                                }}
                            />
                            <FormDescription>
                                Digite o endereço ou CEP para preencher automaticamente os dados de localização.
                            </FormDescription>
                        </div>

                        {/* Detailed Address Fields (Auto-filled but editable) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-md bg-muted/10">
                            <FormField
                                control={form.control}
                                name="street"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs">Rua / Logradouro</FormLabel>
                                        <FormControl>
                                            <Input className="h-8 text-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Número</FormLabel>
                                        <FormControl>
                                            <Input className="h-8 text-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="neighborhood"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Bairro</FormLabel>
                                        <FormControl>
                                            <Input className="h-8 text-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="municipality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Cidade</FormLabel>
                                        <FormControl>
                                            <Input className="h-8 text-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Estado</FormLabel>
                                        <FormControl>
                                            <Input className="h-8 text-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">País</FormLabel>
                                        <FormControl>
                                            <Input className="h-8 text-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">CEP/Zip</FormLabel>
                                        <FormControl>
                                            <Input className="h-8 text-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>


                    {/* Responsible, Category, Extension Row */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <FormField
                            control={form.control}
                            name="responsible"
                            render={({ field }) => (
                                <FormItem className="col-span-1 md:col-span-2">
                                    <FormLabel>Responsável</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome do responsável" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Categoria</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="extension"
                            render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Extensão</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="parcial">Parcial</SelectItem>
                                            <SelectItem value="completo">Completo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>



                    {/* Tags Checkbox Group - Full Width with Visual Feedback */}
                    <div className="col-span-1 md:col-span-2">
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Tags do Projeto</FormLabel>
                                        <FormDescription>
                                            Selecione as tags que melhor descrevem este projeto.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                        {tagsList.map((tag) => {
                                            const isChecked = field.value?.includes(tag.name)
                                            return (
                                                <div
                                                    key={tag.id}
                                                    className={cn(
                                                        "relative flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md border p-3 transition-all hover:bg-muted",
                                                        isChecked && "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                    )}
                                                >
                                                    <Checkbox
                                                        id={`tag-${tag.id}`}
                                                        className="z-10" // Ensure checkbox is clickable on top
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const currentTags = field.value || []
                                                            const newTags = checked
                                                                ? [...currentTags, tag.name]
                                                                : currentTags.filter((value) => value !== tag.name)
                                                            field.onChange(newTags)
                                                        }}
                                                    />
                                                    <span className="text-xs font-normal pointer-events-none z-10 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                                        {tag.name}
                                                    </span>
                                                    {/* Overlay label to make the whole card clickable */}
                                                    <label
                                                        htmlFor={`tag-${tag.id}`}
                                                        className="absolute inset-0 cursor-pointer"
                                                    >
                                                        <span className="sr-only">{tag.name}</span>
                                                    </label>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Data de Início</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: ptBR })
                                                ) : (
                                                    <span>Selecione uma data</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date("2100-01-01") || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Previsão de Término</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: ptBR })
                                                ) : (
                                                    <span>Selecione uma data</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date("2100-01-01") || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="indication"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Indicação (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Quem indicou este projeto?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Descreva os objetivos e escopo do projeto..."
                                    className="resize-none min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => window.history.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Projeto
                    </Button>
                </div>
            </form>
        </Form>
    )
}
