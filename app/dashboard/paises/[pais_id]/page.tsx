"use client"

import { useMemo, use, useEffect } from "react"
import { useBreadcrumbStore } from "@/stores/use-breadcrumb-store"
import { mockDashboardProjects } from "@/components/dashboard/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, MapPin, Users, TrendingUp, Building2, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FavoriteButton } from "@/components/ui/favorite-button"

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

// Reusing BadgeStatus (can be refactored to a shared component)
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

export default function CountryPage({ params }: { params: Promise<{ pais_id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const slug = resolvedParams.pais_id

  // Find the country name from the slug
  // We iterate through projects to find a matching slug
  const countryName = useMemo(() => {
    const project = mockDashboardProjects.find(p => slugify(p.country) === slug)
    return project ? project.country : null
  }, [slug])

  // Breadcrumbs logic
  const { setLabel } = useBreadcrumbStore()
  useEffect(() => {
      if (countryName) {
          setLabel(slug, countryName)
      }
  }, [countryName, slug, setLabel])

  // Filter projects for this country
  const filteredProjects = useMemo(() => {
    if (!countryName) return []
    return mockDashboardProjects.filter(p => p.country === countryName)
  }, [countryName])

  // Stats
  const stats = useMemo(() => {
    const totalInvested = filteredProjects.reduce((sum, p) => sum + p.investment, 0)
    const totalProjects = filteredProjects.length
    const uniqueStates = new Set(filteredProjects.map(p => p.state)).size
    const uniqueMunicipalities = new Set(filteredProjects.map(p => p.municipality)).size
    
    // Top Institution
    const instMap: Record<string, number> = {}
    filteredProjects.forEach(p => instMap[p.institution] = (instMap[p.institution] || 0) + p.investment)
    const topInstitution = Object.entries(instMap).sort(([,a], [,b]) => b-a)[0]

    return { totalInvested, totalProjects, uniqueStates, uniqueMunicipalities, topInstitution }
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

  if (!countryName) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
              <h1 className="text-2xl font-bold">País não encontrado</h1>
              <p className="text-muted-foreground mt-2">Não encontramos nenhum registro para este país.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.back()}>Voltar</Button>
          </div>
      )
  }

  const code = countryCodes[countryName]

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-500 container mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
                {code ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                        src={`https://flagcdn.com/w160/${code}.png`}
                        width={80}
                        height={60}
                        alt={`Bandeira ${countryName}`}
                        className="rounded-md object-cover shadow-sm border hidden md:block" // Smaller on mobile?
                    />
                ) : (
                    <div className="bg-muted p-4 rounded-md hidden md:block">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            {countryName}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {code && <img src={`https://flagcdn.com/w40/${code}.png`} width={24} alt={countryName} className="rounded-sm shadow-sm md:hidden" />}
                        </h1>
                        <FavoriteButton 
                            id={String(slug)} 
                            type="country" 
                            title={countryName} 
                            subtitle={`${stats.totalProjects} Projetos`}
                            image={code ? `https://flagcdn.com/w160/${code}.png` : undefined}
                            className="h-8 w-8"
                        />
                    </div>
                    <p className="text-muted-foreground mt-1">Visão detalhada dos investimentos e projetos.</p>
                </div>
            </div>
            </div>
        </div>
      </div>

       {/* Key Metrics / Counters */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento Local</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total investido no país</p>
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
                <CardTitle className="text-sm font-medium">Abrangência</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueStates} <span className="text-sm font-normal text-muted-foreground">Estados / Províncias</span></div>
                <p className="text-xs text-muted-foreground mt-1">{stats.uniqueMunicipalities} Municípios atingidos</p>
            </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maior Parceiro</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-base font-bold truncate" title={stats.topInstitution?.[0] || '-'}>
                    {stats.topInstitution?.[0] || '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {stats.topInstitution ? formatCurrency(stats.topInstitution[1]) : 'R$ 0,00'}
                </p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Investment Curve Chart */}
         <Card className="lg:col-span-3 shadow-sm border-0 bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
            <CardTitle>Investimento Anual ({countryName})</CardTitle>
            <CardDescription>
                Evolução do investimento ao longo dos anos neste país.
            </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
            <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
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
                                stroke="var(--chart-2)" 
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
                        Sem dados históricos para este país.
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
      </div>

       {/* Project List */}
       <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Projetos em {countryName} ({filteredProjects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
                <Link key={project.id} href={`/projetos/${project.id}`}>
                    <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full relative">
                        <FavoriteButton 
                            id={project.id} 
                            type="project" 
                            title={project.title} 
                            subtitle={project.institution}
                            className="absolute top-4 right-4 z-10"
                        />
                        <CardHeader className="pb-3 pr-12">
                            <div className="flex items-center gap-2">
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
            ))}
        </div>
      </div>
    </div>
  )
}
