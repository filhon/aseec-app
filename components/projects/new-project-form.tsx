"use client"

import { useState } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
// Keep existing Lucide imports and add CalendarIcon
import { Loader2, Search, Link as LinkIcon, Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { financialService, FinancialProject } from "@/lib/services/financial-service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
// ... (imports command, popover, etc) - assuming they align
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { countries } from "@/lib/constants/countries"
import { Checkbox } from "@/components/ui/checkbox"
import { projectTags } from "@/lib/constants/project-tags"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { Calendar } from "@/components/ui/calendar"

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
    const [searchResults, setSearchResults] = useState<FinancialProject[]>([])
    const [selectedFinancialProject, setSelectedFinancialProject] = useState<FinancialProject | null>(null)
    const [submitting, setSubmitting] = useState(false)

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

    const handleSearchFinancial = async (query: string) => {
        if (query.length < 3) {
            setSearchResults([])
            return
        }
        setSearching(true)
        try {
            const results = await financialService.searchFinancialProjects(query)
            setSearchResults(results)
        } catch {
            // Ignore errors for search autocomplete
        } finally {
            setSearching(false)
        }
    }

    const selectFinancialProject = (project: FinancialProject) => {
        setSelectedFinancialProject(project)
        form.setValue("financialProjectId", project.id)
        
        // Auto-fill fields if empty
        if (!form.getValues("title")) form.setValue("title", project.description)
        if (!form.getValues("responsible")) form.setValue("responsible", project.managerName)
        
        setSearchResults([])
        toast.info("Vínculo financeiro selecionado", {
            description: `Valores de aprovado e investido serão sincronizados de: ${project.description}`
        })
    }

    const onSubmit = async (values: ProjectFormValues) => {
        setSubmitting(true)
        // Simulate API create
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log("Submitting values:", values)
        toast.success("Projeto criado com sucesso!")
        setSubmitting(false)
        // Redirect logic would go here
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
                                        onChange={(e) => handleSearchFinancial(e.target.value)}
                                    />
                                    {searching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-[200px] overflow-auto py-1">
                                            {searchResults.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex flex-col"
                                                    onClick={() => selectFinancialProject(p)}
                                                >
                                                    <span className="font-medium">{p.description}</span>
                                                    <span className="text-xs text-muted-foreground">{p.costCenterCode} • {p.managerName}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-background border p-3 rounded-md">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium flex items-center gap-2">
                                            {selectedFinancialProject.description}
                                            <Badge variant="outline" className="text-[10px] h-5 bg-green-50 text-green-700 border-green-200">VInculado</Badge>
                                        </span>
                                        <span className="text-xs text-muted-foreground">{selectedFinancialProject.costCenterCode}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => {
                                            setSelectedFinancialProject(null)
                                            form.setValue("financialProjectId", undefined)
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
                                            <SelectItem value="Educação">Educação</SelectItem>
                                            <SelectItem value="Saúde">Saúde</SelectItem>
                                            <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                                            <SelectItem value="Social">Social</SelectItem>
                                            <SelectItem value="Evangelismo">Evangelismo</SelectItem>
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
                                        {projectTags.map((tag) => {
                                             const isChecked = field.value?.includes(tag.label)
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
                                                                ? [...currentTags, tag.label]
                                                                : currentTags.filter((value) => value !== tag.label)
                                                            field.onChange(newTags)
                                                        }}
                                                    />
                                                    <span className="text-xs font-normal pointer-events-none z-10">
                                                        {tag.label}
                                                    </span>
                                                    {/* Overlay label to make the whole card clickable */}
                                                    <label 
                                                        htmlFor={`tag-${tag.id}`}
                                                        className="absolute inset-0 cursor-pointer"
                                                    >
                                                        <span className="sr-only">{tag.label}</span>
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
