"use client"

import { GlobalProjectUpdates } from "@/components/dashboard/global-project-updates"
import { Button } from "@/components/ui/button"
import { Heart, X } from "lucide-react"
import { useState } from "react"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

import { SidebarContent } from "./sidebar-content"

export default function FeedPage() {
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  
  const { getItemsByType } = useFavorites();
  
  // Get favorited items for the sidebar
  const favProjects = getItemsByType('project');

  
  // Logic to determine which Project IDs to show
  // If viewMode is 'all', show all (pass undefined to GlobalProjectUpdates)
  // If viewMode is 'favorites':
  //    If activeFilterId is set, show ONLY that project
  //    If no activeFilterId, show ALL favorited projects
  
  const getFilterIds = () => {
    if (viewMode === 'all') return undefined;

    if (activeFilterId) {
        return [activeFilterId];
    }
    
    // Default favorites view: Show posts from ALL favorited projects
    return favProjects.map(p => p.id);
  };



  return (
    // Removed fixed height/overflow-hidden for mobile to allow natural scroll. Re-enabled for desktop to keep sidebar layout.
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] md:overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 border-r bg-muted/10 p-4 overflow-y-auto">
             <SidebarContent 
                viewMode={viewMode}
                setViewMode={setViewMode}
                activeFilterId={activeFilterId}
                setActiveFilterId={setActiveFilterId}
                favProjects={favProjects}
             />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 container mx-auto py-6 lg:py-10">
            <div className="flex-none pb-4">
                <div className="flex items-center justify-between gap-2 mb-4">

                    <div>
                         <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                            Feed de Notícias
                         </h1>
                         <p className="text-muted-foreground hidden md:block">
                             {viewMode === 'all' 
                                ? "Acompanhe todas as atualizações de todos os projetos em tempo real." 
                                : "Atualizações dos seus projetos favoritos."}
                         </p>
                    </div>

                    {/* Mobile Favorite Toggle */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden"
                        onClick={() => setViewMode(viewMode === 'all' ? 'favorites' : 'all')}
                    >
                        <Heart className={cn("w-6 h-6 text-muted-foreground", viewMode === 'favorites' && "fill-red-500 text-red-500")} />
                    </Button>
                </div>
                
                {activeFilterId && (
                   <div className="flex items-center gap-2 mb-2">
                       <Badge variant="secondary" className="gap-1 pl-2">
                           {favProjects.find(p => p.id === activeFilterId)?.title}
                           <span 
                               className="ml-1 hover:bg-muted p-0.5 rounded cursor-pointer"
                               onClick={() => setActiveFilterId(null)}
                           >
                               <X className="w-3 h-3" />
                           </span>
                       </Badge>
                   </div>
                )}
            </div>

            <div className="flex-1 min-h-0 pb-6">
                 {/* 
                    Key is important to force re-render when filters change 
                    so the component resets its scroll or internal state if needed 
                 */}
                 <GlobalProjectUpdates 
                    key={`${viewMode}-${activeFilterId}`}
                    onlyToday={false} 
                    variant="feed" 
                    filterIds={getFilterIds()}
                 />
            </div>
        </div>
    </div>
  )
}
