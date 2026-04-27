import { createClient } from "@/lib/supabase/client";
import type { AseecLocationData } from "@/app/api/location-insights/route";

export type { AseecLocationData };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchSuggestion {
  type: "location" | "project";
  id?: string;
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
}

export interface SearchResult {
  lat: number;
  lng: number;
  title: string;
  type: "location" | "project";
  projectId?: string;
  aseecData?: AseecLocationData;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNominatimTitle(result: NominatimResult): string {
  // Use the first 3 parts of the display name for a clean label
  const parts = result.display_name.split(", ").slice(0, 3);
  return parts.join(", ");
}

function nominatimSubtitle(result: NominatimResult): string | undefined {
  const addr = result.address;
  const parts = [addr.state, addr.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

async function fetchNominatim(
  query: string,
  limit: number,
): Promise<NominatimResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await fetch(`/api/geocode?${params}`);
  if (!response.ok) return [];
  return response.json();
}

async function searchProjectsByTitle(
  query: string,
): Promise<SearchSuggestion[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, title, municipality, state, latitude, longitude")
    .ilike("title", `%${query}%`)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(3);

  if (!data) return [];

  return data.map((p) => ({
    type: "project" as const,
    id: p.id,
    title: p.title,
    subtitle: [p.municipality, p.state].filter(Boolean).join(", ") || undefined,
    lat: p.latitude!,
    lng: p.longitude!,
  }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns autocomplete suggestions combining Supabase projects and
 * Nominatim geocoding results. Debounce before calling.
 */
export async function getSearchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  if (query.trim().length < 2) return [];

  const [nominatimSettled, projectsSettled] = await Promise.allSettled([
    fetchNominatim(query, 4),
    searchProjectsByTitle(query),
  ]);

  const suggestions: SearchSuggestion[] = [];

  // Projects first — more relevant in this context
  if (projectsSettled.status === "fulfilled") {
    suggestions.push(...projectsSettled.value);
  }

  if (nominatimSettled.status === "fulfilled") {
    for (const r of nominatimSettled.value) {
      suggestions.push({
        type: "location",
        title: formatNominatimTitle(r),
        subtitle: nominatimSubtitle(r),
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      });
    }
  }

  return suggestions.slice(0, 7);
}

/**
 * Fetches AI-generated missionary/demographic insights for a location.
 * Returns null silently on failure (non-critical).
 */
export async function getLocationInsights(
  locationTitle: string,
): Promise<AseecLocationData | null> {
  try {
    const params = new URLSearchParams({ q: locationTitle });
    const response = await fetch(`/api/location-insights?${params}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Geocodes a free-text query via Nominatim and returns the best match,
 * including AI-generated location insights fetched in parallel.
 */
export async function searchLocation(
  query: string,
): Promise<SearchResult | null> {
  const [geoSettled, insightsSettled] = await Promise.allSettled([
    fetchNominatim(query, 1),
    getLocationInsights(query),
  ]);

  if (geoSettled.status !== "fulfilled" || geoSettled.value.length === 0) {
    return null;
  }

  const r = geoSettled.value[0];
  const title = formatNominatimTitle(r);

  return {
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    title,
    type: "location",
    aseecData:
      insightsSettled.status === "fulfilled"
        ? (insightsSettled.value ?? undefined)
        : undefined,
  };
}
