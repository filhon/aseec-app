"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { mockDashboardProjects, ProjectPost } from "@/components/dashboard/data"
import { FeedPost } from "@/components/dashboard/feed-post"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface GlobalProjectUpdatesProps {
  onlyToday?: boolean
  showViewAll?: boolean
  variant?: 'compact' | 'feed'
  filterIds?: string[]
}

// Helper to check if a date string is today
const isToday = (dateString: string) => {
  const today = new Date()
  const date = new Date(dateString)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Helper to format date relative or absolute
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Agora mesmo'
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 172800) return 'Ontem'
    
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

// Extended post type to include project info for context
interface EnrichedPost extends ProjectPost {
  projectTitle: string;
  projectId: string;
}

export function GlobalProjectUpdates({ onlyToday = false, showViewAll = false, variant = 'compact', filterIds }: GlobalProjectUpdatesProps) {
  // Aggregate all posts from all projects
  const allPosts = useMemo(() => {
    const posts: EnrichedPost[] = []
    mockDashboardProjects.forEach(project => {
        if (project.feed) {
            project.feed.forEach(post => {
                posts.push({
                    ...post,
                    projectTitle: project.title,
                    projectId: project.id
                })
            })
        }
    })
    // Sort by date desc
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const displayedPosts = useMemo(() => {
      let posts = allPosts;

      if (filterIds) {
          posts = posts.filter(p => filterIds.includes(p.projectId));
      }

      if (onlyToday) {
          posts = posts.filter(p => isToday(p.date))
      }
      return posts
  }, [allPosts, onlyToday, filterIds])

  if (variant === 'feed') {
      return (
        <div className="h-full flex flex-col">
            <div className="flex-1 p-0 flex flex-col min-h-0 bg-transparent">
                <ScrollArea className="flex-1">
                    <div className="space-y-4">
                        {displayedPosts.length > 0 ? displayedPosts.map((item) => (
                            <FeedPost 
                                key={`${item.projectId}-${item.id}`} 
                                post={item}
                                projectTitle={item.projectTitle}
                            />
                        )) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <p>Nenhuma atualização encontrada {onlyToday ? "para hoje" : ""}.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
      )
  }

  // Compact variant (Widget style)
  return (
    <Card className="h-full shadow-sm flex flex-col border-0 ring-1 ring-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
         <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Últimas Atualizações</CardTitle>
            <CardDescription className="text-xs">
                {onlyToday 
                    ? "Posts realizados hoje em todos os projetos." 
                    : "Acompanhe o feed completo de todos os projetos."
                }
            </CardDescription>
         </div>
         {onlyToday && (
             <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0.5 h-auto">Hoje</Badge>
         )}
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
                {displayedPosts.length > 0 ? displayedPosts.map((item) => (
                    <div key={`${item.projectId}-${item.id}`} className="flex gap-3 relative pb-6 last:pb-0">
                        {/* Timeline line */}
                        <div className="absolute left-[14px] top-8 bottom-0 w-px bg-border last:hidden" />
                        
                        <Avatar className="h-8 w-8 z-10 border-2 border-background">
                            <AvatarImage src={item.avatar} />
                            <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold leading-none">
                                    {item.author}
                                    <span className="text-muted-foreground font-normal text-xs ml-2">em {item.projectTitle}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(item.date)}
                                </span>
                            </div>
                            {item.title && <p className="text-xs font-medium text-foreground">{item.title}</p>}
                            <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                                {item.content}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        <p>Nenhuma atualização encontrada {onlyToday ? "para hoje" : ""}.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
        
        {showViewAll && (
            <div className="p-4 mt-auto">
                <Link href="/projetos/feed" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-8 gap-2">
                        Ver todos <ExternalLink className="w-3 h-3" />
                    </Button>
                </Link>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
