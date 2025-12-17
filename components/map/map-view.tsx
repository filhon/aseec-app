"use client"

import { useEffect, useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { RotateCcw, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockProjects, ProjectLocation } from "./data"

// Fix for default Leaflet marker icons
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const createCustomIcon = (color: "blue" | "green") => {
  const bgColor = color === "blue" ? "bg-blue-500" : "bg-green-500"
  
  return L.divIcon({
    className: "custom-pin-icon",
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full ${bgColor} opacity-30 animate-pulse"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 ${bgColor} border-2 border-white shadow-md"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10],
  })
}

const blueIcon = createCustomIcon("blue")
const greenIcon = createCustomIcon("green")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClusterIcon = (cluster: any) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-12 h-12">
        <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 animate-ping"></span>
        <span class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-xl border-2 border-white/20 backdrop-blur-md">
          ${cluster.getChildCount()}
        </span>
      </div>
    `,
    className: "custom-cluster-icon",
    iconSize: [48, 48], // Increased size to accommodate the effect
    iconAnchor: [24, 24],
  })
}

function MapControls({ center, zoom, hidden }: { center: [number, number], zoom: number, hidden?: boolean }) {
  const map = useMap()

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    map.zoomIn()
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    map.zoomOut()
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    map.setView(center, zoom, { animate: true })
  }

  if (hidden) return null

  return (
    <div className="leaflet-bottom leaflet-right mb-24 mr-6 md:mb-6" style={{ pointerEvents: "auto", zIndex: 1000 }}>
        <div className="flex flex-col gap-2">
            <Button
                variant="secondary"
                size="icon"
                onClick={handleReset}
                className="shadow-md h-9 w-9 bg-background/95 backdrop-blur hover:bg-background/100"
                title="Redefinir visualização"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex flex-col rounded-md shadow-md bg-background/95 backdrop-blur overflow-hidden border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    className="h-9 w-9 rounded-none hover:bg-muted border-b"
                    title="Aumentar zoom"
                >
                    <Plus className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    className="h-9 w-9 rounded-none hover:bg-muted"
                    title="Diminuir zoom"
                >
                    <Minus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
  )
}

interface MapControllerProps {
  flyTo?: { lat: number; lng: number; zoom: number } | null
}

function MapController({ flyTo }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }, [flyTo, map])

  return null
}

interface MapViewProps {
  onPinClick: (project: ProjectLocation) => void
  onClusterClick: (projects: ProjectLocation[]) => void
  className?: string
  style?: React.CSSProperties
  flyTo?: { lat: number; lng: number; zoom: number } | null
  hideControls?: boolean
}

export default function MapView({ onPinClick, onClusterClick, className, style, flyTo, hideControls }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  // Move hook to top level
  // Stable style reference to prevent re-renders
  const mapStyle = useMemo(() => ({ height: "100%", width: "100%", outline: "none", ...style }), [style])
  
  // Unique key to force remount on initial load only once
  const [mapKey] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true)
  }, [])

  if (!mounted) return null

  const center = [-14.2350, -51.9253] as [number, number]
  const zoom = 4

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className={className}>
      <MapContainer 
        key={mapKey}
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        zoomControl={false}
        style={mapStyle}
        className="z-0"
      >
        <MapController flyTo={flyTo} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapControls center={center} zoom={zoom} hidden={hideControls} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          zoomToBoundsOnClick={false}
          eventHandlers={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clusterclick: (e: any) => {
               const cluster = e.layer
               const markers = cluster.getAllChildMarkers()
               const clusterProjects: ProjectLocation[] = []
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               markers.forEach((marker: any) => {
                  const { lat, lng } = marker.getLatLng()
                  const found = mockProjects.find(p => Math.abs(p.lat - lat) < 0.0001 && Math.abs(p.lng - lng) < 0.0001)
                  if (found) clusterProjects.push(found)
               })
               
               if (clusterProjects.length > 0) {
                 onClusterClick(clusterProjects)
               }
            }
          }}
        >
          {mockProjects.map((project) => (
            <Marker 
              key={project.id}
              position={[project.lat, project.lng]} 
              icon={project.type === "blue" ? blueIcon : greenIcon} 
              eventHandlers={{ click: () => onPinClick(project) }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
