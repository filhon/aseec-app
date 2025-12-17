"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface FilterOption {
    id: string
    label: string
    count?: number
}

interface FilterGroupProps {
    title: string
    options: FilterOption[]
    selected: string[]
    onChange: (id: string, checked: boolean) => void
}

function FilterGroup({ title, options, selected, onChange }: FilterGroupProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const MAX_VISIBLE = 5
    
    // Sort options by count (descending)
    // Filter out options with 0 count
    const activeOptions = options.filter(o => (o.count || 0) > 0);
    
    if (activeOptions.length === 0) return null;

    const sortedOptions = [...activeOptions].sort((a, b) => (b.count || 0) - (a.count || 0))
    const visibleOptions = isExpanded ? sortedOptions : sortedOptions.slice(0, MAX_VISIBLE)
    const hasMore = sortedOptions.length > MAX_VISIBLE

    return (
        <div className="space-y-3 pt-4 first:pt-0 border-b border-border/50 pb-4 last:border-0 last:pb-0">
            <h4 className="text-sm font-medium leading-none flex justify-between items-center">
                {title}
                {selected.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] min-w-5 flex justify-center">
                        {selected.length}
                    </Badge>
                )}
            </h4>
            <div className="space-y-2">
                {visibleOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 group">
                        <Checkbox 
                            id={option.id} 
                            checked={selected.includes(option.id)}
                            onCheckedChange={(checked) => onChange(option.id, checked as boolean)}
                        />
                        <Label 
                            htmlFor={option.id} 
                            className="text-sm font-normal text-muted-foreground group-hover:text-foreground leading-none cursor-pointer flex-1 flex justify-between"
                        >
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                                <span className="text-xs text-muted-foreground/50">{option.count}</span>
                            )}
                        </Label>
                    </div>
                ))}
            </div>
            {hasMore && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs px-0 hover:bg-transparent text-primary/80 hover:text-primary"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <>ver menos <ChevronUp className="ml-1 w-3 h-3" /></>
                    ) : (
                        <>ver mais ({sortedOptions.length - MAX_VISIBLE}) <ChevronDown className="ml-1 w-3 h-3" /></>
                    )}
                </Button>
            )}
        </div>
    )
}

export interface AdvancedFiltersState {
    category: string[]
    financialRange: [number, number] 
    entities: string[]
    responsible: string[]
    indication: string[]
    status: string[]
    extension: string[]
    tags: string[]
    thanked: string[]
}

interface SearchFiltersProps {
    filters: AdvancedFiltersState
    onFilterChange: (category: keyof AdvancedFiltersState, value: string | number | number[] | string[], checked?: boolean) => void 
    counts?: Record<string, Record<string, number>>
    hasFinancialData?: boolean // New prop
}

