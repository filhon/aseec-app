"use client"

import { useMemo, use } from "react"
import { mockDashboardProjects } from "@/components/dashboard/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, MapPin, Users, TrendingUp, LayoutDashboard, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
    .normalize('NFD') // Normalizes accents
    .replace(/[\u0300-\u036f]/g, '') // Removes diacritics
    .trim()
    .replace(/\s+/g, '-') // Replaces spaces with -
    .replace(/[^\w-]+/g, '') // Removes non-word chars
    .replace(/--+/g, '-') // Replaces multiple - with single -
}

const countryCodes: Record<string, string> = {
    "Brasil": "br",
    "Moçambique": "mz",
    "Angola": "ao",
    "Guiné-Bissau": "gw",
    "Ucrânia": "ua"
}

// Reusing BadgeStatus
function BadgeStatus({ status }: { status: string }) {
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

    const style = styles[status] || 'bg-gray-100 text-gray-700';
    const label = labels[status] || status;

    return (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${style}`}>
            {label}
        </span>
    )
}

export default function EntityPage({ params }: { params: Promise<{ entidade_id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const slug = resolvedParams.entidade_id

  // Find the entity name from the slug
  const entityName = useMemo(() => {
    const project = mockDashboardProjects.find(p => slugify(p.institution) === slug)
    return project ? project.institution : null
  }, [slug])

  // Filter projects for this entity
  const filteredProjects = useMemo(() => {
    if (!entityName) return []
    return mockDashboardProjects.filter(p => p.institution === entityName)
  }, [entityName])

  // Stats
  const stats = useMemo(() => {
    const totalInvested = filteredProjects.reduce((sum, p) => sum + p.investment, 0)
    const totalProjects = filteredProjects.length
    const uniqueCountries = new Set(filteredProjects.map(p => p.country)).size
    const uniqueMunicipalities = new Set(filteredProjects.map(p => p.municipality)).size
    
    return { totalInvested, totalProjects, uniqueCountries, uniqueMunicipalities }
  }, [filteredProjects])

  // Chart Data
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

  if (!entityName) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
              <h1 className="text-2xl font-bold">Entidade não encontrada</h1>
              <p className="text-muted-foreground mt-2">Não encontramos nenhum registro para esta entidade.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.back()}>Voltar</Button>
          </div>
      )
  }

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-500 container mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4">
                <div className="bg-muted p-4 rounded-md hidden md:block">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        {entityName}
                    </h1>
                    <p className="text-muted-foreground mt-1">Visão detalhada dos investimentos por entidade.</p>
                </div>
            </div>
        </div>
      </div>

       {/* Key Metrics / Counters */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma de todos os projetos</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">Total de projetos listados</p>
            </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alcance Geográfico</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueCountries} <span className="text-sm font-normal text-muted-foreground">Países</span></div>
                <p className="text-xs text-muted-foreground mt-1">{stats.uniqueMunicipalities} Municípios atingidos</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Investment Curve Chart */}
         <Card className="lg:col-span-3 shadow-sm border-0 bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
            <CardTitle>Investimento Anual ({entityName})</CardTitle>
            <CardDescription>
                Evolução do investimento ao longo dos anos nesta entidade.
            </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
            <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                        Sem dados históricos para esta entidade.
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
      </div>

       {/* Project List */}
       <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Projetos - {entityName} ({filteredProjects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
                const code = countryCodes[project.country]
                return (
                    <Link key={project.id} href={`/projetos/${project.id}`}>
                        <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <BadgeStatus status={project.status} />
                                    <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded uppercase">{project.category}</span>
                                </div>
                                <CardTitle className="mt-2 text-lg group-hover:text-primary transition-colors">{project.title}</CardTitle>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    {code && <img src={`https://flagcdn.com/w20/${code}.png`} width={14} className="rounded-sm" />}
                                    <span className="line-clamp-1">{project.country}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{project.responsible}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{project.municipality}, {project.state}</span>
                                    </div>
                                    <div className="pt-2 border-t mt-3 flex justify-between items-center">
                                        <span className="font-semibold text-foreground">{formatCurrency(project.investment)}</span>
                                        <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">{project.extension}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                )
            })}
        </div>
      </div>
    </div>
  )
}
