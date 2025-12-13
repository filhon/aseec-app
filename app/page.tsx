"use client"

import { useState } from "react"
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

import { ProjectLocation } from "@/components/map/data"

// ... imports

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<ProjectLocation[]>([])
  const [sidebarTitle, setSidebarTitle] = useState("Detalhes")
  const [sidebarMode, setSidebarMode] = useState<"nav" | "details">("details")

  const handlePinClick = (project: ProjectLocation) => {
    setSelectedItems([project])
    setSidebarTitle(project.title)
    setSidebarMode("details")
    setSidebarOpen(true)
  }

  const handleClusterClick = (projects: ProjectLocation[]) => {
    setSelectedItems(projects)
    setSidebarTitle(`${projects.length} Projetos`)
    setSidebarMode("details")
    setSidebarOpen(true)
  }

  const handleMenuClick = () => {
    setSidebarTitle("Menu")
    setSidebarMode("nav")
    setSidebarOpen(true)
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        title={sidebarTitle}
        className={sidebarMode === "nav" ? "p-0" : undefined}
        content={
            sidebarMode === "nav" ? (
                <AppSidebar mode="mobile" onNavigate={() => setSidebarOpen(false)} />
            ) : selectedItems.length > 0 ? (
                <div className="space-y-4">
                    {selectedItems.map(project => (
                        <div key={project.id} className="p-4 border rounded-lg bg-muted/20">
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <div className="text-sm text-muted-foreground mt-1">
                                <p><strong>Responsável:</strong> {project.responsible}</p>
                                <p><strong>Endereço:</strong> {project.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : undefined
        }
      />
      
      <SearchBar onMenuClick={handleMenuClick} />

      <MapView onPinClick={handlePinClick} onClusterClick={handleClusterClick} />
    </main>
  )
}