export function SearchFilters({ filters, onFilterChange, counts = {}, hasFinancialData = true }: SearchFiltersProps) {
    
    const getCount = (cat: string, id: string) => counts[cat]?.[id] || 0

    const optionsCategory = [
        { id: "missionary", label: "Missionário" },
        { id: "humanitarian", label: "Humanitário" },
        { id: "social", label: "Social" },
        { id: "construction", label: "Construção" },
        { id: "education", label: "Educação" },
        { id: "health", label: "Saúde" },
    ].map(o => ({ ...o, count: getCount('category', o.id) }))

    const optionsEntities = [
        { id: "ent_1", label: "Igreja Local" },
        { id: "ent_2", label: "ONG Esperança" },
        { id: "ent_3", label: "Associação Vida" },
        { id: "ent_4", label: "Missão Global" },
        { id: "ent_5", label: "Projeto Resgate" },
        { id: "ent_6", label: "Fundação Amor" },
    ].map(o => ({ ...o, count: getCount('entities', o.id) }))

    const optionsResponsible = [
        { id: "resp_1", label: "João Silva" },
        { id: "resp_2", label: "Maria Santos" },
        { id: "resp_3", label: "Pedro Costa" },
        { id: "resp_4", label: "Ana Oliveira" },
        { id: "resp_5", label: "Carlos Souza" },
        { id: "resp_6", label: "Lucia Lima" },
    ].map(o => ({ ...o, count: getCount('responsible', o.id) }))

     const optionsIndication = [
        { id: "ind_1", label: "Pr. Marcos Silva" },
        { id: "ind_2", label: "Dra. Helena Costa" },
        { id: "ind_3", label: "Dir. Roberto Almeida" },
        { id: "ind_4", label: "Pra. Julia Ferreira" },
        { id: "ind_5", label: "Miss. Ricardo Gomes" },
    ].map(o => ({ ...o, count: getCount('indication', o.id) }))

    const optionsStatus = [
        { id: "concluido", label: "Concluído" },
        { id: "em_andamento", label: "Em Andamento" },
        { id: "pendente", label: "Pendente" },
        { id: "cancelado", label: "Cancelado" },
    ].map(o => ({ ...o, count: getCount('status', o.id) }))

    const optionsExtension = [
        { id: "ext_1", label: "Curto Prazo" },
        { id: "ext_2", label: "Médio Prazo" },
        { id: "ext_3", label: "Longo Prazo" },
        { id: "ext_4", label: "Recorrente" },
    ].map(o => ({ ...o, count: getCount('extension', o.id) }))

    const optionsTags = [
        { id: "tag_guerra", label: "Guerra" }, 
        { id: "tag_construcao", label: "Construção" }, 
        { id: "tag_fome", label: "Combate à Fome" }, 
        { id: "tag_criancas", label: "Crianças em Risco" }, 
        { id: "tag_agua", label: "Água Potável" }, 
        { id: "tag_refugiados", label: "Refugiados" }, 
        { id: "tag_saude_mental", label: "Saúde Mental" }, 
    ].map(o => ({ ...o, count: getCount('tags', o.id) }))

    const optionsThanked = [
        { id: "yes", label: "Sim" },
        { id: "no", label: "Não" },
    ].map(o => ({ ...o, count: getCount('thanked', o.id) }))

    return (
        <div className="space-y-6 pr-4">
            
            <FilterGroup 
                title="Categoria do Projeto"
                options={optionsCategory}
                selected={filters.category}
                onChange={(id, checked) => onFilterChange('category', id, checked)}
            />
            
            {/* Financial Slider */}
            {hasFinancialData && (
                <div className="space-y-4 pt-4 border-b border-border/50 pb-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium leading-none">Financeiro</h4>
                        <span className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(filters.financialRange[0])} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(filters.financialRange[1])}
                        </span>
                    </div>
                    <Slider 
                        defaultValue={[0, 100000]} 
                        max={100000} 
                        step={1000} 
                        minStepsBetweenThumbs={1}
                        value={filters.financialRange}
                        onValueChange={(val) => onFilterChange('financialRange', val as [number, number])}
                        className="py-2"
                    />
                </div>
            )}

            <FilterGroup 
                title="Entidades"
                options={optionsEntities}
                selected={filters.entities}
                onChange={(id, checked) => onFilterChange('entities', id, checked)}
            />

             <FilterGroup 
                title="Responsável"
                options={optionsResponsible}
                selected={filters.responsible}
                onChange={(id, checked) => onFilterChange('responsible', id, checked)}
            />

             <FilterGroup 
                title="Indicação"
                options={optionsIndication}
                selected={filters.indication}
                onChange={(id, checked) => onFilterChange('indication', id, checked)}
            />

             <FilterGroup 
                title="Status"
                options={optionsStatus}
                selected={filters.status}
                onChange={(id, checked) => onFilterChange('status', id, checked)}
            />

             <FilterGroup 
                title="Extensão"
                options={optionsExtension}
                selected={filters.extension}
                onChange={(id, checked) => onFilterChange('extension', id, checked)}
            />

             <FilterGroup 
                title="Tags"
                options={optionsTags}
                selected={filters.tags}
                onChange={(id, checked) => onFilterChange('tags', id, checked)}
            />

             <FilterGroup 
                title="Agradeceu?"
                options={optionsThanked}
                selected={filters.thanked}
                onChange={(id, checked) => onFilterChange('thanked', id, checked)}
            />
        </div>
    )
}
