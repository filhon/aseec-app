"use client"

import { GlobalProjectUpdates } from "@/components/dashboard/global-project-updates"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function FeedPage() {
  return (
    <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Link href="/projetos">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                     <h1 className="text-3xl font-bold tracking-tight text-primary">Feed de Notícias</h1>
                     <p className="text-muted-foreground mt-1">Acompanhe todas as atualizações de todos os projetos em tempo real.</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
            <div className="h-[calc(100vh-200px)] min-h-[500px]">
                {/* Reusing the component but showing all posts */}
                <GlobalProjectUpdates onlyToday={false} variant="feed" />
            </div>
        </div>
    </div>
  )
}
