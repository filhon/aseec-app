import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type {
  Project,
  Entity,
  Category,
  ProjectInvestment,
  UserRole,
} from "@/lib/types/database.types";

// ---------------------------------------------------------------------------
// Token limits per role (daily)
// ---------------------------------------------------------------------------
const TOKEN_LIMITS: Record<UserRole, number> = {
  admin: 100_000,
  editor: 50_000,
  director: 50_000,
  user: 20_000,
};

// ---------------------------------------------------------------------------
// System instruction
// ---------------------------------------------------------------------------
const BASE_SYSTEM_INSTRUCTION = `Você é a aseecIA, assistente inteligente da plataforma ASEEC — sistema de gestão de projetos missionários.

## Escopo e limites OBRIGATÓRIOS

Você DEVE seguir estas regras sem exceção:

1. **Responda somente com base nos dados do contexto fornecido abaixo (DADOS DA PLATAFORMA).**
   - Se o usuário perguntar algo que não está no contexto fornecido, responda EXATAMENTE:
     "Esta informação está fora do escopo da aseecIA ou não está disponível nos dados atuais da plataforma."
   - Não invente, estime, nem complemente com conhecimento geral dados de projetos, valores financeiros ou entidades.

2. **Proteção de dados pessoais (LGPD)**
   - NUNCA revele dados pessoais de outros usuários: nome completo de outros perfis, e-mail, telefone ou qualquer dado identificável de pessoas físicas que não seja o próprio usuário logado.
   - NUNCA exponha dados bancários (agência, conta, chave PIX) de nenhuma entidade.
   - Se o usuário solicitar esses dados, responda EXATAMENTE:
     "Esta informação está protegida por privacidade e não pode ser fornecida pela aseecIA."

3. **Fora do escopo**
   - Não responda perguntas gerais não relacionadas à plataforma ASEEC (receitas, programação, assuntos gerais, etc.).
   - Para qualquer pergunta fora do escopo da plataforma, responda EXATAMENTE:
     "Esta solicitação está fora do escopo da aseecIA, que é restrita à gestão de projetos missionários da plataforma ASEEC."

## Comportamento geral
- Responda sempre em português do Brasil (pt-BR).
- Seja objetivo, profissional e amigável.
- Pode ajudar a redigir textos relacionados a projetos, interpretar indicadores e sugerir ações — desde que baseados nos dados fornecidos.
- Quando os dados financeiros forem indicados como simulados/mock, informe o usuário claramente.`;

// ---------------------------------------------------------------------------
// Smart keyword extraction
// ---------------------------------------------------------------------------
const PT_STOP_WORDS = new Set([
  "que",
  "com",
  "para",
  "dos",
  "das",
  "como",
  "mais",
  "por",
  "uma",
  "não",
  "são",
  "tem",
  "está",
  "isso",
  "esse",
  "essa",
  "qual",
  "quais",
  "este",
  "esta",
  "todo",
  "toda",
  "todos",
  "todas",
  "seu",
  "sua",
  "seus",
  "suas",
  "pode",
  "quero",
  "saber",
  "sobre",
  "info",
  "dado",
  "dados",
  "ativo",
  "ativos",
  "projeto",
  "projetos",
  "situação",
  "status",
  "listar",
  "liste",
  "mostre",
  "quais",
  "quantos",
  "quando",
  "onde",
  "como",
  "tudo",
  "geral",
  "total",
  "todos",
  "resumo",
  "tenho",
  "temos",
  "nosso",
  "nossa",
]);

function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !PT_STOP_WORDS.has(w))
    .slice(0, 10);
}

// ---------------------------------------------------------------------------
// Project relevance filtering
// ---------------------------------------------------------------------------
type ProjectRow = Pick<
  Project,
  | "id"
  | "title"
  | "status"
  | "country"
  | "state"
  | "municipality"
  | "responsible"
  | "extension"
  | "requested_value"
  | "approved_value"
  | "investment"
  | "start_date"
  | "end_date"
  | "reached_people"
  | "observations"
  | "entity_id"
  | "created_at"
