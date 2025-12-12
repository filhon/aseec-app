"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { RotateCcw } from "lucide-react"
import { mockProjects, ProjectLocation } from "./data"

// Fix for default Leaflet marker icons
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"

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

function ResetZoomControl({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  const handleReset = () => {
    map.setView(center, zoom, { animate: true })
  }
  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "90px", pointerEvents: "auto" }}>
      <div className="leaflet-control leaflet-bar">
        <a 
          role="button" 
          title="Redefinir Zoom" 
          onClick={handleReset} 
          className="flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer text-black" 
          style={{ width: '30px', height: '30px', display: 'flex' }}
        >
           <RotateCcw className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

interface MapViewProps {
  onPinClick: (project: ProjectLocation) => void
  onClusterClick: (projects: ProjectLocation[]) => void
}

export default function MapView({ onPinClick, onClusterClick }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) return null

  const center = [-14.2350, -51.9253] as [number, number]
  const zoom = 4

  return (
    <>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        zoomControl={false}
        style={{ height: "100vh", width: "100%", outline: "none" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <ResetZoomControl center={center} zoom={zoom} />
        <ZoomControl position="bottomright" />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          zoomToBoundsOnClick={false} // Disable default zoom behavior
          eventHandlers={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clusterclick: (e: any) => {
               const cluster = e.layer
               // Stop the map from zooming (event propagation?)
               // Actually zoomToBoundsOnClick: false handles the zoom.
               
               const markers = cluster.getAllChildMarkers()
               const clusterProjects: ProjectLocation[] = []
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               markers.forEach((marker: any) => {
                  const { lat, lng } = marker.getLatLng()
                  // Using same loose matching as before
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
    </>
  )
}
