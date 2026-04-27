"use client";

import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
import {
  Send,
  Sparkles,
  User,
  Bot,
  Menu,
  MessageSquarePlus,
  BarChart3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ConversationListItem } from "@/app/api/chat/conversations/route";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface ChatInterfaceProps {
  isFloating?: boolean;
  initialContext?: string;
  onClose?: () => void;
}

export interface ChatInterfaceRef {
  sendMessage: (context: string, text: string) => void;
}

const GREETING =
  "Olá! Eu sou a aseecIA, sua assistente inteligente. Tenho acesso em tempo real aos dados da plataforma ASEEC. Como posso ajudar?";

function makeGreeting(initialContext?: string): Message {
  return {
    id: crypto.randomUUID(),
    role: "ai",
    content: initialContext
      ? `Olá! Estou com o contexto de "${initialContext}" ativo. Como posso ajudar?`
      : GREETING,
  };
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
interface SidebarContentProps {
  onToggle: (open: boolean) => void;
  onNewChat: () => void;
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  onLoadConversation: (item: ConversationListItem) => void;
  onDeleteConversation: (id: string) => void;
  apiUsage: {
    used: number;
    limit: number;
    percentage: number;
    requests: number;
  };
  isLoadingConversations: boolean;
}

const SidebarContent = ({
  onToggle,
  onNewChat,
  conversations,
  activeConversationId,
  onLoadConversation,
  onDeleteConversation,
  apiUsage,
  isLoadingConversations,
}: SidebarContentProps) => (
  <div className="flex flex-col h-full border-r bg-muted/10 w-[260px] shrink-0">
    <div className="p-3 pb-0 lg:hidden flex justify-end">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onToggle(false)}
      >
        <Menu className="w-4 h-4" />
      </Button>
    </div>

    <div className="p-4 pt-4">
      <Button
        variant="outline"
        className="w-full justify-start gap-2 text-sm px-4"
        onClick={onNewChat}
      >
        <MessageSquarePlus className="w-4 h-4 shrink-0" />
        <span className="truncate">Nova Conversa</span>
      </Button>
    </div>

    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 pb-4">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Recentes
          </h4>

          {isLoadingConversations && (
            <div className="space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 rounded-md bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoadingConversations && conversations.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-4">
              Nenhuma conversa ainda.
            </p>
          )}

          {conversations.map((item) => (
            <div key={item.id} className="group relative">
              <button
                onClick={() => onLoadConversation(item)}
                className={cn(
                  "w-full text-left p-2 pr-7 rounded-md transition-colors flex flex-col gap-0.5",
                  activeConversationId === item.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50",
                )}
              >
                <span className="font-medium text-xs truncate block">
                  {item.title}
                </span>
                <span className="text-[10px] text-muted-foreground truncate opacity-70 block">
                  {item.preview}
                </span>
              </button>
              <button
                onClick={() => onDeleteConversation(item.id)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-destructive"
                title="Excluir conversa"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>

    <div className="p-4 border-t bg-muted/20">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium flex items-center gap-1.5 truncate">
            <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">Uso da API</span>
          </span>
          <span className="text-muted-foreground text-[10px]">
            {apiUsage.percentage}%
          </span>
        </div>
        <Progress value={apiUsage.percentage} className="h-2" />
        <p className="text-[10px] text-muted-foreground text-center pt-1 truncate">
          {(apiUsage.used / 1000).toFixed(1)}K /{" "}
          {(apiUsage.limit / 1000).toFixed(0)}K tokens hoje
        </p>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Markdown renderer (reused for AI messages)
// ---------------------------------------------------------------------------
const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => (
    <h1 className="text-base font-bold mb-1 mt-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-bold mb-1 mt-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>
  ),
  code: ({ children }) => (
    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted p-2 rounded-lg text-xs font-mono overflow-x-auto mb-2">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-muted-foreground/40 pl-3 italic text-muted-foreground mb-2">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-muted my-2" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-2">
      <table className="text-xs border-collapse w-full">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-muted px-2 py-1 bg-muted font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-muted px-2 py-1">{children}</td>
  ),
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(
  ({ isFloating = false, initialContext }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      makeGreeting(initialContext),
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Conversation state
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ConversationListItem[]>(
      [],
    );
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);

    // API usage state
    const [apiUsage, setApiUsage] = useState({
      used: 0,
      limit: 1,
      percentage: 0,
      requests: 0,
    });

    const contexts = ["Geral", "Financeiro", "Projetos", "Riscos"];
    const [selectedContext, setSelectedContext] = useState(
      initialContext || "Geral",
    );

    // -----------------------------------------------------------------------
    // Fetch helpers
    // -----------------------------------------------------------------------
    const fetchUsage = useCallback(async () => {
      try {
        const res = await fetch("/api/chat/usage");
        if (res.ok) setApiUsage(await res.json());
      } catch {
        /* non-critical */
      }
    }, []);

    const fetchConversations = useCallback(async () => {
      setIsLoadingConversations(true);
      try {
        const res = await fetch("/api/chat/conversations");
        if (res.ok) setConversations(await res.json());
      } catch {
        /* non-critical */
      } finally {
        setIsLoadingConversations(false);
      }
    }, []);

    useEffect(() => {
      fetchUsage();
      fetchConversations();
    }, [fetchUsage, fetchConversations]);

    // -----------------------------------------------------------------------
    // New chat
    // -----------------------------------------------------------------------
    const handleNewChat = useCallback(() => {
      setConversationId(null);
      setMessages([makeGreeting(initialContext)]);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }, [initialContext]);

    // -----------------------------------------------------------------------
    // Load existing conversation
    // -----------------------------------------------------------------------
    const loadConversation = useCallback(async (item: ConversationListItem) => {
      setConversationId(item.id);
      setIsLoading(true);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);

      try {
        const res = await fetch(`/api/chat/conversations/${item.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const loaded: Message[] = (
          data.messages as { id: string; role: string; content: string }[]
        ).map((m) => ({
          id: m.id,
          role: m.role === "user" ? "user" : "ai",
          content: m.content,
        }));
        setMessages(loaded.length > 0 ? loaded : [makeGreeting()]);
      } catch {
        setMessages([makeGreeting()]);
      } finally {
        setIsLoading(false);
      }
    }, []);

    // -----------------------------------------------------------------------
    // Delete conversation
    // -----------------------------------------------------------------------
    const deleteConversation = useCallback(
      async (id: string) => {
        await fetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (conversationId === id) {
          setConversationId(null);
          setMessages([makeGreeting(initialContext)]);
        }
      },
      [conversationId, initialContext],
    );

    // -----------------------------------------------------------------------
    // Send message
    // -----------------------------------------------------------------------
    const handleSendMessage = useCallback(
      async (textOverride?: string) => {
        const textToSend = textOverride ?? inputValue;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: textToSend,
        };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        const aiMsgId = crypto.randomUUID();
        setMessages((prev) => [
          ...prev,
          { id: aiMsgId, role: "ai", content: "" },
        ]);

        try {
          // Build message history for the API (exclude the greeting-only message)
          const allMessages = [...messages, userMsg].filter(
            (m) => !(m.role === "ai" && m.content === GREETING),
          );

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: allMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              context: selectedContext,
              conversationId,
            }),
          });

          if (!response.ok || !response.body) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(
              (errData as { error?: string }).error ??
                "Falha ao conectar com a IA.",
            );
          }

          // Capture conversation ID from header (new conversations)
          const returnedConvId = response.headers.get("X-Conversation-Id");
          if (returnedConvId && returnedConvId !== conversationId) {
            setConversationId(returnedConvId);
            // Refresh the sidebar list to show the new conversation
            fetchConversations();
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            const snap = accumulated;
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, content: snap } : m)),
            );
          }
        } catch (err) {
          const errorText =
            err instanceof Error ? err.message : "Erro desconhecido.";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    content: `Não foi possível obter resposta: ${errorText}`,
                  }
                : m,
            ),
          );
        } finally {
          setIsLoading(false);
          fetchUsage();
          // Refresh conversation list to update preview/timestamp
          fetchConversations();
        }
      },
      [
        inputValue,
        selectedContext,
        messages,
        conversationId,
        fetchUsage,
        fetchConversations,
      ],
    );

    const handleSuggestionClick = useCallback(
      (prompt: string) => handleSendMessage(prompt),
      [handleSendMessage],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        sendMessage: (context, text) => {
          setSelectedContext(context);
          handleSendMessage(text);
        },
      }),
      [handleSendMessage],
    );

    const suggestions = [
      {
        label: "Resumir projetos",
        prompt: "Resuma a situação atual de todos os projetos ativos.",
      },
      {
        label: "Riscos críticos",
        prompt: "Quais projetos estão com status pendente há mais tempo?",
      },
      {
        label: "Saúde financeira",
        prompt: "Qual é o investimento total realizado nos projetos?",
      },
      {
        label: "Criar e-mail",
        prompt:
          "Crie um rascunho de e-mail cobrando atualizações dos gerentes de projetos.",
      },
    ];

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
      <div
        className={cn(
          "flex h-full overflow-hidden border rounded-xl bg-background relative",
          isFloating ? "rounded-none border-0" : "",
        )}
      >
        {/* Sidebar Wrapper */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out border-r bg-background/50 backdrop-blur-sm z-40 overflow-hidden",
            "absolute inset-y-0 left-0 h-full",
            !isFloating && "lg:static lg:h-auto",
            isSidebarOpen
              ? "w-[260px] opacity-100 border-r"
              : "w-0 opacity-0 border-r-0",
          )}
        >
          <div className="w-[260px] h-full flex flex-col bg-background">
            <SidebarContent
              onToggle={setIsSidebarOpen}
              onNewChat={handleNewChat}
              conversations={conversations}
              activeConversationId={conversationId}
              onLoadConversation={loadConversation}
              onDeleteConversation={deleteConversation}
              apiUsage={apiUsage}
              isLoadingConversations={isLoadingConversations}
            />
          </div>
        </div>

        {/* Overlay for Mobile / Floating */}
        {isSidebarOpen && (
          <div
            className={cn(
              "absolute inset-0 bg-background/80 backdrop-blur-sm z-30 animate-in fade-in duration-300",
              !isFloating && "lg:hidden",
            )}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-sm transition-all duration-300">
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b shrink-0",
              isFloating ? "p-3" : "px-4 py-3",
            )}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              {isFloating ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold">aseecIA</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h1 className="text-lg font-bold tracking-tight">aseecIA</h1>
                </div>
              )}
            </div>

            {/* Context Selector */}
            <div className="hidden sm:flex items-center gap-1">
              {contexts.slice(0, 3).map((ctx) => (
                <button
                  key={ctx}
                  onClick={() => setSelectedContext(ctx)}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-full border transition-colors",
                    selectedContext === ctx
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent border-muted text-muted-foreground hover:bg-muted",
                  )}
                >
                  {ctx}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div
                className={cn(
                  "space-y-6 mx-auto pb-4",
                  isFloating ? "max-w-full" : "max-w-3xl",
                )}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <Avatar
                      className={cn(
                        "w-8 h-8 border shrink-0",
                        message.role === "ai"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-transparent",
                      )}
                    >
                      {message.role === "ai" ? (
                        <AvatarImage
                          src="/aseec-avatar.png"
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback
                        className={
                          message.role === "ai" ? "bg-transparent" : ""
                        }
                      >
                        {message.role === "ai" ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        "flex flex-col gap-1 min-w-0 max-w-[85%]",
                        message.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 text-sm shadow-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap"
                            : "bg-muted/50 text-foreground border border-muted rounded-tl-sm",
                        )}
                      >
                        {message.role === "user" ? (
                          message.content
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={mdComponents}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Suggestions — only on fresh conversation */}
                {messages.length === 1 && messages[0].role === "ai" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {suggestions.map((sugg) => (
                      <button
                        key={sugg.label}
                        onClick={() => handleSuggestionClick(sugg.prompt)}
                        className="text-left p-3 rounded-xl border border-muted bg-background/50 hover:bg-muted/50 transition-colors flex flex-col gap-1"
                      >
                        <span className="text-xs font-semibold text-primary">
                          {sugg.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground line-clamp-2">
                          {sugg.prompt}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 border bg-primary/10 text-primary border-primary/20">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="w-4 h-4 animate-pulse" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-sm border border-muted w-16">
                        <div className="flex gap-1 justify-center">
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div
            className={cn(
              "border-t bg-background/50 backdrop-blur-sm",
              isFloating ? "p-3" : "p-4",
            )}
          >
            <div
              className={cn(
                "relative flex items-center gap-2",
                !isFloating && "max-w-3xl mx-auto",
              )}
            >
              <Input
                placeholder="Pergunte algo..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-12 py-6 rounded-full shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20"
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="absolute right-1.5 h-9 w-9 rounded-full"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
            {!isFloating && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                A aseecIA pode cometer erros. Verifique informações importantes.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ChatInterface.displayName = "ChatInterface";
