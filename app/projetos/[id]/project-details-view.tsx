"use client"

import { useState, useEffect } from "react"
import { useBreadcrumbStore } from "@/stores/use-breadcrumb-store"
import { DashboardProject, ProjectPost } from "@/components/dashboard/data"
import { ProjectMural } from "@/components/dashboard/project-mural"
import { ProjectGallery } from "@/components/dashboard/project-gallery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
    Calendar as CalendarIcon, MapPin, DollarSign, Users, Award, 
    ArrowLeft, Edit2, Save, X, 
    CheckCircle2, AlertCircle, Tag, AlertTriangle, Globe, User,
    LayoutDashboard, FileText
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { FavoriteButton } from "@/components/ui/favorite-button"

interface ProjectDetailsViewProps {
    initialProject: DashboardProject
}

export function ProjectDetailsView({ initialProject }: ProjectDetailsViewProps) {
    const [project, setProject] = useState(initialProject)
    const [feed, setFeed] = useState<ProjectPost[]>(initialProject.feed || [])
    const { setLabel } = useBreadcrumbStore()

    useEffect(() => {
        if (project.id && project.title) {
            setLabel(project.id, project.title)
        }
    }, [project.id, project.title, setLabel])

    // --- State for Editing ---
    const [isEditingClass, setIsEditingClass] = useState(false)
    const [isEditingOverview, setIsEditingOverview] = useState(false)
    const [isEditingBasic, setIsEditingBasic] = useState(false)
    const [isEditingFinance, setIsEditingFinance] = useState(false)

    // Forms
    const [classForm, setClassForm] = useState<{
        category: string
        extension: string
        tags: string
    }>({
        category: project.category,
        extension: project.extension,
        tags: project.tags.join(', ')
    })

    const [overviewForm, setOverviewForm] = useState({
        description: project.description || '',
        observations: project.observations || ''
    })

    const [basicForm, setBasicForm] = useState({
        responsible: project.responsible,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        lastVisit: project.lastVisit || '',
        indication: project.indication || ''
    })

    // Helper to add auto-post
    const addAutoPost = (title: string, content: string) => {
        const newPost: ProjectPost = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'update',
            author: "Sistema",
            role: "Automático",
            date: new Date().toISOString(),
            title: title,
            content: content
        }
        setFeed([newPost, ...feed])
    }

    // --- Save Handlers with Auto-Feed Logic ---

    const handleSaveClass = () => {
        const newTags = classForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        const changes = []

        if (classForm.category !== project.category) changes.push(`Categoria alterada de "${project.category}" para "${classForm.category}"`)
        if (classForm.extension !== project.extension) changes.push(`Extensão alterada de "${project.extension}" para "${classForm.extension}"`)
        if (JSON.stringify(newTags) !== JSON.stringify(project.tags)) changes.push(`Tags atualizadas`)
        
        if (changes.length > 0) {
            setProject({
                ...project,
                category: classForm.category,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                extension: classForm.extension as any,
                tags: newTags
            })
            addAutoPost("Atualização de Classificação", changes.join('\n'))
        }
        setIsEditingClass(false)
    }

    const handleSaveOverview = () => {
        const changes = []
        if (overviewForm.description !== project.description) changes.push("Descrição do projeto atualizada")
        if (overviewForm.observations !== project.observations) changes.push("Observações atualizadas")

        if (changes.length > 0) {
            setProject({
                ...project,
                description: overviewForm.description,
                observations: overviewForm.observations
            })
            addAutoPost("Atualização de Visão Geral", changes.join('\n'))
        }
        setIsEditingOverview(false)
    }

    const handleSaveBasic = () => {
        const changes = []
        if (basicForm.responsible !== project.responsible) changes.push(`Responsável alterado para "${basicForm.responsible}"`)
        if (basicForm.startDate !== project.startDate) changes.push(`Data de início alterada para ${basicForm.startDate}`)
        if (basicForm.endDate !== project.endDate) changes.push(`Previsão de fim alterada para ${basicForm.endDate}`)
        if (basicForm.lastVisit !== project.lastVisit) changes.push(`Nova visita registrada em ${basicForm.lastVisit}`)
        if (basicForm.indication !== project.indication) changes.push(`Indicação atualizada`)

        if (changes.length > 0) {
            setProject({
                ...project,
                responsible: basicForm.responsible,
                startDate: basicForm.startDate,
                endDate: basicForm.endDate,
                lastVisit: basicForm.lastVisit,
                indication: basicForm.indication
            })
            addAutoPost("Atualização de Dados Básicos", changes.join('\n'))
        }
        setIsEditingBasic(false)
    }

    const handleSaveFinance = () => {
        // Mock save logic for finance - in real app would sync with finance module
        alert("Em produção, isso sincronizaria com o módulo financeiro e geraria logs.")
        setIsEditingFinance(false)
    }

    // Helper formatter
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        
        // Handle YYYY-MM-DD
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-')
            return `${day}/${month}/${year}`
        }

        // Fallback for valid ISO strings or other formats (try to rely on browser locale for now)
        try {
            return new Date(dateString).toLocaleDateString('pt-BR')
        } catch {
            return dateString
        }
    }

    return (
        <div className="min-h-screen bg-transparent space-y-6">
            
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    {/* Previous Navigation Removed */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
                        <FavoriteButton 
                            id={project.id} 
                            type="project" 
                            title={project.title} 
                            subtitle={project.institution}
                            className="h-8 w-8"
                        />
                        <BadgeStatus status={project.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {project.municipality}, {project.state} - {project.country}</span>
                        <span className="flex items-center gap-1.5">
                            <Award className="h-4 w-4" /> 
                            <Link href={`/dashboard/entidades/${slugify(project.institution)}`} className="hover:underline hover:text-primary transition-colors">
                                {project.institution}
                            </Link>
                        </span>
                    </div>
                </div>
                

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Details */}
                <div className="space-y-6 lg:col-span-1">
                    
                    {/* OVERVIEW */}
                    <ProjectInfoCard
                        title="Visão Geral"
                        icon={<LayoutDashboard className="h-4 w-4 text-primary" />}
                        isEditing={isEditingOverview}
                        setIsEditing={setIsEditingOverview}
                        onSave={handleSaveOverview}
                        hasHistory={true}
                        editContent={
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Descrição</label>
                                    <Textarea 
                                        value={overviewForm.description} 
                                        onChange={e => setOverviewForm({...overviewForm, description: e.target.value})} 
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Observações</label>
                                    <Textarea 
                                        value={overviewForm.observations} 
                                        onChange={e => setOverviewForm({...overviewForm, observations: e.target.value})} 
                                        className="min-h-[60px]"
                                    />
                                </div>
                            </div>
                        }
                    >
                         <div className="space-y-4">
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
                         </div>
                    </ProjectInfoCard>

                    {/* BASIC INFO */}
                    <ProjectInfoCard
                        title="Informações Básicas"
                        icon={<FileText className="h-4 w-4 text-primary" />}
                        isEditing={isEditingBasic}
                        setIsEditing={setIsEditingBasic}
                        onSave={handleSaveBasic}
                        hasHistory={true}
                        editContent={
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Responsável</label>
                                    <Input value={basicForm.responsible} onChange={e => setBasicForm({...basicForm, responsible: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1 flex flex-col">
                                        <label className="text-xs font-semibold">Início</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !basicForm.startDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    {basicForm.startDate ? (
                                                        format(new Date(basicForm.startDate + 'T12:00:00'), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Escolha uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={basicForm.startDate ? new Date(basicForm.startDate + 'T12:00:00') : undefined}
                                                    onSelect={(date) => setBasicForm({...basicForm, startDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                                    initialFocus
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1 flex flex-col">
                                        <label className="text-xs font-semibold">Fim</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !basicForm.endDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    {basicForm.endDate ? (
                                                        format(new Date(basicForm.endDate + 'T12:00:00'), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Escolha uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={basicForm.endDate ? new Date(basicForm.endDate + 'T12:00:00') : undefined}
                                                    onSelect={(date) => setBasicForm({...basicForm, endDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                                    initialFocus
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="space-y-1 flex flex-col">
                                    <label className="text-xs font-semibold">Última Visita (Staff)</label>
                                    <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !basicForm.lastVisit && "text-muted-foreground"
                                                    )}
                                                >
                                                    {basicForm.lastVisit ? (
                                                        format(new Date(basicForm.lastVisit + 'T12:00:00'), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Escolha uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={basicForm.lastVisit ? new Date(basicForm.lastVisit + 'T12:00:00') : undefined}
                                                    onSelect={(date) => setBasicForm({...basicForm, lastVisit: date ? format(date, 'yyyy-MM-dd') : ''})}
                                                    initialFocus
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Indicação</label>
                                    <Input value={basicForm.indication || ''} onChange={e => setBasicForm({...basicForm, indication: e.target.value})} />
                                </div>
                            </div>
                        }
                    >
                        <div className="space-y-4 text-sm">
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
                                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{formatDate(project.startDate)}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs font-medium uppercase">Fim Previsto</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{formatDate(project.endDate)}</span>
                                    </div>
                                </div>
                            </div>
                            {project.lastVisit && (
                                <>
                                    <Separator />
                                    <div>
                                         <span className="text-muted-foreground text-xs font-medium uppercase">Última Visita (Staff)</span>
                                          <div className="flex items-center gap-2 mt-1 text-blue-600 dark:text-blue-400">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <span className="font-semibold">{formatDate(project.lastVisit)}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                            {project.indication && (
                                <>
                                    <Separator />
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium uppercase">Indicação</span>
                                        <p className="mt-1 font-medium italic">{project.indication}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {(project.thanked || feed.some(p => p.type === 'acknowledgment' && new Date(p.date).getFullYear() === new Date().getFullYear())) && (
                            <>
                                <Separator className="my-4" />
                                <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Agradecimento enviado em {new Date().getFullYear()}</span>
                                </div>
                            </>
                        )}
                        {!project.thanked && !feed.some(p => p.type === 'acknowledgment' && new Date(p.date).getFullYear() === new Date().getFullYear()) && (
                             <>
                                <Separator className="my-4" />
                                <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Aguardando agradecimento ({new Date().getFullYear()})</span>
                                </div>
                            </>
                        )}
                    </ProjectInfoCard>

                    {/* FINANCIAL (Read Only) */}
                     <ProjectInfoCard
                        title="Financeiro"
                        icon={<DollarSign className="h-4 w-4 text-primary" />}
                        hasHistory={true}
                    >
                         <CardContent className="space-y-5 p-0">
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
                        </CardContent>
                    </ProjectInfoCard>

                    {/* CLASSIFICATION */}
                    <ProjectInfoCard
                        title="Classificação"
                        icon={<Tag className="h-4 w-4 text-primary" />}
                        isEditing={isEditingClass}
                        setIsEditing={setIsEditingClass}
                        onSave={handleSaveClass}
                        hasHistory={true}
                        editContent={
                             <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Categoria</label>
                                    <Input value={classForm.category} onChange={e => setClassForm({...classForm, category: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Extensão</label>
                                    <Input value={classForm.extension} onChange={e => setClassForm({...classForm, extension: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold">Tags (separadas por vírgula)</label>
                                    <Input value={classForm.tags} onChange={e => setClassForm({...classForm, tags: e.target.value})} />
                                </div>
                            </div>
                        }
                    >
                         <div className="space-y-4">
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
                        </div>
                    </ProjectInfoCard>

                    <ProjectGallery feed={feed} />

                </div>

                {/* Right Column - Mural Feed */}
                <div className="space-y-6 lg:col-span-2">
                     {/* We pass the FULL controlled feed here */}
                    <ProjectMural 
                        feed={feed} 
                        onAddPost={(post) => setFeed([post, ...feed])}
                    />
                </div>
            </div>
        </div>
    )
}

// Moved wrapper component OUTSIDE main component to fix lint error
interface ProjectInfoCardProps {
    title: string
    icon: React.ReactNode
    children?: React.ReactNode
    isEditing?: boolean
    setIsEditing?: (v: boolean) => void
    onSave?: () => void
    editContent?: React.ReactNode
    hasHistory?: boolean
}

const ProjectInfoCard = ({ title, icon, children, isEditing, setIsEditing, onSave, editContent }: ProjectInfoCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
                {icon}
                {title}
            </CardTitle>
            {setIsEditing && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
            )}
        </CardHeader>
        <CardContent>
            {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {editContent}
                    <Button className="w-full gap-2" size="sm" onClick={onSave}>
                        <Save className="h-4 w-4" /> Salvar Alterações
                    </Button>
                </div>
            ) : (
                children
            )}
        </CardContent>
    </Card>
)


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

function slugify(text: string) {
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
