"use client"

import { useState, useMemo, useCallback } from "react"
import { mockDashboardProjects } from "@/components/dashboard/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LayoutDashboard, Users, Building2, MapPin, TrendingUp, Globe, Map as MapIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// --- Helpers ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  }

export default function DashboardPage() {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [extensionFilter, setExtensionFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  // --- Helper for Faceted Search ---
  const getFilteredProjects = useCallback((exclude: 'search' | 'category' | 'tag' | 'status' | 'extension' | 'year' | null) => {
    return mockDashboardProjects.filter(project => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = exclude === 'search' || 
        project.title.toLowerCase().includes(searchLower) ||
        project.responsible.toLowerCase().includes(searchLower) ||
        project.institution.toLowerCase().includes(searchLower)

      const matchesCategory = exclude === 'category' || categoryFilter === "all" || project.category === categoryFilter
      const matchesTag = exclude === 'tag' || tagFilter === "all" || project.tags.includes(tagFilter)
      const matchesStatus = exclude === 'status' || statusFilter === "all" || project.status === statusFilter
      const matchesExtension = exclude === 'extension' || extensionFilter === "all" || project.extension === extensionFilter
      const matchesYear = exclude === 'year' || yearFilter === "all" || project.investmentByYear.some(i => i.year.toString() === yearFilter)

      return matchesSearch && matchesCategory && matchesTag && matchesStatus && matchesExtension && matchesYear
    })
  }, [searchTerm, categoryFilter, tagFilter, statusFilter, extensionFilter, yearFilter])

  // --- Derived Data (Filtering) ---
  const filteredProjects = useMemo(() => getFilteredProjects(null), [getFilteredProjects])
  
  // --- Dynamic Counters ---
  const stats = useMemo(() => {
    const totalInvested = filteredProjects.reduce((sum, p) => sum + p.investment, 0)
    const totalProjects = filteredProjects.length
    const uniqueCountries = new Set(filteredProjects.map(p => p.country)).size
    const uniqueStates = new Set(filteredProjects.map(p => p.state)).size
    const uniqueMunicipalities = new Set(filteredProjects.map(p => p.municipality)).size

    return { totalInvested, totalProjects, uniqueCountries, uniqueStates, uniqueMunicipalities }
  }, [filteredProjects])

  // --- Insights ---
  const insights = useMemo(() => {
    // Top Countries by Investment
    const countryInvestment: Record<string, number> = {}
    filteredProjects.forEach(p => {
      countryInvestment[p.country] = (countryInvestment[p.country] || 0) + p.investment
    })
    const topCountries = Object.entries(countryInvestment)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Top Institutions by Investment
    const institutionInvestment: Record<string, number> = {}
    filteredProjects.forEach(p => {
      institutionInvestment[p.institution] = (institutionInvestment[p.institution] || 0) + p.investment
    })
    const topInstitutions = Object.entries(institutionInvestment)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return { topCountries, topInstitutions }
  }, [filteredProjects])

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const yearsMap: Record<number, number> = {}
    
    filteredProjects.forEach(project => {
      project.investmentByYear.forEach(item => {
        yearsMap[item.year] = (yearsMap[item.year] || 0) + item.value
      })
    })

    return Object.entries(yearsMap)
      .map(([year, value]) => ({ year: parseInt(year), value }))
      .sort((a, b) => a.year - b.year)
  }, [filteredProjects])

  // --- Dynamic Options (Facets) ---
  const availableYears = useMemo(() => {
    const projects = getFilteredProjects('year')
    return Array.from(new Set(projects.flatMap(p => p.investmentByYear.map(i => i.year)))).sort((a,b) => b-a)
  }, [getFilteredProjects])

  const availableCategories = useMemo(() => {
    const projects = getFilteredProjects('category')
    return Array.from(new Set(projects.map(p => p.category)))
  }, [getFilteredProjects])

  const availableTags = useMemo(() => {
    const projects = getFilteredProjects('tag')
    return Array.from(new Set(projects.flatMap(p => p.tags)))
  }, [getFilteredProjects])
    
  // --- Active Filters Helpers ---
  const activeFilters = useMemo(() => {
    const filters = []
    if (searchTerm) filters.push({ id: 'search', label: `Busca: ${searchTerm}`, type: 'search' })
    if (yearFilter !== 'all') filters.push({ id: 'year', label: `Ano: ${yearFilter}`, type: 'year' })
    if (categoryFilter !== 'all') filters.push({ id: 'category', label: `Categoria: ${categoryFilter}`, type: 'category' })
    if (tagFilter !== 'all') filters.push({ id: 'tag', label: `Tag: ${tagFilter}`, type: 'tag' })
    if (statusFilter !== 'all') filters.push({ id: 'status', label: `Status: ${statusFilter}`, type: 'status' })
    if (extensionFilter !== 'all') filters.push({ id: 'extension', label: `Extensão: ${extensionFilter}`, type: 'extension' })
    return filters
  }, [searchTerm, yearFilter, categoryFilter, tagFilter, statusFilter, extensionFilter])

  const removeFilter = (type: string) => {
    switch (type) {
      case 'search': setSearchTerm(""); break;
      case 'year': setYearFilter("all"); break;
      case 'category': setCategoryFilter("all"); break;
      case 'tag': setTagFilter("all"); break;
      case 'status': setStatusFilter("all"); break;
      case 'extension': setExtensionFilter("all"); break;
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setYearFilter("all")
    setCategoryFilter("all")
    setTagFilter("all")
    setStatusFilter("all")
    setExtensionFilter("all")
  }

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-500">
      
      {/* Search & Filters */}
      <div className="w-full border-b pb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* ... inputs ... */}
                <div className="relative">
                    <Input 
                        id="search"
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-background pl-10 w-full"
                    />
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="bg-background w-full">
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Anos</SelectItem>
                        {availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-background w-full">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        {availableCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="bg-background w-full">
                        <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Tags</SelectItem>
                        {availableTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background w-full">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={extensionFilter} onValueChange={setExtensionFilter}>
                    <SelectTrigger className="bg-background w-full">
                        <SelectValue placeholder="Extensão" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Extensões</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
                        <SelectItem value="completo">Completo</SelectItem>
                    </SelectContent>
                </Select>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground mr-2">Filtros ativos:</span>
                {activeFilters.map(filter => (
                    <div key={filter.id} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        {filter.label}
                        <button onClick={() => removeFilter(filter.type)} className="hover:text-foreground focus:outline-none">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="ml-auto text-xs h-8 text-muted-foreground hover:text-destructive"
                >
                    Limpar todos
                </Button>
            </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard de Projetos</h1>
          <p className="text-muted-foreground mt-1">Visão consolidada e estratégica dos investimentos.</p>
        </div>
      </div>

      {/* Key Metrics / Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Investido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
            <p className="text-xs text-muted-foreground mt-1">Consolidado dos projetos filtrados</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
             <p className="text-xs text-muted-foreground mt-1">Total listado</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Países Alcançados</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCountries}</div>
             <p className="text-xs text-muted-foreground mt-1">Diversidade geográfica</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados</CardTitle>
            <MapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueStates}</div>
             <p className="text-xs text-muted-foreground mt-1">Abrangência estadual</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Municípios</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueMunicipalities}</div>
             <p className="text-xs text-muted-foreground mt-1">Impacto local</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Investment Curve Chart */}
        <Card className="lg:col-span-2 shadow-sm border-0 bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle>Investimento Anual</CardTitle>
            <CardDescription>
              Evolução do investimento ao longo dos anos para os projetos selecionados.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[400px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis 
                                dataKey="year" 
                                stroke="var(--muted-foreground)" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <YAxis 
                                stroke="var(--muted-foreground)" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `R$ ${value / 1000}k`}
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip 
                                formatter={(value: number) => [formatCurrency(value), 'Investimento']}
                                labelFormatter={(label) => `Ano: ${label}`}
                                contentStyle={{ 
                                    borderRadius: 'var(--radius)', 
                                    border: '1px solid var(--border)', 
                                    backgroundColor: 'var(--popover)',
                                    color: 'var(--popover-foreground)' 
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="var(--chart-1)" 
                                fillOpacity={1} 
                                fill="url(#colorInvestment)" 
                                strokeWidth={3} 
                                dot={{ strokeWidth: 2, r: 4 }} 
                                activeDot={{ r: 6 }} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Sem dados para o período/filtro.
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Insights Column */}
        <div className="space-y-6">
            {/* Top Countries */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                        Top Países por Investimento
                        <Link href="/dashboard/paises" className="text-xs font-normal text-muted-foreground hover:underline cursor-pointer text-primary">Ver todos</Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {insights.topCountries.length > 0 ? insights.topCountries.map(([country, value], index) => {
                        const countryCodes: Record<string, string> = {
                            "Brasil": "br",
                            "Moçambique": "mz",
                            "Angola": "ao",
                            "Guiné-Bissau": "gw",
                            "Ucrânia": "ua"
                        }
                        const code = countryCodes[country]
                        const slug = slugify(country)

                        return (
                            <Link href={`/dashboard/paises/${slug}`} key={country} className="flex items-center justify-between text-sm group hover:bg-muted/50 p-2 rounded-md -mx-2 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${index < 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {index + 1}
                                    </span>
                                    {code ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={`https://flagcdn.com/w40/${code}.png`}
                                            srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
                                            width={20}
                                            height={15}
                                            alt={`Bandeira ${country}`}
                                            className="rounded-sm object-cover shadow-sm"
                                        />
                                    ) : (
                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span className="font-medium group-hover:text-primary transition-colors">{country}</span>
                                </div>
                                <span className="text-muted-foreground">{formatCurrency(value)}</span>
                            </Link>
                        )
                    }) : <p className="text-sm text-muted-foreground">Nenhum dado.</p>}
                </CardContent>
            </Card>

            {/* Top Institutions */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                        Top Entidades
                        <Link href="/dashboard/entidades" className="text-xs font-normal text-muted-foreground hover:underline cursor-pointer text-primary">Ver todos</Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {insights.topInstitutions.length > 0 ? insights.topInstitutions.map(([inst, value]) => {
                         const slug = slugify(inst)
                         return (
                            <Link href={`/dashboard/entidades/${slug}`} key={inst} className="flex items-center justify-between text-sm group hover:bg-muted/50 p-2 rounded-md -mx-2 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium truncate max-w-[120px] group-hover:text-primary transition-colors" title={inst}>{inst}</span>
                                </div>
                                <span className="text-muted-foreground">{formatCurrency(value)}</span>
                            </Link>
                         )
                    }) : <p className="text-sm text-muted-foreground">Nenhum dado.</p>}
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Projetos Listados ({filteredProjects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
                <Link key={project.id} href={`/projetos/${project.id}`}>
                    <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <BadgeStatus status={project.status} />
                                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded uppercase">{project.category}</span>
                            </div>
                            <CardTitle className="mt-2 text-lg group-hover:text-primary transition-colors">{project.title}</CardTitle>
                            <CardDescription className="line-clamp-1">{project.institution}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{project.responsible}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{project.municipality}, {project.state} - {project.country}</span>
                                </div>
                                <div className="pt-2 border-t mt-3 flex justify-between items-center">
                                    <span className="font-semibold text-foreground">{formatCurrency(project.investment)}</span>
                                    <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">{project.extension}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </div>
  )
}

function BadgeStatus({ status }: { status: string }) {
    // Helper simple badge since we don't have the Badge component
    const styles: Record<string, string> = {
        'concluido': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'em_andamento': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'pendente': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'cancelado': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }

    const labels: Record<string, string> = {
        'concluido': 'Concluído',
        'em_andamento': 'Em Andamento',
        'pendente': 'Pendente',
        'cancelado': 'Cancelado',
    }

    // Default to gray if not found
    const style = styles[status] || 'bg-gray-100 text-gray-700';
    const label = labels[status] || status;

    return (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${style}`}>
            {label}
        </span>
    )
}
