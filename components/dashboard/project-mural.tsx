"use client"

import { useState } from "react"
import { ProjectPost, PostType } from "./data"
import { FeedPost } from "./feed-post"
import { AddPostForm } from "./add-post-form"
import { LayoutDashboard, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface ProjectMuralProps {
    feed?: ProjectPost[]
    onAddPost?: (post: ProjectPost) => void
    /** Whether the user can add new posts (default: false) */
    canEdit?: boolean
}

export function ProjectMural({ feed = [], onAddPost, canEdit = false }: ProjectMuralProps) {
    const [filterType, setFilterType] = useState<PostType | 'all'>('all')

    const handleNewPost = (post: ProjectPost) => {
        if (onAddPost) {
            onAddPost(post)
        }
    }

    const filteredFeed = filterType === 'all' 
        ? feed 
        : feed.filter(post => post.type === filterType)

    const counts = {
        all: feed.length,
        history: feed.filter(p => p.type === 'history').length,
        testimonial: feed.filter(p => p.type === 'testimonial').length,
        acknowledgment: feed.filter(p => p.type === 'acknowledgment').length,
        report: feed.filter(p => p.type === 'report').length,
        update: feed.filter(p => p.type === 'update').length,
        general: feed.filter(p => p.type === 'general').length,
    }

    const labels: Record<string, string> = {
        all: "Todos",
        history: "Histórico",
        testimonial: "Depoimentos",
        acknowledgment: "Agradecimentos",
        report: "Relatórios",
        update: "Atualizações",
        general: "Geral"
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Mural do Projeto
                </h2>
                
                <div className="flex items-center gap-2">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2" suppressHydrationWarning>
                                <Filter className="h-3.5 w-3.5" />

                                <span className="font-semibold">{labels[filterType]}</span>
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem]">{counts[filterType as keyof typeof counts] || 0}</Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuRadioGroup value={filterType} onValueChange={(v) => setFilterType(v as PostType | 'all')}>
                                <DropdownMenuRadioItem value="all" className="justify-between">
                                    Todos <span className="text-muted-foreground text-xs">{counts.all}</span>
                                </DropdownMenuRadioItem>
                                {counts.history > 0 && (
                                    <DropdownMenuRadioItem value="history" className="justify-between">
                                        Histórico <span className="text-muted-foreground text-xs">{counts.history}</span>
                                    </DropdownMenuRadioItem>
                                )}
                                {counts.testimonial > 0 && (
                                    <DropdownMenuRadioItem value="testimonial" className="justify-between">
                                        Depoimentos <span className="text-muted-foreground text-xs">{counts.testimonial}</span>
                                    </DropdownMenuRadioItem>
                                )}
                                {counts.acknowledgment > 0 && (
                                    <DropdownMenuRadioItem value="acknowledgment" className="justify-between">
                                        Agradecimentos <span className="text-muted-foreground text-xs">{counts.acknowledgment}</span>
                                    </DropdownMenuRadioItem>
                                )}
                                {counts.report > 0 && (
                                    <DropdownMenuRadioItem value="report" className="justify-between">
                                        Relatórios <span className="text-muted-foreground text-xs">{counts.report}</span>
                                    </DropdownMenuRadioItem>
                                )}
                                {counts.update > 0 && (
                                    <DropdownMenuRadioItem value="update" className="justify-between">
                                        Atualizações <span className="text-muted-foreground text-xs">{counts.update}</span>
                                    </DropdownMenuRadioItem>
                                )}
                                {counts.general > 0 && (
                                    <DropdownMenuRadioItem value="general" className="justify-between">
                                        Geral <span className="text-muted-foreground text-xs">{counts.general}</span>
                                    </DropdownMenuRadioItem>
                                )}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {canEdit && <AddPostForm onPost={handleNewPost} />}

            <div className="mt-4">
                {filteredFeed.length > 0 ? (
                    <div className="space-y-4">
                        {filteredFeed.map(post => (
                            <FeedPost key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                        <p>Nenhuma publicação encontrada para este filtro.</p>
                        <Button variant="link" onClick={() => setFilterType('all')} className="mt-2">
                            Limpar filtros
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
