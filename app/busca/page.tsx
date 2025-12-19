"use client"

import { useSearchParams } from "next/navigation"
import { SearchFilters, AdvancedFiltersState } from "@/components/search/search-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderOpen, MapPin, Building2, User, ChevronRight, Tag as TagIcon, CreditCard, ThumbsUp, UserCheck, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useMemo, Suspense } from "react"
import { usePermissions } from "@/hooks/use-permissions"


// Mock Data Types (Same as before)
interface SearchResult {
    id: string
    title: string
    description: string
    type: 'project' | 'institution' | 'person' | 'location'
    category?: string 
    financialValue?: number
    status?: string // New field
    entityId?: string
    responsibleId?: string
    indicationId?: string
    extensionId?: string
    tagIds?: string[]
    thanked?: boolean
    
    // Display fields
    location?: string
    responsibleName?: string
    entityName?: string
    indicationName?: string
}

// Expanded Mock Data (Same as before)
const MOCK_RESULTS: SearchResult[] = [
    {
        id: "1",
        title: "Projeto Amazônia",
        description: "Expansão missionária e apoio comunitário na região amazônica.",
        type: "project",
        category: "missionary",
        financialValue: 12000,
        status: "em_andamento",
        entityId: "ent_1",
        responsibleId: "resp_1",
        indicationId: "ind_1",
        extensionId: "ext_3",
        tagIds: ["tag_agua", "tag_fome"],
        thanked: true,
        location: "Brasil, AM",
        responsibleName: "João Silva",
        indicationName: "Pr. Marcos Silva"
    },
    {
        id: "2",
        title: "Construção de Poços",
        description: "Projeto humanitário para levar água potável a comunidades carentes.",
        type: "project",
        category: "construction",
        financialValue: 45000,
        status: "em_andamento",
        entityId: "ent_2",
        responsibleId: "resp_2",
        indicationId: "ind_2",
        extensionId: "ext_2",
        tagIds: ["tag_construcao", "tag_agua"],
        thanked: false,
        location: "Angola",
        responsibleName: "Maria Santos",
        indicationName: "Dra. Helena Costa"
    },
    {
        id: "3",
        title: "Apoio a Refugiados",
        description: "Assistência social e integração para famílias refugiadas em zonas de conflito.",
        type: "project",
        category: "social",
        financialValue: 8000,
        status: "concluido",
        entityId: "ent_3",
        responsibleId: "resp_3",
        indicationId: "ind_3",
        extensionId: "ext_1",
        tagIds: ["tag_guerra", "tag_refugiados"],
        thanked: true,
        location: "Ucrânia",
        responsibleName: "Pedro Costa",
        indicationName: "Dir. Roberto Almeida"
    },
     {
        id: "4",
        title: "Escola Comunitária",
        description: "Reforma e ampliação da escola local para crianças em risco.",
        type: "project",
        category: "education",
        financialValue: 60000,
        status: "pendente",
        entityId: "ent_1",
        responsibleId: "resp_4",
        indicationId: "ind_1",
        extensionId: "ext_4",
        tagIds: ["tag_construcao", "tag_criancas"],
        thanked: false,
        location: "Brasil, SP",
        responsibleName: "Ana Oliveira",
        indicationName: "Pr. Marcos Silva"
    },
    {
        id: "5",
        title: "Caravana da Saúde Mental",
        description: "Atendimento psicológico itinerante.",
        type: "project",
        category: "health",
        financialValue: 3500,
        status: "concluido",
        entityId: "ent_4",
        responsibleId: "resp_5",
        indicationId: "ind_4",
        extensionId: "ext_1",
        tagIds: ["tag_saude_mental"],
        thanked: true,
        location: "Brasil, BA",
        responsibleName: "Carlos Souza",
        indicationName: "Pra. Julia Ferreira"
    }
]

