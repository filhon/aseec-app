
import { Button } from "@/components/ui/button"
import { Filter, Heart, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
// Define types for the project items from useFavorites
// We need to know the shape of the project object. 
// Based on usage in feed page: { id: string, title: string, type: 'project' | ... }
// We can infer it or import it. Since useFavorites exports FavoriteItem, let's try to import it if exported, otherwise define a compatible interface.
// The file app/projetos/feed/page.tsx imports FavoriteItem from "@/hooks/use-favorites".

import { FavoriteItem } from "@/hooks/use-favorites"

interface SidebarContentProps {
  viewMode: 'all' | 'favorites';
  setViewMode: (mode: 'all' | 'favorites') => void;
  activeFilterId: string | null;
  setActiveFilterId: (id: string | null) => void;
  favProjects: FavoriteItem[];
}

export const SidebarContent = ({ 
  viewMode, 
  setViewMode, 
  activeFilterId, 
  setActiveFilterId, 
  favProjects 
}: SidebarContentProps) => {
  return (
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
                  
                  {favProjects.length === 0 && (
                      <div className="text-sm text-muted-foreground italic px-2">
                          Você ainda não tem projetos favoritos.
                      </div>
                  )}
              </div>
          )}
      </div>
  );
};
