"use client"

import { GlobalProjectUpdates } from "@/components/dashboard/global-project-updates"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Filter, Heart, FolderOpen, Globe, Building2, MapPin, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useFavorites, FavoriteItem } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function FeedPage() {
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  
  const { items, getItemsByType } = useFavorites();
  
  // Get favorited items for the sidebar
  const favProjects = getItemsByType('project');
  const favCountries = getItemsByType('country'); // Could map country ID to projects if needed, but for now filtering by Project ID is safest for the feed logic
  
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

  const SidebarContent = () => (
      <div className="space-y-6">
          <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Visualização</h3>
              <div className="flex flex-col gap-1">
                  <Button 
                      variant={viewMode === 'all' ? "secondary" : "ghost"} 
                      className="justify-start gap-2"
                      onClick={() => { setViewMode('all'); setActiveFilterId(null); }}
                  >
                      <Filter className="w-4 h-4" /> Todos
                  </Button>
                  <Button 
                      variant={viewMode === 'favorites' ? "secondary" : "ghost"} 
                      className="justify-start gap-2"
                      onClick={() => setViewMode('favorites')}
                  >
                      <Heart className={cn("w-4 h-4", viewMode === 'favorites' && "fill-current")} /> Favoritos
                  </Button>
              </div>
          </div>

          {viewMode === 'favorites' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  {favProjects.length > 0 && (
                      <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <FolderOpen className="w-4 h-4" /> Projetos
                          </h3>
                          <div className="flex flex-col gap-1 pl-2 border-l">
                              <Button 
                                  variant={activeFilterId === null ? "secondary" : "ghost"}
                                  size="sm"
                                  className="justify-start h-8 text-xs w-full"
                                  onClick={() => setActiveFilterId(null)}
                              >
                                  Todos os Favoritos
                              </Button>
                              {favProjects.map(project => (
                                  <Button 
                                      key={project.id}
                                      variant={activeFilterId === project.id ? "secondary" : "ghost"}
                                      size="sm"
                                      className="justify-start h-8 text-xs w-full truncate"
                                      onClick={() => setActiveFilterId(project.id)}
                                      title={project.title}
                                  >
                                      {project.title}
                                  </Button>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* NOTE: Currently GlobalProjectUpdates relies on ProjectID. 
                      Filtering by Country/Entity would require mapping those IDs to Project IDs.
                      For this task, we focus on Project grouping as requested directly for the Feed. 
                      If we want to filter by Country, we'd need to know which projects belong to that country.
                  */}
                  
                  {favProjects.length === 0 && (
                      <div className="text-sm text-muted-foreground italic px-2">
                          Você ainda não tem projetos favoritos.
                      </div>
                  )}
              </div>
          )}
      </div>
  );

  return (
    // Removed fixed height/overflow-hidden for mobile to allow natural scroll. Re-enabled for desktop to keep sidebar layout.
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] md:overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 border-r bg-muted/10 p-4 overflow-y-auto">
             <SidebarContent />
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
