"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { SearchBar } from "@/components/map/search-bar"
import { Sidebar } from "@/components/map/sidebar"

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <p className="text-muted-foreground animate-pulse">Carregando mapa...</p>
    </div>
  ),
})

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const handlePinClick = (title: string) => {
    setSelectedLocation(title)
    setSidebarOpen(true)
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        title={selectedLocation || "Detalhes"}
        content={
            selectedLocation ? (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Informações sobre: <strong>{selectedLocation}</strong>
                    </p>
                    <div className="h-32 rounded-lg bg-muted/50 w-full" />
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-muted/50" />
                        <div className="h-4 w-3/4 rounded bg-muted/50" />
                    </div>
                </div>
            ) : undefined
        }
      />
      
      <SearchBar onMenuClick={() => setSidebarOpen(true)} />

      <MapView onPinClick={handlePinClick} />
    </main>
  )
}
