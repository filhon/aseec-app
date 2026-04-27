import { NextRequest, NextResponse } from "next/server";

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
    country_code?: string;
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const limit = request.nextUrl.searchParams.get("limit") ?? "5";

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  const params = new URLSearchParams({
    q: q.trim(),
    format: "json",
    limit,
    addressdetails: "1",
    "accept-language": "pt-BR,pt;q=0.9",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "ASEEC-MissionaryApp/1.0",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) return NextResponse.json([]);

    const data: NominatimResult[] = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
