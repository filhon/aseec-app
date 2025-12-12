"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, MapPin, Users, Building2, Globe, Clock, RefreshCcw, Filter, X } from "lucide-react"
import { mockDashboardProjects, DashboardProject } from "@/components/dashboard/data"
import { mockProjects, ProjectLocation } from "@/components/map/data"
import { ProjectsPieChart } from "@/components/dashboard/projects-pie-chart"
import { ProjectUpdates } from "@/components/dashboard/project-updates"

// Dynamically import MapView
const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">Carregando mapa...</div>,
})

// Continent mapping helper (simple version)
const getContinent = (country: string) => {
    const continentMap: Record<string, string> = {
        'Brasil': 'América do Sul',
        'Ucrânia': 'Europa',
        'Angola': 'África',
        'Moçambique': 'África',
        'Guiné-Bissau': 'África',
        'Estados Unidos': 'América do Norte',
    }
    return continentMap[country] || 'Outro'
}

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [mapFilteredIds, setMapFilteredIds] = useState<Set<string> | null>(null)
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

    // Filter logic
    const filteredProjects = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim()
        
        // Base matching by search term
        let result = mockDashboardProjects
        if (lowerSearch) {
            result = result.filter(project => {
                const continent = getContinent(project.country).toLowerCase()
                return (
                    project.title.toLowerCase().includes(lowerSearch) ||
                    project.responsible.toLowerCase().includes(lowerSearch) ||
                    project.institution.toLowerCase().includes(lowerSearch) ||
                    project.municipality.toLowerCase().includes(lowerSearch) ||
                    project.state.toLowerCase().includes(lowerSearch) ||
                    project.country.toLowerCase().includes(lowerSearch) ||
                    continent.includes(lowerSearch)
                )
            })
        }

        // Apply map filter if exists
        if (mapFilteredIds) {
            result = result.filter(p => mapFilteredIds.has(p.id))
        }

        // Apply category filter
        if (categoryFilter) {
            result = result.filter(p => p.category === categoryFilter)
        }

        return result
    }, [searchTerm, mapFilteredIds, categoryFilter])
    
    // Projects for Chart (excludes category filter so we can see other options)
    const projectsForChart = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim()
        let result = mockDashboardProjects
        
        if (lowerSearch) {
             result = result.filter(project => {
                const continent = getContinent(project.country).toLowerCase()
                return (
                    project.title.toLowerCase().includes(lowerSearch) ||
                    project.responsible.toLowerCase().includes(lowerSearch) ||
                    project.institution.toLowerCase().includes(lowerSearch) ||
                    project.municipality.toLowerCase().includes(lowerSearch) ||
                    project.state.toLowerCase().includes(lowerSearch) ||
                    project.country.toLowerCase().includes(lowerSearch) ||
                    continent.includes(lowerSearch)
                )
            })
        }
        if (mapFilteredIds) {
            result = result.filter(p => mapFilteredIds.has(p.id))
        }
        return result
    }, [searchTerm, mapFilteredIds])

    const handlePinClick = (project: ProjectLocation) => {
        setMapFilteredIds(new Set([project.id]))
    }

    const handleClusterClick = (projects: ProjectLocation[]) => {
        setMapFilteredIds(new Set(projects.map(p => p.id)))
    }

    // Map projects Logic: Filter map pins based on the filtered list IDs if possible, or just Show All if no search.
    // Since map data and dashboard data are separate mocks, we'll filter the map pins roughly by matching titles or IDs if they aligned.
    // For now, let's filter map pins by title match against the search term to keep it consistent visually.
    const filteredMapProjects = useMemo(() => {
         const lowerSearch = searchTerm.toLowerCase().trim()
         if (!lowerSearch) return mockProjects

         return mockProjects.filter(p => 
            p.title.toLowerCase().includes(lowerSearch) ||
            p.responsible.toLowerCase().includes(lowerSearch) ||
            p.address.toLowerCase().includes(lowerSearch)
         )
    }, [searchTerm])



    return (
        <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500">
            
            {/* Header with Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Projetos</h1>
                    <p className="text-muted-foreground mt-1">Gerencie e acompanhe o progresso de todos os projetos.</p>
                </div>
                
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por projeto, responsável, local..." 
                        className="pl-9 bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Top Section: Map, Pie, Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[450px]">
                
                {/* Map Card */}
                <Card className="lg:col-span-2 shadow-sm overflow-hidden flex flex-col h-[450px] p-0 border-0 ring-1 ring-border">
                    <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 w-full h-full">
                        <MapView 
                            onPinClick={handlePinClick} 
                            onClusterClick={handleClusterClick} 
                            style={{ height: '100%', width: '100%' }}
                        />
                        {/* Map Overlay Info */}
                        <div className="absolute top-4 right-4 z-[400] bg-background/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-medium border flex items-center gap-2">
                             <Globe className="h-3 w-3 text-primary" />
                             <span>{filteredMapProjects.length} locais</span>
                        </div>
                    </div>
                </Card>

                {/* Pie Chart */}
                <div className="h-[450px]">
                     <ProjectsPieChart 
                        projects={projectsForChart} 
                        selectedCategory={categoryFilter}
                        onCategoryClick={(category) => setCategoryFilter(category === categoryFilter ? null : category)}
                     />
                </div>

                {/* Updates Card */}
                <div className="h-[450px]">
                    <ProjectUpdates />
                </div>
            </div>

            {/* Projects List Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Todos os Projetos
                    </h2>
                    <div className="flex items-center gap-2">
                        {(mapFilteredIds || categoryFilter) && (
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                    setMapFilteredIds(null)
                                    setCategoryFilter(null)
                                }} 
                                className="h-8 gap-2"
                            >
                                <RefreshCcw className="h-3 w-3" />
                                Limpar filtros
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">{filteredProjects.length} resultados</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map(project => (
                        <Link key={project.id} href={`/projetos/${project.id}`} className="block group">
                            <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md cursor-pointer">
                                <CardHeader className="pb-3 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <BadgeStatus status={project.status} />
                                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">
                                            {project.category}
                                        </span>
                                    </div>
                                    <div>
                                        <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1" title={project.title}>
                                            {project.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-1 text-xs mt-1">
                                            {project.institution}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2.5 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="truncate">{project.responsible}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="truncate">{project.municipality}, {project.state}</span>
                                        </div>
                                        <div className="pt-3 border-t flex justify-between items-center mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Investimento</span>
                                                <span className="font-bold text-foreground text-sm">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(project.investment)}
                                                </span>
                                            </div>
                                             <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Extensão</span>
                                                <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                                                    {project.extension}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    
                    {filteredProjects.length === 0 && (
                         <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum projeto encontrado com os filtros atuais.</p>
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-primary">
                                Limpar busca
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function BadgeStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'concluido': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        'em_andamento': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        'pendente': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        'cancelado': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    }

    const labels: Record<string, string> = {
        'concluido': 'Concluído',
        'em_andamento': 'Em Andamento',
        'pendente': 'Pendente',
        'cancelado': 'Cancelado',
    }

    const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    const label = labels[status] || status;

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${style}`}>
            {label}
        </span>
    )
}
