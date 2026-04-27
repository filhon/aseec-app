"use client";

import { GlobalProjectUpdates } from "@/components/dashboard/global-project-updates";
import { Heart, X, Globe, Star } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

import { SidebarContent } from "./sidebar-content";

export default function FeedPage() {
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  const { getItemsByType } = useFavorites();
  const favProjects = getItemsByType("project");

  const getFilterIds = () => {
    if (viewMode === "all") return undefined;
    if (activeFilterId) return [activeFilterId];
    return favProjects.map((p) => p.id);
  };

  const activeProject = activeFilterId
    ? favProjects.find((p) => p.id === activeFilterId)
    : null;

  return (
    <div className="flex flex-col md:flex-row">
      {/* Desktop Sidebar — sticky, scrolls independently */}
      <div className="hidden md:flex flex-col w-72 border-r bg-muted/5 sticky top-0 self-start h-[calc(100vh-4rem)] shrink-0">
        <div className="px-5 pt-6 pb-4 border-b">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            Feed
          </p>
          <h2 className="font-heading text-lg font-bold text-foreground leading-tight">
            Atualizações
          </h2>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          <SidebarContent
            viewMode={viewMode}
            setViewMode={setViewMode}
            activeFilterId={activeFilterId}
            setActiveFilterId={setActiveFilterId}
            favProjects={favProjects}
          />
        </div>
      </div>

      {/* Main Content — page scrolls naturally */}
      <div className="flex-1 min-w-0">
        {/* Page Header — sticky */}
        <div className="sticky top-0 z-10 px-6 pt-7 pb-5 border-b bg-background">
          <div className="max-w-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  {viewMode === "favorites" ? (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {viewMode === "all"
                      ? "Todos os Projetos"
                      : "Seus Favoritos"}
                  </span>
                </div>

                <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {activeProject ? activeProject.title : "Feed de Notícias"}
                </h1>

                <p className="text-sm text-muted-foreground">
                  {viewMode === "all"
                    ? "Acompanhe todas as atualizações em tempo real."
                    : activeProject
                      ? `Exibindo atualizações de ${activeProject.title}`
                      : "Atualizações dos seus projetos favoritos."}
                </p>
              </div>

              {/* Mobile: labeled pill toggle */}
              <button
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors hover:bg-muted/50 shrink-0"
                onClick={() => {
                  setViewMode(viewMode === "all" ? "favorites" : "all");
                  setActiveFilterId(null);
                }}
              >
                <Heart
                  className={cn(
                    "w-4 h-4",
                    viewMode === "favorites"
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    viewMode === "favorites"
                      ? "text-red-500"
                      : "text-muted-foreground",
                  )}
                >
                  {viewMode === "favorites" ? "Favoritos" : "Todos"}
                </span>
              </button>
            </div>

            {/* Active project filter chip */}
            {activeFilterId && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">
                  Filtrando:
                </span>
                <button
                  onClick={() => setActiveFilterId(null)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-foreground text-background rounded-full hover:bg-foreground/80 transition-colors"
                >
                  {activeProject?.title}
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feed */}
        <GlobalProjectUpdates
          key={`${viewMode}-${activeFilterId}`}
          onlyToday={false}
          variant="feed"
          filterIds={getFilterIds()}
        />
      </div>
    </div>
  );
}