// Mappings for labels (Simplified for redundancy)
const categoryLabels: Record<string, string> = {
    missionary: "Missionário", humanitarian: "Humanitário", social: "Social", construction: "Construção", education: "Educação", health: "Saúde"
};
const statusLabels: Record<string, string> = {
    concluido: "Concluído", em_andamento: "Em Andamento", pendente: "Pendente", cancelado: "Cancelado"
};
const entityLabels: Record<string, string> = {
    ent_1: "Igreja Local", ent_2: "ONG Esperança", ent_3: "Associação Vida", ent_4: "Missão Global"
};
const responsibleLabels: Record<string, string> = {
    resp_1: "João Silva", resp_2: "Maria Santos", resp_3: "Pedro Costa", resp_4: "Ana Oliveira", resp_5: "Carlos Souza"
};
const indicationLabels: Record<string, string> = {
    ind_1: "Pr. Marcos Silva", ind_2: "Dra. Helena Costa", ind_3: "Dir. Roberto Almeida", ind_4: "Pra. Julia Ferreira"
};
const extensionLabels: Record<string, string> = {
    ext_1: "Curto Prazo", ext_2: "Médio Prazo", ext_3: "Longo Prazo", ext_4: "Recorrente"
};
const tagLabels: Record<string, string> = {
    tag_guerra: "Guerra", tag_construcao: "Construção", tag_fome: "Combate à Fome", tag_criancas: "Crianças em Risco", tag_agua: "Água Potável", tag_refugiados: "Refugiados", tag_saude_mental: "Saúde Mental"
};
const thankedLabels: Record<string, string> = {
    yes: "Agradecido: Sim", no: "Agradecido: Não"
};


