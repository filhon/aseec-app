"use client"

import { useMemo, useState } from "react"
import { mockDashboardProjects } from "@/components/dashboard/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Building2, TrendingUp, LayoutDashboard, Search, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function EntitiesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const entitiesData = useMemo(() => {
    const data: Record<string, { totalInvestment: number, projectCount: number, institution: string }> = {}

    mockDashboardProjects.forEach(project => {
        if (!data[project.institution]) {
            data[project.institution] = {
                institution: project.institution,
                totalInvestment: 0,
                projectCount: 0
            }
        }
        data[project.institution].totalInvestment += project.investment
        data[project.institution].projectCount += 1
    })

    let results = Object.values(data).sort((a, b) => b.totalInvestment - a.totalInvestment)

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase()
        results = results.filter(item => item.institution.toLowerCase().includes(lowerTerm))
    }

    return results
  }, [searchTerm])

  return (
    <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Entidades</h1>
                <p className="text-muted-foreground mt-1">Visão geral dos investimentos por entidade.</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar entidade..." 
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
        {entitiesData.map((item) => {
            const slug = slugify(item.institution)

            return (
                <Link key={item.institution} href={`/dashboard/entidades/${slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-muted p-1.5 rounded-sm group-hover:bg-primary/10 transition-colors">
                                        <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1" title={item.institution}>
                                        {item.institution}
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
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
        {entitiesData.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma entidade encontrada.</p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-primary">
                    Limpar busca
                </Button>
            </div>
        )}
      </div>
    </div>
  )
}
