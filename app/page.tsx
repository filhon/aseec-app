"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { SearchBar } from "@/components/map/search-bar"
import { Sidebar } from "@/components/map/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <p className="text-muted-foreground animate-pulse">Carregando mapa...</p>
    </div>
  ),
})

import { ProjectLocation, mockProjects } from "@/components/map/data"
import { searchLocation, AseecData } from "@/lib/search-service"
import { calculateDistance, formatDistance } from "@/lib/geo-utils"
import { Button } from "@/components/ui/button"
import { Sparkles, Navigation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<(ProjectLocation & { distance?: string })[]>([])
  const [sidebarTitle, setSidebarTitle] = useState("")
  const [sidebarMode, setSidebarMode] = useState<"nav" | "details">("details")
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null)
  const [aseecData, setAseecData] = useState<AseecData | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const handlePinClick = (project: ProjectLocation) => {
    setSelectedItems([project])
    setSidebarTitle(project.title)
    setSidebarMode("details")
    setAseecData(null)
    setSidebarOpen(true)
    setFlyTo({ lat: project.lat, lng: project.lng, zoom: 12 })
  }

  const handleClusterClick = (projects: ProjectLocation[]) => {
    setSelectedItems(projects)
    setSidebarTitle(`${projects.length} Projetos na Região`)
    setSidebarMode("details")
    setAseecData(null)
    setSidebarOpen(true)
  }

  const handleMenuClick = () => {
    setSidebarTitle("") // No title for menu
    setSidebarMode("nav")
    setSidebarOpen(true)
  }

  const handleSearch = async (query: string) => {
    const result = await searchLocation(query)
    if (result) {
      setFlyTo({ lat: result.lat, lng: result.lng, zoom: 10 })
      
      // Calculate distances
      const projectsWithDist = mockProjects.map(p => {
        const distKm = calculateDistance(result.lat, result.lng, p.lat, p.lng)
        return { ...p, distance: formatDistance(distKm), distValue: distKm }
      })
      .sort((a, b) => a.distValue - b.distValue)
      .slice(0, 5) // Show top 5 closest

      setSelectedItems(projectsWithDist)
      setAseecData(result.aseecData || null)
      setSidebarTitle(result.title)
      setSidebarMode("details")
      setSidebarOpen(true)
    }
  }

  const handleNearMe = () => {
      if (!navigator.geolocation) {
          toast.error("Geolocalização não suportada pelo seu navegador.")
          return;
      }

      setIsLocating(true)
      toast.info("Obtendo sua localização...")

      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords
              
              setFlyTo({ lat: latitude, lng: longitude, zoom: 11 })
              
              // Filter projects within 50km
              const projectsNearby = mockProjects.map(p => {
                  const distKm = calculateDistance(latitude, longitude, p.lat, p.lng)
                  return { ...p, distance: formatDistance(distKm), distValue: distKm }
              })
              .filter(p => p.distValue <= 50)
              .sort((a, b) => a.distValue - b.distValue)

              if (projectsNearby.length === 0) {
                  toast.warning("Nenhum projeto encontrado num raio de 50km.")
                  setSidebarOpen(false)
              } else {
                  setSelectedItems(projectsNearby)
                  setSidebarTitle("Projetos Próximos a Mim")
                  setSidebarMode("details")
                  setAseecData(null)
                  setSidebarOpen(true)
                  toast.success(`${projectsNearby.length} projetos encontrados próximos a você.`)
              }
              setIsLocating(false)
          },
          (error) => {
              console.error("Error getting location", error)
              toast.error("Erro ao obter localização. Verifique as permissões.")
              setIsLocating(false)
          }
      )
  }

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        title={sidebarMode === "nav" ? "" : sidebarTitle}
        className={sidebarMode === "nav" ? "p-0" : undefined}
        content={
            sidebarMode === "nav" ? (
                <AppSidebar mode="mobile" onNavigate={() => setSidebarOpen(false)} />
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
                                    <p className="text-xs text-muted-foreground">Religião Pred.</p>
                                    <p className="font-medium">{aseecData.religion}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Evangélicos</p>
                                    <p className="font-medium">{aseecData.evangelicals}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground">Não Alcançados</p>
                                    <p className="font-medium text-red-500">{aseecData.unreached}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {aseecData && <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Projetos Próximos</h4>}
                        {selectedItems.map(project => (
                            <div key={project.id} className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
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
                                        <p><span className="font-medium text-foreground">Responsável:</span> {project.responsible}</p>
                                        <p><span className="font-medium text-foreground">Endereço:</span> {project.address}</p>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button className="flex-1" variant="outline" size="sm" asChild>
                                            <Link href={`/projetos/${project.id}`}>
                                                Ver Detalhes
                                            </Link>
                                        </Button>
                                        <Button className="flex-none w-10 px-0" variant="secondary" size="sm" title="Navegar" asChild>
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
        onNearMeClick={!isLocating ? handleNearMe : undefined}
        isHidden={isFullscreen} 
      />

      <MapView 
        onPinClick={handlePinClick} 
        onClusterClick={handleClusterClick} 
        flyTo={flyTo}
        hideControls={isFullscreen}
      />
    </main>
  )
}
