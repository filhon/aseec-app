"use client"

import { useMemo, useState } from "react"
import { mockDashboardProjects } from "@/components/dashboard/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, TrendingUp, LayoutDashboard, Search, X, MapPin, Map as MapIcon, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
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
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export default function CountriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isExpanded, setIsExpanded] = useState(false) // For mobile counters

  const stats = useMemo(() => {
    const uniqueCountries = new Set(mockDashboardProjects.map(p => p.country)).size
    const uniqueStates = new Set(mockDashboardProjects.map(p => p.state)).size
    const uniqueMunicipalities = new Set(mockDashboardProjects.map(p => p.municipality)).size
    return { uniqueCountries, uniqueStates, uniqueMunicipalities }
  }, [])

  const countriesData = useMemo(() => {
    const data: Record<string, { totalInvestment: number, projectCount: number, country: string }> = {}

    mockDashboardProjects.forEach(project => {
        if (!data[project.country]) {
            data[project.country] = {
                country: project.country,
                totalInvestment: 0,
                projectCount: 0
            }
        }
        data[project.country].totalInvestment += project.investment
        data[project.country].projectCount += 1
    })

    let results = Object.values(data).sort((a, b) => b.totalInvestment - a.totalInvestment)

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase()
        results = results.filter(item => item.country.toLowerCase().includes(lowerTerm))
    }

    return results
  }, [searchTerm])

  const countryCodes: Record<string, string> = {
    "Brasil": "br",
    "Moçambique": "mz",
    "Angola": "ao",
    "Guiné-Bissau": "gw",
    "Ucrânia": "ua"
  }

  return (
    <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500">
      
      {/* Location Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Países</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCountries}</div>
             <p className="text-xs text-muted-foreground mt-1">Geografia Global</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm hover:shadow-md transition-shadow ${!isExpanded ? 'hidden md:block' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados</CardTitle>
            <MapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueStates}</div>
             <p className="text-xs text-muted-foreground mt-1">Nacional</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm hover:shadow-md transition-shadow ${!isExpanded ? 'hidden md:block' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Municípios</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueMunicipalities}</div>
             <p className="text-xs text-muted-foreground mt-1">Local</p>
          </CardContent>
        </Card>
      </div>

       {/* Mobile Toggle Button */}
       <div className="flex justify-center md:hidden -mt-2 mb-4">
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 gap-1 text-xs text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {isExpanded ? (
                <>Menos detalhes <ChevronUp className="h-3 w-3" /></>
            ) : (
                <>Mais detalhes <ChevronDown className="h-3 w-3" /></>
            )}
        </Button>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Países</h1>
                <p className="text-muted-foreground mt-1">Visão geral dos investimentos por país.</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar país..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {countriesData.map((item) => {
            const code = countryCodes[item.country]
            const slug = slugify(item.country)

            return (
                <Link key={item.country} href={`/dashboard/paises/${slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {code ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img 
                                            src={`https://flagcdn.com/w40/${code}.png`}
                                            srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
                                            width={28}
                                            height={20}
                                            alt={`Bandeira ${item.country}`}
                                            className="rounded-sm object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="bg-muted p-1.5 rounded-sm">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{item.country}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FavoriteButton 
                                    id={slug} 
                                    type="country" 
                                    title={item.country} 
                                    subtitle={`${item.projectCount} Projetos`} 
                                    variant="icon"
                                    className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-2xl font-bold">{formatCurrency(item.totalInvestment)}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                         <TrendingUp className="h-3 w-3" />
                                         Investimento Total
                                    </div>
                                </div>
                                
                                <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <LayoutDashboard className="h-3 w-3" />
                                            Projetos
                                        </span>
                                        <span className="font-semibold bg-secondary px-2 py-0.5 rounded-full text-xs">
                                            {item.projectCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            )
        })}
      </div>
    </div>
  )
}
