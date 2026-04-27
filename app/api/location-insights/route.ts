import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export interface AseecLocationData {
  capital: string;
  population: string;
  religion: string;
  evangelicals: string;
  unreached: string;
}

const SYSTEM_PROMPT = `Você é um especialista em missiologia e estatísticas populacionais com foco no contexto missionário evangélico.

Dado o nome de uma localidade (cidade, estado, país ou região), retorne um JSON com dados demográficos e missionários relevantes.

Formato OBRIGATÓRIO (retorne APENAS o JSON, sem markdown, sem texto adicional):
{
  "capital": "nome da capital ou cidade principal da região",
  "population": "estimativa populacional formatada em português (ex: '12,4 milhões' ou '850 mil')",
  "religion": "religião ou tradição religiosa predominante",
  "evangelicals": "percentual estimado de cristãos evangélicos (ex: '24%' ou 'aprox. 8%')",
  "unreached": "descrição concisa dos principais grupos populacionais não alcançados pelo evangelho (ex: imigrantes, comunidades indígenas, grupos étnicos específicos)"
}

Fontes de referência: Pew Research, Joshua Project, IBGE, Operation World.
Responda sempre em português do Brasil.
Para dados incertos, use estimativas razoáveis com qualificadores como "aprox." ou "estimado".`;

async function callGemini(location: string): Promise<AseecLocationData | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Localidade: ${location}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) return null;

  return JSON.parse(text) as AseecLocationData;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json(null);

  const cacheKey = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const getCached = unstable_cache(
    () => callGemini(q),
    ["location-insights", cacheKey],
    { revalidate: 86400 }, // cache por 24h
  );

  try {
    const data = await getCached();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/location-insights]", err);
    return NextResponse.json(null);
  }
}