>;

function filterRelevantProjects(
  projects: ProjectRow[],
  keywords: string[],
): ProjectRow[] {
  if (keywords.length === 0) return projects.slice(0, 10);
  const matches = projects.filter((p) => {
    const hay = [
      p.title,
      p.responsible,
      p.country,
      p.state,
      p.municipality,
      p.observations,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return keywords.some((k) => hay.includes(k));
  });
  return matches.length > 0 ? matches.slice(0, 20) : projects.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Token estimation (~3.5 chars/token for Portuguese)
// ---------------------------------------------------------------------------
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

// ---------------------------------------------------------------------------
// Generate conversation title from first user message
// ---------------------------------------------------------------------------
function generateTitle(message: string): string {
  const clean = message.trim().replace(/\s+/g, " ");
  return clean.length > 60 ? clean.slice(0, 57) + "..." : clean;
}

// ---------------------------------------------------------------------------
// Build platform context
// ---------------------------------------------------------------------------
async function buildPlatformContext(
  supabase: ReturnType<typeof createClient>,
  context: string,
  userMessage: string,
): Promise<string> {
  const keywords = extractKeywords(userMessage);
  const sections: string[] = [];

  const { data: projectsRaw } = await supabase
    .from("projects")
    .select(
      "id, title, status, country, state, municipality, responsible, extension, " +
        "requested_value, approved_value, investment, start_date, end_date, " +
        "reached_people, observations, entity_id, created_at",
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(150);
  const allProjects = ((projectsRaw as unknown) ?? []) as ProjectRow[];
  const projects = filterRelevantProjects(allProjects, keywords);

  const { data: entitiesRaw } = await supabase
    .from("entities")
    .select("id, name, description")
    .eq("active", true)
    .order("name");
  const entities = ((entitiesRaw as unknown) ?? []) as Pick<
    Entity,
    "id" | "name" | "description"
  >[];

  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("id, name, description")
    .eq("active", true);
  const categories = ((categoriesRaw as unknown) ?? []) as Pick<
    Category,
    "id" | "name" | "description"
  >[];

  const { data: investmentsRaw } = await supabase
    .from("project_investments")
    .select("project_id, year, value")
    .eq("active", true);
  const investments = ((investmentsRaw as unknown) ?? []) as Pick<
    ProjectInvestment,
    "project_id" | "year" | "value"
  >[];

  const entityMap: Record<string, string> = {};
  for (const e of entities) entityMap[e.id] = e.name;

  const projectIds = new Set(projects.map((p) => p.id));
  const investmentMap: Record<string, { year: number; value: number }[]> = {};
  for (const inv of investments) {
    if (!projectIds.has(inv.project_id)) continue;
    if (!investmentMap[inv.project_id]) investmentMap[inv.project_id] = [];
    investmentMap[inv.project_id].push({ year: inv.year, value: inv.value });
  }

  const statusLabel: Record<string, string> = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };

  const byStatus: Record<string, number> = {};
  let totalInvestment = 0;
  let totalPeople = 0;
  for (const p of allProjects) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    totalInvestment += p.investment ?? 0;
    totalPeople += p.reached_people ?? 0;
  }

  sections.push(`### RESUMO GERAL DA PLATAFORMA
- Total de projetos ativos: ${allProjects.length}
- Por status: ${Object.entries(byStatus)
    .map(([s, n]) => `${statusLabel[s] ?? s}: ${n}`)
    .join(", ")}
- Investimento total realizado: R$ ${totalInvestment.toLocaleString("pt-BR")}
- Pessoas alcançadas (total): ${totalPeople.toLocaleString("pt-BR")}
- Entidades ativas: ${entities.length}
${keywords.length > 0 ? `\n(Detalhes filtrados por relevância — ${projects.length} de ${allProjects.length} projetos exibidos)` : `\n(Exibindo os ${projects.length} projetos mais recentes)`}`);

  if (projects.length > 0) {
    const projectLines = projects.map((p) => {
      const invRows = (investmentMap[p.id] ?? [])
        .map((i) => `${i.year}: R$ ${i.value.toLocaleString("pt-BR")}`)
        .join(", ");
      return [
        `- Projeto: "${p.title}"`,
        `  Status: ${statusLabel[p.status] ?? p.status}`,
        `  Responsável: ${p.responsible ?? "N/D"}`,
        `  País/Estado/Município: ${[p.country, p.state, p.municipality].filter(Boolean).join(" / ") || "N/D"}`,
        `  Entidade: ${p.entity_id ? (entityMap[p.entity_id] ?? "N/D") : "N/D"}`,
        `  Extensão: ${p.extension === "parcial" ? "Parcial" : "Completo"}`,
        `  Valor solicitado: ${p.requested_value != null ? "R$ " + p.requested_value.toLocaleString("pt-BR") : "N/D"}`,
        `  Valor aprovado: ${p.approved_value != null ? "R$ " + p.approved_value.toLocaleString("pt-BR") : "N/D"}`,
        `  Investimento realizado: ${p.investment != null ? "R$ " + p.investment.toLocaleString("pt-BR") : "N/D"}`,
        `  Início: ${p.start_date ?? "N/D"} | Término: ${p.end_date ?? "N/D"}`,
        `  Pessoas alcançadas: ${p.reached_people ?? 0}`,
        invRows ? `  Investimentos anuais: ${invRows}` : null,
        p.observations ? `  Observações: ${p.observations}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    });
    sections.push(`### PROJETOS (detalhes)\n\n${projectLines.join("\n\n")}`);
  }

  if (entities.length > 0) {
    sections.push(
      `### ENTIDADES\n${entities.map((e) => `- ${e.name}${e.description ? `: ${e.description}` : ""}`).join("\n")}`,
    );
  }

  if (categories.length > 0) {
    sections.push(
      `### CATEGORIAS\n${categories.map((c) => `- ${c.name}`).join(", ")}`,
    );
  }

  if (context === "Financeiro") {
    sections.push(
      `### MÓDULO FINANCEIRO\nATENÇÃO: O módulo financeiro detalhado ainda não está integrado em tempo real. Os valores de investimento por projeto acima são os dados reais disponíveis.`,
    );
  }

  return sections.join("\n\n");
}

// ---------------------------------------------------------------------------
// Usage helpers
// ---------------------------------------------------------------------------
async function getOrCreateUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  role: UserRole,
): Promise<{
  tokens_used: number;
  tokens_limit: number;
  request_count: number;
} | null> {
  const today = new Date().toISOString().split("T")[0];
  const limit = TOKEN_LIMITS[role] ?? TOKEN_LIMITS.user;

  const { data: existing } = await supabase
    .from("api_usage")
    .select("tokens_used, tokens_limit, request_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing)
    return existing as {
      tokens_used: number;
      tokens_limit: number;
      request_count: number;
    };

  const { data: created } = await supabase
    .from("api_usage")
    .insert({
      user_id: userId,
      date: today,
      tokens_limit: limit,
      tokens_used: 0,
      request_count: 0,
    })
    .select("tokens_used, tokens_limit, request_count")
    .single();

  return created as {
    tokens_used: number;
    tokens_limit: number;
    request_count: number;
  } | null;
}

async function incrementUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  tokens: number,
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const { data: current } = await supabase
    .from("api_usage")
    .select("tokens_used, request_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (!current) return;
  const row = current as { tokens_used: number; request_count: number };

  await supabase
    .from("api_usage")
    .update({
      tokens_used: row.tokens_used + tokens,
      request_count: row.request_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("date", today);
}

// ---------------------------------------------------------------------------
// Conversation helpers
// ---------------------------------------------------------------------------
async function ensureConversation(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  conversationId: string | null,
  firstUserMessage: string,
  context: string,
): Promise<string> {
  if (conversationId) return conversationId;

  const title = generateTitle(firstUserMessage);
  const contextType = context === "Geral" ? "general" : context.toLowerCase();

  const { data } = await supabase
    .from("ai_conversations")
    .insert({ user_id: userId, title, context_type: contextType })
    .select("id")
    .single();

  return (data as { id: string }).id;
}

async function saveMessage(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await supabase.from("ai_messages").insert({
    conversation_id: conversationId,
    role,
    content,
    metadata: metadata ?? null,
  });
}

async function touchConversation(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
): Promise<void> {
  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY não configurada." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Não autenticado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role: UserRole =
    (profileRaw as { role: UserRole } | null)?.role ?? "user";

  let body: {
    messages: { role: string; content: string }[];
    context?: string;
    conversationId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corpo inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const {
    messages,
    context = "Geral",
    conversationId: incomingConvId = null,
  } = body;
  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Mensagens ausentes." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check usage limit
  let usage: {
    tokens_used: number;
    tokens_limit: number;
    request_count: number;
  } | null = null;
  try {
    usage = await getOrCreateUsage(supabase, user.id, role);
  } catch {
    /* non-fatal */
  }

  if (usage && usage.tokens_used >= usage.tokens_limit) {
    return new Response(
      JSON.stringify({
        error:
          "Limite diário de uso da aseecIA atingido. Tente novamente amanhã.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const userMessage = messages[messages.length - 1].content;

  // Ensure conversation exists in DB
  let conversationId: string;
  try {
    conversationId = await ensureConversation(
      supabase,
      user.id,
      incomingConvId,
      userMessage,
      context,
    );
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao criar conversa." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Save user message (only if this is a new message, not a reload)
  // We save it now, before streaming, so it's persisted even if the LLM fails
  try {
    await saveMessage(supabase, conversationId, "user", userMessage);
  } catch {
    /* non-fatal */
  }

  // Build platform context
  let platformContext = "";
  try {
    platformContext = await buildPlatformContext(
      supabase,
      context,
      userMessage,
    );
  } catch {
    platformContext =
      "Não foi possível carregar os dados da plataforma no momento.";
  }

  const contextLabel =
    context && context !== "Geral" ? ` (Filtro: ${context})` : "";
  const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}

---
## DADOS DA PLATAFORMA${contextLabel} — Atualizados em tempo real

${platformContext}
---`;

  const historyText = messages
    .slice(0, -1)
    .map((m) => m.content)
    .join(" ");
  const estimatedInputTokens = estimateTokens(
    systemInstruction + historyText + userMessage,
  );

  const ai = new GoogleGenAI({ apiKey });

  const rawHistory = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
  const firstUserIndex = rawHistory.findIndex((m) => m.role === "user");
  const history = firstUserIndex >= 0 ? rawHistory.slice(firstUserIndex) : [];

  const stream = new ReadableStream({
    async start(controller) {
      let accumulated = "";
      try {
        const chat = ai.chats.create({
          model: "gemini-2.5-flash",
          config: { systemInstruction },
          history,
        });

        const result = await chat.sendMessageStream({ message: userMessage });

        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            accumulated += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao gerar resposta.";
        controller.enqueue(new TextEncoder().encode(`[Erro: ${message}]`));
        controller.close();
      } finally {
        const outputTokens = estimateTokens(accumulated);
        const totalTokens = estimatedInputTokens + outputTokens;

        await Promise.allSettled([
          // Save AI response
          accumulated
            ? saveMessage(supabase, conversationId, "assistant", accumulated, {
                tokens: totalTokens,
                model: "gemini-2.5-flash",
              })
            : Promise.resolve(),
          // Update conversation timestamp
          touchConversation(supabase, conversationId),
          // Update usage
          incrementUsage(supabase, user.id, totalTokens),
        ]);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Conversation-Id": conversationId,
    },
  });
}