function SearchContent() {
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ''
    const { canViewFinancials } = usePermissions()
    
    // Initial State
    const [filters, setFilters] = useState<AdvancedFiltersState>({
        category: [],
        financialRange: [0, 100000],
        entities: [],
        responsible: [],
        indication: [],
        status: [],
        extension: [],
        tags: [],
        thanked: []
    })

    // Filter Logic
    const filteredResults = useMemo(() => {
        return MOCK_RESULTS.filter(item => {
            const matchText = item.title.toLowerCase().includes(initialQuery.toLowerCase()) || 
                              item.description?.toLowerCase().includes(initialQuery.toLowerCase())
            if (!matchText) return false;
            
            if (filters.category.length > 0 && (!item.category || !filters.category.includes(item.category))) return false;
            if (item.financialValue !== undefined) {
                 if (item.financialValue < filters.financialRange[0] || item.financialValue > filters.financialRange[1]) return false;
            }
            if (filters.entities.length > 0 && (!item.entityId || !filters.entities.includes(item.entityId))) return false;
            if (filters.responsible.length > 0 && (!item.responsibleId || !filters.responsible.includes(item.responsibleId))) return false;
            if (filters.indication.length > 0 && (!item.indicationId || !filters.indication.includes(item.indicationId))) return false;
            if (filters.status.length > 0 && (!item.status || !filters.status.includes(item.status))) return false;
            if (filters.extension.length > 0 && (!item.extensionId || !filters.extension.includes(item.extensionId))) return false;
            if (filters.tags.length > 0) {
                if (!item.tagIds) return false;
                if (!filters.tags.some(tag => item.tagIds?.includes(tag))) return false;
            }
            if (filters.thanked.length > 0) {
                 const isThankedStr = item.thanked ? 'yes' : 'no';
                 if (!filters.thanked.includes(isThankedStr)) return false;
            }

            return true;
        })
    }, [initialQuery, filters]);

    // Counts
    const counts = useMemo(() => {
         const baseSet = MOCK_RESULTS.filter(item => 
            item.title.toLowerCase().includes(initialQuery.toLowerCase()) || 
            item.description?.toLowerCase().includes(initialQuery.toLowerCase())
         );
         const newCounts: Record<string, Record<string, number>> = { category: {}, entities: {}, responsible: {}, indication: {}, status: {}, extension: {}, tags: {}, thanked: {} };
         const inc = (cat: string, id?: string) => { if (id) newCounts[cat][id] = (newCounts[cat][id] || 0) + 1; }

         baseSet.forEach(item => {
             inc('category', item.category);
             inc('entities', item.entityId);
             inc('responsible', item.responsibleId);
             inc('indication', item.indicationId);
             inc('status', item.status);
             inc('extension', item.extensionId);
             if (item.thanked !== undefined) inc('thanked', item.thanked ? 'yes' : 'no');
             item.tagIds?.forEach(t => inc('tags', t));
         });
         return newCounts;
    }, [initialQuery]);
    
    // Check if any results in the current query context (ignoring filters) have financial data
    const hasFinancialData = useMemo(() => {
        const baseSet = MOCK_RESULTS.filter(item => 
            item.title.toLowerCase().includes(initialQuery.toLowerCase()) || 
            item.description?.toLowerCase().includes(initialQuery.toLowerCase())
         );
         return baseSet.some(item => item.financialValue !== undefined);
    }, [initialQuery]);

    const handleFilterChange = (category: keyof AdvancedFiltersState, value: string | number | number[] | string[], checked?: boolean) => {
        if (category === 'financialRange') {
             setFilters(prev => ({ ...prev, financialRange: value as [number, number] }))
        } else {
             setFilters(prev => {
                const current = prev[category] as string[]
                return { 
                    ...prev, 
                    [category]: checked ? [...current, value] : current.filter(item => item !== value) 
                }
            })
        }
    }

    const removeFilter = (category: keyof AdvancedFiltersState, value: string | number | number[] | string[]) => {
         handleFilterChange(category, value, false);
    }

    const typeIcons = {
        'project': FolderOpen, 'institution': Building2, 'person': User, 'location': MapPin
    }

    // Active Filters Helper
    const activeFiltersList = useMemo(() => {
        const list: { label: string, category: keyof AdvancedFiltersState, value: string }[] = [];
        
        filters.category.forEach(v => list.push({ label: categoryLabels[v] || v, category: 'category', value: v }));
        filters.entities.forEach(v => list.push({ label: entityLabels[v] || v, category: 'entities', value: v }));
        filters.responsible.forEach(v => list.push({ label: responsibleLabels[v] || v, category: 'responsible', value: v }));
        filters.indication.forEach(v => list.push({ label: indicationLabels[v] || v, category: 'indication', value: v }));
        filters.status.forEach(v => list.push({ label: statusLabels[v] || v, category: 'status', value: v }));
        filters.extension.forEach(v => list.push({ label: extensionLabels[v] || v, category: 'extension', value: v }));
        filters.tags.forEach(v => list.push({ label: tagLabels[v] || v, category: 'tags', value: v }));
        filters.thanked.forEach(v => list.push({ label: thankedLabels[v] || v, category: 'thanked', value: v }));
        
        return list;
    }, [filters]);

    // Financial Range Display
    const isFinancialChanged = filters.financialRange[0] > 0 || filters.financialRange[1] < 100000;

    return (
        <div className="container mx-auto py-10 space-y-8">
             <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0 border-r border-border/50 pr-6 hidden md:block">
                    <SearchFilters 
                        filters={filters} 
                        onFilterChange={handleFilterChange} 
                        counts={counts}
                        hasFinancialData={hasFinancialData && canViewFinancials}
                    />
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="mb-6 space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Resultados</h1>
                            <p className="text-muted-foreground">
                                Mostrando resultados para <span className="font-semibold">&quot;{initialQuery}&quot;</span>
                                {filteredResults.length > 0 ? ` (${filteredResults.length} encontrados)` : ''}
                            </p>
                        </div>

                        {/* Active Filters Chips */}
                        {(activeFiltersList.length > 0 || isFinancialChanged) && (
                            <div className="flex flex-wrap gap-2 items-center pt-2">
                                
                                {isFinancialChanged && (
                                     <Badge variant="secondary" className="px-2 py-1 gap-1 hover:bg-muted">
                                        $$: {filters.financialRange[0]} - {filters.financialRange[1]}
                                        <X 
                                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                                            onClick={() => setFilters(prev => ({ ...prev, financialRange: [0, 100000] }))}
                                        />
                                    </Badge>
                                )}

                                {activeFiltersList.map((f, idx) => (
                                    <Badge key={`${f.category}-${f.value}-${idx}`} variant="secondary" className="px-2 py-1 gap-1 hover:bg-muted">
                                        {f.label}
                                        <X 
                                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                                            onClick={() => removeFilter(f.category, f.value)}
                                        />
                                    </Badge>
                                ))}
                                
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-xs text-muted-foreground hover:text-destructive"
                                    onClick={() => setFilters({ 
                                        category: [], financialRange: [0, 100000], entities: [], responsible: [], indication: [], status: [], extension: [], tags: [], thanked: [] 
                                    })}
                                >
                                    Limpar todos
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {filteredResults.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg bg-muted/10">
                                <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
                                <Button 
                                    variant="link" 
                                    onClick={() => setFilters({ 
                                        category: [], financialRange: [0, 100000], entities: [], responsible: [], indication: [], status: [], extension: [], tags: [], thanked: [] 
                                    })}
                                >
                                    Limpar filtros
                                </Button>
                            </div>
                        ) : (
                            filteredResults.map((result) => {
                                const Icon = typeIcons[result.type] || FolderOpen
                                return (
                                    <Card key={result.id} className="hover:bg-muted/50 transition-colors cursor-pointer group py-0">
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <Badge variant="outline" className="capitalize flex gap-1 items-center font-normal">
                                                        <Icon className="w-3 h-3" />
                                                        {result.type === 'project' ? 'Projeto' : result.type}
                                                    </Badge>
                                                    {result.category && (
                                                        <Badge variant="secondary" className="capitalize">
                                                            {categoryLabels[result.category] || result.category}
                                                        </Badge>
                                                    )}
                                                    {result.status && (
                                                        <Badge variant="outline" className="capitalize text-xs">
                                                            {statusLabels[result.status] || result.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl mt-2 group-hover:text-primary transition-colors flex items-center gap-2">
                                                {result.title}
                                                <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <CardDescription className="line-clamp-2 mb-3">
                                                {result.description}
                                            </CardDescription>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                {result.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {result.location}
                                                    </div>
                                                )}
                                                {result.financialValue && canViewFinancials && (
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(result.financialValue)}
                                                    </div>
                                                )}
                                                {result.indicationName && (
                                                    <div className="flex items-center gap-1">
                                                        <UserCheck className="w-3 h-3" />
                                                        {result.indicationName}
                                                    </div>
                                                )}
                                                {result.tagIds && result.tagIds.map(tag => (
                                                    <div key={tag} className="flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded">
                                                        <TagIcon className="w-3 h-3" />
                                                        {tagLabels[tag] || tag}
                                                    </div>
                                                ))}
                                                {result.thanked && (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 flex gap-1 h-5">
                                                            <ThumbsUp className="w-3 h-3" /> Agradecido
                                                        </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchLoading />}>
            <SearchContent />
        </Suspense>
    )
}

function SearchLoading() {
    return (
        <div className="container mx-auto py-10 space-y-8">
             <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters Loading */}
                <aside className="w-full md:w-64 shrink-0 border-r border-border/50 pr-6 hidden md:block space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-2 pt-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Loading */}
                <div className="flex-1 min-w-0">
                    <div className="mb-6 space-y-4">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                        <Skeleton className="h-5 w-24 rounded-full" />
                                    </div>
                                    <Skeleton className="h-7 w-3/4" />
                                    <Skeleton className="h-5 w-full" />
                                    <div className="flex gap-4 pt-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
