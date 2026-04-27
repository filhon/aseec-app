"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ProjectLocation } from "@/lib/services/project-service";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DEFAULT_CENTER: [number, number] = [-51.9253, -14.235];
const DEFAULT_ZOOM = 4;

interface MapControlsProps {
  mapRef: React.RefObject<MapRef | null>;
}

function MapControls({ mapRef }: MapControlsProps) {
  return (
    <div
      className="absolute bottom-24 right-6 md:bottom-6 flex flex-col gap-2 z-10"
      style={{ pointerEvents: "auto" }}
    >
      <Button
        variant="secondary"
        size="icon"
        onClick={() =>
          mapRef.current?.flyTo({
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            duration: 1000,
          })
        }
        className="shadow-md h-9 w-9 bg-background/95 backdrop-blur hover:bg-background/100"
        title="Redefinir visualização"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <div className="flex flex-col rounded-md shadow-md bg-background/95 backdrop-blur overflow-hidden border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => mapRef.current?.zoomIn()}
          className="h-9 w-9 rounded-none hover:bg-muted border-b"
          title="Aumentar zoom"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => mapRef.current?.zoomOut()}
          className="h-9 w-9 rounded-none hover:bg-muted"
          title="Diminuir zoom"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface MapViewProps {
  projects?: ProjectLocation[];
  onPinClick: (project: ProjectLocation) => void;
  onClusterClick: (projects: ProjectLocation[]) => void;
  className?: string;
  style?: React.CSSProperties;
  flyTo?: { lat: number; lng: number; zoom: number } | null;
  hideControls?: boolean;
}

export default function MapView({
  projects = [],
  onPinClick,
  onClusterClick,
  className,
  style,
  flyTo,
  hideControls,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [cursor, setCursor] = useState<string>("grab");

  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: flyTo.zoom,
      duration: 1500,
      essential: true,
    });
  }, [flyTo]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: projects.map((p) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [p.lng, p.lat],
        },
        properties: {
          id: p.id,
          type: p.type ?? "blue",
        },
      })),
    }),
    [projects],
  );

  const handleClick = useCallback(
    async (e: MapLayerMouseEvent) => {
      if (!e.features?.length || !mapRef.current) return;
      const feature = e.features[0];

      if (feature.layer.id === "clusters") {
        const clusterId = feature.properties?.cluster_id as number;
        try {
          const source = mapRef.current.getSource("projects") as GeoJSONSource;
          const leaves = await source.getClusterLeaves(clusterId, Infinity, 0);
          const clusterProjects = leaves
            .map((leaf) => projects.find((p) => p.id === leaf.properties?.id))
            .filter((p): p is ProjectLocation => !!p);
          if (clusterProjects.length > 0) onClusterClick(clusterProjects);
        } catch (err) {
          console.error("Failed to get cluster leaves", err);
        }
      } else if (feature.layer.id === "unclustered-point") {
        const project = projects.find((p) => p.id === feature.properties?.id);
        if (project) onPinClick(project);
      }
    },
    [projects, onPinClick, onClusterClick],
  );

  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);

  return (
    <div
      style={{ width: "100%", height: "100%", ...style }}
      className={className}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: DEFAULT_CENTER[0],
          latitude: DEFAULT_CENTER[1],
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        cursor={cursor}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Source
          id="projects"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {/* Cluster outer glow */}
          <Layer
            id="cluster-glow"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "rgba(59, 130, 246, 0.15)",
              "circle-radius": [
                "step",
                ["get", "point_count"],
                28,
                10,
                38,
                30,
                48,
              ],
              "circle-blur": 0.8,
            }}
          />
          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#3b82f6",
                10,
                "#2563eb",
                30,
                "#1d4ed8",
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                18,
                10,
                26,
                30,
                34,
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
          {/* Cluster count text */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-size": 12,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />
          {/* Individual point outer glow */}
          <Layer
            id="unclustered-point-glow"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": [
                "case",
                ["==", ["get", "type"], "green"],
                "#22c55e",
                "#3b82f6",
              ],
              "circle-radius": 14,
              "circle-opacity": 0.2,
              "circle-blur": 0.5,
            }}
          />
          {/* Individual points */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": [
                "case",
                ["==", ["get", "type"], "green"],
                "#22c55e",
                "#3b82f6",
              ],
              "circle-radius": 7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        {!hideControls && <MapControls mapRef={mapRef} />}
      </Map>
    </div>
  );
}
