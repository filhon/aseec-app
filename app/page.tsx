"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SearchBar } from "@/components/map/search-bar";
import { Sidebar } from "@/components/map/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  getProjectsForMap,
  type ProjectLocation,
} from "@/lib/services/project-service";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <div className="w-full h-full animate-pulse bg-muted-foreground/10" />
    </div>
  ),
});

import {
  searchLocation,
  getLocationInsights,
  type SearchSuggestion,
  type AseecLocationData,
} from "@/lib/search-service";
import { calculateDistance, formatDistance } from "@/lib/geo-utils";
import { Button } from "@/components/ui/button";
import { Navigation, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { MobileNavbar } from "@/components/layout/mobile-navbar";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    (ProjectLocation & { distance?: string })[]
  >([]);
  const [sidebarTitle, setSidebarTitle] = useState("");
  const [sidebarMode, setSidebarMode] = useState<"nav" | "details">("details");
  const [flyTo, setFlyTo] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
  const [aseecData, setAseecData] = useState<AseecLocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Real data from Supabase
  const [projects, setProjects] = useState<ProjectLocation[]>([]);
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjectsForMap();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchProjects();
  }, []);

  const handlePinClick = (project: ProjectLocation) => {
    setSelectedItems([project]);
    setSidebarTitle(project.title);
    setSidebarMode("details");
    setAseecData(null);
    setSidebarOpen(true);
    setFlyTo({ lat: project.lat, lng: project.lng, zoom: 12 });
  };

  const handleClusterClick = (clusterProjects: ProjectLocation[]) => {
    setSelectedItems(clusterProjects);
    setSidebarTitle(`${clusterProjects.length} Projetos na Região`);
    setSidebarMode("details");
    setAseecData(null);
    setSidebarOpen(true);
  };

  const handleMenuClick = () => {
    setSidebarTitle(""); // No title for menu
    setSidebarMode("nav");
    setSidebarOpen(true);
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setAseecData(null);
    try {
      const result = await searchLocation(query);
      if (!result) {
        toast.error("Nenhum resultado encontrado para essa busca.");
        return;
      }
      setAseecData(result.aseecData ?? null);
      flyToAndShowNearby(result.lat, result.lng, result.title, 10);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "project" && suggestion.id) {
      setAseecData(null);
      const project = projects.find((p) => p.id === suggestion.id);
      if (project) {
        setSelectedItems([project]);
        setSidebarTitle(project.title);
        setSidebarMode("details");
        setSidebarOpen(true);
      }
      setFlyTo({ lat: suggestion.lat, lng: suggestion.lng, zoom: 14 });
    } else {
      // Clear first, fly and show projects immediately, then load insights async
      setAseecData(null);
      flyToAndShowNearby(suggestion.lat, suggestion.lng, suggestion.title, 10);
      getLocationInsights(suggestion.title).then((data) => setAseecData(data));
    }
  };

  const flyToAndShowNearby = (
    lat: number,
    lng: number,
    title: string,
    zoom: number,
  ) => {
    setFlyTo({ lat, lng, zoom });

    const projectsWithDist = projects
      .map((p) => {
        const distKm = calculateDistance(lat, lng, p.lat, p.lng);
        return { ...p, distance: formatDistance(distKm), distValue: distKm };
      })
      .sort((a, b) => a.distValue - b.distValue)
      .slice(0, 5);

    setSelectedItems(projectsWithDist);
    setSidebarTitle(title);
    setSidebarMode("details");
    setSidebarOpen(true);
  };

  const handleNearMe = (radius: number = 50) => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo seu navegador.");
      return;
    }

    setIsLocating(true);
    toast.info("Obtendo sua localização...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFlyTo({ lat: latitude, lng: longitude, zoom: 11 });

        const projectsNearby = projects
          .map((p) => {
            const distKm = calculateDistance(latitude, longitude, p.lat, p.lng);
            return {
              ...p,
              distance: formatDistance(distKm),
              distValue: distKm,
            };
          })
          .filter((p) => p.distValue <= radius)
          .sort((a, b) => a.distValue - b.distValue);

        if (projectsNearby.length === 0) {
          toast.warning(`Nenhum projeto encontrado num raio de ${radius}km.`);
          setSidebarOpen(false);
        } else {
          setSelectedItems(projectsNearby);
          setSidebarTitle(`Projetos Próximos a Mim (${radius}km)`);
          setSidebarMode("details");
          setSidebarOpen(true);
          toast.success(
            `${projectsNearby.length} projeto${projectsNearby.length > 1 ? "s" : ""} encontrado${projectsNearby.length > 1 ? "s" : ""} num raio de ${radius}km.`,
          );
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location", error);
        toast.error("Erro ao obter localização. Verifique as permissões.");
        setIsLocating(false);
      },
    );
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={sidebarMode === "nav" ? "" : sidebarTitle}
        className={sidebarMode === "nav" ? "p-0" : undefined}
        content={
          sidebarMode === "nav" ? (
            <AppSidebar
              mode="mobile"
              onNavigate={() => setSidebarOpen(false)}
            />
          ) : selectedItems.length > 0 ? (
            <div className="space-y-6">
              {aseecData && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Dados aseecIA</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Capital</p>
                      <p className="font-medium">{aseecData.capital}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">População</p>
                      <p className="font-medium">{aseecData.population}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Religião Pred.
                      </p>
                      <p className="font-medium">{aseecData.religion}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Evangélicos
                      </p>
                      <p className="font-medium">{aseecData.evangelicals}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Não Alcançados
                      </p>
                      <p className="font-medium text-red-500">
                        {aseecData.unreached}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {aseecData && (
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Projetos Próximos
                  </h4>
                )}
                {selectedItems.map((project) => (
                  <div
                    key={project.id}
                    className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
                  >
                    {project.latestImage && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={project.latestImage}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                        <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                          {project.distance ? project.distance : "Local"}
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      {!project.latestImage && project.distance && (
                        <div className="mb-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold max-w-fit">
                          {project.distance} de distância
                        </div>
                      )}
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p>
                          <span className="font-medium text-foreground">
                            Responsável:
                          </span>{" "}
                          {project.responsible}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Endereço:
                          </span>{" "}
                          {project.address}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/projetos/${project.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                        <Button
                          className="flex-none w-10 px-0"
                          variant="secondary"
                          size="sm"
                          title="Navegar"
                          asChild
                        >
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${project.lat},${project.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Navigation className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : undefined
        }
      />

      <SearchBar
        onMenuClick={handleMenuClick}
        onSearch={handleSearch}
        onSuggestionSelect={handleSuggestionSelect}
        onNearMeClick={handleNearMe}
        isLocating={isLocating}
        isSearching={isSearching}
        isHidden={isFullscreen}
      />

      <MapView
        projects={projects}
        onPinClick={handlePinClick}
        onClusterClick={handleClusterClick}
        flyTo={flyTo}
        hideControls={isFullscreen}
      />
      <MobileNavbar />
    </main>
  );
}
