
export interface AseecData {
  capital: string
  population: string
  religion: string
  evangelicals: string
  unreached: string
}

export interface SearchResult {
  lat: number
  lng: number
  title: string
  aseecData?: AseecData
}

// Mock database of locations
const LOCATIONS: Record<string, SearchResult> = {
  "brasil": {
    lat: -14.2350,
    lng: -51.9253,
    title: "Brasil",
    aseecData: {
      capital: "Brasília",
      population: "214,3 milhões",
      religion: "Cristianismo",
      evangelicals: "31%",
      unreached: "Diversas etnias indígenas"
    }
  },
  "são paulo": {
    lat: -23.5505,
    lng: -46.6333,
    title: "São Paulo, SP",
    aseecData: {
      capital: "São Paulo",
      population: "12,4 milhões",
      religion: "Cristianismo",
      evangelicals: "24%",
      unreached: "Imigrantes de países fechados"
    }
  },
  "rio de janeiro": {
    lat: -22.9068,
    lng: -43.1729,
    title: "Rio de Janeiro, RJ",
    aseecData: {
      capital: "Rio de Janeiro",
      population: "6,7 milhões",
      religion: "Cristianismo",
      evangelicals: "29%",
      unreached: "Comunidades específicas"
    }
  },
  "recife": {
    lat: -8.0476,
    lng: -34.8770,
    title: "Recife, PE",
    aseecData: {
      capital: "Recife",
      population: "1,6 milhões",
      religion: "Cristianismo",
      evangelicals: "35%",
      unreached: "Grupos urbanos marginalizados"
    }
  },
  "brasília": {
    lat: -15.7975,
    lng: -47.8919,
    title: "Brasília, DF",
    aseecData: {
      capital: "Brasília",
      population: "3,0 milhões",
      religion: "Cristianismo",
      evangelicals: "33%",
      unreached: "Diplomatas de nações fechadas"
    }
  },
  "bahia": {
      lat: -12.9777, 
      lng: -38.5016, 
      title: "Bahia",
      aseecData: {
        capital: "Salvador",
        population: "14,9 milhões",
        religion: "Catolicismo / Matriz Africana",
        evangelicals: "17%",
        unreached: "Comunidades Quilombolas e Ciganos"
      }
  }
}

export async function searchLocation(query: string): Promise<SearchResult | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const normalizedQuery = query.toLowerCase().trim()
  
  // Direct match lookup
  if (LOCATIONS[normalizedQuery]) {
    return LOCATIONS[normalizedQuery]
  }

  // Partial match
  const foundKey = Object.keys(LOCATIONS).find(key => key.includes(normalizedQuery) || normalizedQuery.includes(key))
  if (foundKey) {
    return LOCATIONS[foundKey]
  }

  return null
}
