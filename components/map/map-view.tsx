"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default Leaflet marker icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

// Custom Pins (Green and Blue circular "from above" style with aura)
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
    iconSize: [32, 32], // Increased size for the aura
    iconAnchor: [16, 16], // Center
    popupAnchor: [0, -10],
  })
}

const blueIcon = createCustomIcon("blue")
const greenIcon = createCustomIcon("green")

interface MapViewProps {
  onPinClick: (title: string) => void
}

export default function MapView({ onPinClick }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Center of Brazil approx
  const center = [-14.2350, -51.9253] as [number, number]

  return (
    <MapContainer 
      center={center} 
      zoom={4} 
      scrollWheelZoom={true} 
      zoomControl={false}
      style={{ height: "100vh", width: "100%", outline: "none" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />

      {/* Example Pins */}
      <Marker 
        position={[-23.5505, -46.6333]} 
        icon={greenIcon} 
        eventHandlers={{ click: () => onPinClick("São Paulo - Hebron Base 1") }}
      />

      <Marker 
        position={[-15.7975, -47.8919]} 
        icon={blueIcon} 
        eventHandlers={{ click: () => onPinClick("Brasília - Hebron Base 2") }}
      />

    </MapContainer>
  )
}
