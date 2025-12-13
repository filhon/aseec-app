

import Link from "next/link"
import { notFound } from "next/navigation"
import { mockDashboardProjects } from "@/components/dashboard/data"
import { ProjectMural } from "@/components/dashboard/project-mural"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area" // Keep if used elsewhere or remove
import { Progress } from "@/components/ui/progress"
import { 
    ArrowLeft, Calendar, User, Users, Building2, MapPin, Tag, 
    DollarSign, CheckCircle2, AlertCircle, FileText, 
    MessageSquare, Paperclip, Image as ImageIcon, File, Video,
    Clock, Globe, Heart, LayoutDashboard
} from "lucide-react"

// Since Next.js 15+, params is a Promise. 
// However, since this is a client component ("use client"), we access it differently or it might be passed as promise.
// Actually, standard pattern for valid client components receiving params is to just receive them, 
// BUT in Next.js 15 async params is standard for server components.
// For Client Components, they still receive params as props, but it's cleaner to make the page a Server Component that renders a Client Component 
// OR just use `use()` if passing promise in React 19 (which Next 15 uses).
// Let's assume standard "Page" is Server Component by default, but I need "use client" for tabs/interactive stuff?
// No, I can make the Page Server Component and import Client Components sections.
// But to be consistent with previous pages which are "use client", I'll just Unwrap the params if needed or treat it as client page.
// Wait, if I mark "use client" at top, params handling might be different in v15.
// Let's stick safe pattern: Page is Server Component (default), it fetches data, passes to Client View component if interactivity needed.
// BUT, the prompt asked to focus on frontend.
// I will just make it a Client Component for simplicity and interactivity (tabs) and handle params unwrapping with `use()` if I was on React19 true, 
// but Next.js "use client" pages receive params as props directly in some versions?
// Actually, in Next.js 15, `params` is ALWAYS a Promise, even in client components? No, usually in Server Components.
// Let's try making the main exported page a Server Component that awaits params, then passes ID to a Main Content Client Component.

// However, typically `page.tsx` can be async.

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = mockDashboardProjects.find(p => p.id === id)

    if (!project) {
        notFound()
    }

    return (
        <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="icon" asChild className="mt-1 shrink-0">
                        <Link href="/projetos">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-3xl font-bold tracking-tight text-primary">{project.title}</h1>
                            <BadgeStatus status={project.status} />
                        </div>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> {project.institution}
                            <span className="text-border">|</span>
                            <MapPin className="h-4 w-4" /> {project.municipality}, {project.state}
                        </p>
                    </div>
                </div>
                {/* Actions could go here */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Overview, Meta & Stats */}
                <div className="space-y-6 lg:col-span-1 h-fit">
                    
                    {/* Overview - Moved to Left per user request */}
                    <Card className="border-l-4 border-l-primary/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                                Visão Geral
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground leading-relaxed">
                                {project.description || "Nenhuma descrição disponível para este projeto."}
                            </div>
                            
                            {project.reachedPeople && (
                                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                                    <div className="bg-primary/10 p-2 rounded-full shrink-0">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold leading-none">{project.reachedPeople.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Pessoas impactadas</p>
                                    </div>
                                </div>
                            )}

                             {project.observations && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 p-3 rounded-lg text-xs">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-500 mb-1 flex items-center gap-1.5">
                                        <AlertCircle className="h-3 w-3" /> Observações
                                    </h4>
                                    <p className="text-yellow-700 dark:text-yellow-400 leading-snug">{project.observations}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Basic Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Informações Básicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 gap-1">
                                <span className="text-muted-foreground text-xs font-medium uppercase">Responsável</span>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium truncate" title={project.responsible}>{project.responsible}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-muted-foreground text-xs font-medium uppercase">Início</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{project.startDate || "N/A"}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs font-medium uppercase">Fim Previsto</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{project.endDate || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                            {project.indication && (
                                <>
                                    <Separator />
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium uppercase">Indicação</span>
                                        <p className="mt-1 font-medium italic">{project.indication}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                Financeiro
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Solicitado</span>
                                    <p className="text-lg font-bold">
                                        {formatCurrency(project.requestedValue || project.investment)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Aprovado</span>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(project.approvedValue || project.investment)}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Investido até o momento</span>
                                    <span className="font-medium">
                                        {formatCurrency(project.investmentByYear.reduce((acc, curr) => acc + curr.value, 0))}
                                    </span>
                                </div>
                                <Progress value={75} className="h-2" /> 
                            </div>

                            {project.thanked !== undefined && (
                                <div className={`flex items-center gap-2 text-sm p-2 rounded-md ${project.thanked ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                                    {project.thanked ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <span>{project.thanked ? "Agradecimento enviado" : "Aguardando agradecimento"}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Types & Tags */}
                    <Card>
                         <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Tag className="h-4 w-4 text-primary" />
                                Classificação
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-xs text-muted-foreground uppercase font-semibold mb-1 block">Categoria</span>
                                <Badge variant="secondary">{project.category}</Badge>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase font-semibold mb-1 block">Extensão</span>
                                <div className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="capitalize">{project.extension}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Tags</span>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs font-normal">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column - Mural Feed */}
                <div className="space-y-6 lg:col-span-2">
                    <ProjectMural feed={project.feed} />
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
        <Badge variant="outline" className={`border ${style}`}>
            {label}
        </Badge>
    )
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}
