import { Globe, Star, FolderOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FavoriteItem } from "@/hooks/use-favorites";

interface SidebarContentProps {
  viewMode: "all" | "favorites";
  setViewMode: (mode: "all" | "favorites") => void;
  activeFilterId: string | null;
  setActiveFilterId: (id: string | null) => void;
  favProjects: FavoriteItem[];
}

export const SidebarContent = ({
  viewMode,
  setViewMode,
  activeFilterId,
  setActiveFilterId,
  favProjects,
}: SidebarContentProps) => {
  return (
    <div className="space-y-5">
      {/* View mode */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Visualização
        </p>

        <div className="space-y-0.5">
          <button
            onClick={() => {
              setViewMode("all");
              setActiveFilterId(null);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              viewMode === "all"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>Todos os projetos</span>
            {viewMode === "all" && (
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />
            )}
          </button>

          <button
            onClick={() => setViewMode("favorites")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              viewMode === "favorites"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Star
              className={cn(
                "w-4 h-4 shrink-0",
                viewMode === "favorites" && "fill-background",
              )}
            />
            <span>Favoritos</span>
            {favProjects.length > 0 && (
              <span
                className={cn(
                  "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                  viewMode === "favorites"
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {favProjects.length}
              </span>
            )}
            {viewMode === "favorites" && (
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            )}
          </button>
        </div>
      </div>

      {/* Favorites project list */}
      {viewMode === "favorites" && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
            <FolderOpen className="w-3 h-3" />
            Projetos
          </p>

          {favProjects.length > 0 ? (
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveFilterId(null)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  activeFilterId === null
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                <span className="w-5 h-5 rounded-md bg-muted/80 flex items-center justify-center text-[10px] shrink-0">
                  ★
                </span>
                <span className="truncate">Todos os Favoritos</span>
                {activeFilterId === null && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>

              {favProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setActiveFilterId(project.id)}
                  title={project.title}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    activeFilterId === project.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[9px] font-bold shrink-0 uppercase">
                    {project.title.charAt(0)}
                  </span>
                  <span className="truncate flex-1 text-left">
                    {project.title}
                  </span>
                  {activeFilterId === project.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center gap-3 text-center px-2">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Star className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você ainda não tem projetos favoritos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
