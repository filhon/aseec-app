"use client";

import { useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { Send, Sparkles, User, Bot, Menu, MessageSquarePlus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  component?: string;
}

interface ChatHistoryItem {
    id: string;
    title: string;
    date: string;
    preview: string;
}

interface ChatInterfaceProps {
  isFloating?: boolean;
  initialContext?: string;
  onClose?: () => void;
}

export interface ChatInterfaceRef {
    sendMessage: (context: string, text: string) => void;
}

// Sidebar Component extracted to avoid re-creation on render
interface SidebarContentProps {
    onToggle: (open: boolean) => void;
    onNewChat: () => void;
    history: ChatHistoryItem[];
    onLoadHistory: (item: ChatHistoryItem) => void;
    apiUsage: { used: number; limit: number; percentage: number };
}

const SidebarContent = ({ onToggle, onNewChat, history, onLoadHistory, apiUsage }: SidebarContentProps) => (
    <div className="flex flex-col h-full border-r bg-muted/10 w-[260px] shrink-0 transition-all duration-300 ease-in-out">
          <div className="p-3 pb-0 lg:hidden flex justify-end">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggle(false)}>
                  <Menu className="w-4 h-4" />
              </Button>
          </div>
          
           <div className="p-4 pt-4">
              <Button variant="outline" className="w-full justify-start gap-2 text-sm px-4" onClick={onNewChat}>
                  <MessageSquarePlus className="w-4 h-4 shrink-0" />
                  <span className="truncate">Nova Conversa</span>
              </Button>
          </div>
          
          <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                  <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 truncate">
                         Recentes
                      </h4>
                      {history.map((item) => (
                          <button
                              key={item.id}
                              onClick={() => onLoadHistory(item)}
                              className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors group flex flex-col gap-0.5"
                          >
                              <span className="font-medium text-xs truncate group-hover:text-primary transition-colors block">{item.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate opacity-70 block">{item.preview}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/20">
              <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                      <span className="font-medium flex items-center gap-1.5 truncate">
                          <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0" /> <span className="truncate">Uso da API</span>
                      </span>
                      <span className="text-muted-foreground text-[10px]">{apiUsage.percentage}%</span>
                  </div>
                  <Progress value={apiUsage.percentage} className="h-2" />
                  <p className="text-[10px] text-muted-foreground text-center pt-1 truncate">
                      {apiUsage.used}/{apiUsage.limit} tokens
                  </p>
              </div>
          </div>
    </div>
);

export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ isFloating = false, initialContext }, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: initialContext 
        ? `Olá! Estou analisando o contexto de: ${initialContext}. Como posso ajudar?`
        : "Olá! Eu sou a aseecIA, sua assistente inteligente alimentada pelo Gemini. Tenho acesso a todo o contexto dos seus projetos. Como posso ajudar você hoje?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock API Usage Data
  const apiUsage = {
      used: 650,
      limit: 1000,
      percentage: 65
  };

  // Mock History Data
  const [history] = useState<ChatHistoryItem[]>([
      { id: "1", title: "Análise de Riscos - Projeto A", date: "Hoje", preview: "Quais são os riscos críticos..." },
      { id: "2", title: "Resumo Financeiro", date: "Ontem", preview: "Me dê um resumo do saldo..." },
      { id: "3", title: "Ideias para Expansão", date: "15/12", preview: "Liste ideias para expandir..." },
  ]);

  // Context Selectors
  const contexts = ["Geral", "Financeiro", "Projetos", "Riscos"];
  const [selectedContext, setSelectedContext] = useState(initialContext || "Geral");



  const handleNewChat = useCallback(() => {
       setMessages([{
          id: crypto.randomUUID(),
          role: "ai",
          content: "Olá! Nova conversa iniciada. Como posso ajudar?",
       }]);
       if (window.innerWidth < 1024) {
           setIsSidebarOpen(false);
       }
  }, []);

  const loadHistoryItem = useCallback((item: ChatHistoryItem) => {
      // Mock loading logic
      setMessages([
          { id: "1", role: "user", content: item.preview },
          { id: "2", role: "ai", content: `(Restaurando contexto da conversa: ${item.title})... Aqui está o que falamos sobre isso.` }
      ]);
      if (window.innerWidth < 1024) {
           setIsSidebarOpen(false);
      }
  }, []);

  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: `[Contexto: ${selectedContext}] Entendi. No momento estou operando em modo de demonstração.`,
      };
      
      // Mock Rich Response
      if (textToSend.toLowerCase().includes("projetos")) {
          aiResponse.content = `[Contexto: ${selectedContext}] Aqui está o resumo dos projetos recentes:`;
          aiResponse.component = "ProjectSummaryCard";
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  }, [inputValue, selectedContext]);

  // Suggestions logic (unchanged)
  const suggestions = [
    { label: "Resumir projetos", prompt: "Resuma a situação atual de todos os projetos ativos." },
    { label: "Riscos críticos", prompt: "Quais são os maiores riscos identificados no momento?" },
    { label: "Saúde financeira", prompt: "Como está o fluxo de caixa para os próximos 30 dias?" },
    { label: "Criar e-mail", prompt: "Crie um rascunho de e-mail cobrando atualizações dos gerentes." },
  ];

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    handleSendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useImperativeHandle(ref, () => ({
      sendMessage: (context, text) => {
          setSelectedContext(context);
          handleSendMessage(text);
      }
  }), [handleSendMessage]);

  return (
    <div className={cn("flex h-full overflow-hidden border rounded-xl bg-background relative", isFloating ? "rounded-none border-0" : "")}>
       
       {/* Sidebar Wrapper */}
       <div className={cn(
           "transition-all duration-300 ease-in-out border-r bg-background/50 backdrop-blur-sm z-40 overflow-hidden",
           // Mobile: always absolute. Desktop: absolute when floating, static otherwise
           "absolute inset-y-0 left-0 h-full",
           !isFloating && "lg:static lg:h-auto",
           isSidebarOpen ? "w-[260px] opacity-100 border-r" : "w-0 opacity-0 border-r-0"
        )}>
            <div className="w-[260px] h-full flex flex-col bg-background">
                 <SidebarContent 
                    onToggle={setIsSidebarOpen}
                    onNewChat={handleNewChat}
                    history={history}
                    onLoadHistory={loadHistoryItem}
                    apiUsage={apiUsage}
                 />
            </div>
       </div>

       {/* Overlay for Mobile / Floating */}
       {isSidebarOpen && (
           <div 
                className={cn(
                    "absolute inset-0 bg-background/80 backdrop-blur-sm z-30 animate-in fade-in duration-300",
                    !isFloating && "lg:hidden"
                )}
                onClick={() => setIsSidebarOpen(false)}
           />
       )}

      <div className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-sm transition-all duration-300">
          {/* Header */}
          <div className={cn("flex items-center justify-between border-b shrink-0", isFloating ? "p-3" : "px-4 py-3")}>
             <div className="flex items-center gap-2">

                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu className="w-4 h-4" />
                </Button>
                {isFloating && (
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-semibold">aseecIA</span>
                    </div>
                )}
                 {!isFloating && (
                    <div className="flex items-center gap-2">
                         <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">aseecIA</h1>
                        </div>
                    </div>
                 )}
             </div>
             
             {/* Context Selector */}
             <div className="hidden sm:flex items-center gap-1">
                 {contexts.slice(0, 3).map(ctx => ( // Show fewer on header
                    <button 
                        key={ctx}
                        onClick={() => setSelectedContext(ctx)}
                        className={cn(
                            "text-[10px] px-2 py-1 rounded-full border transition-colors",
                            selectedContext === ctx ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-muted text-muted-foreground hover:bg-muted"
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
              <div className={cn("space-y-6 mx-auto pb-4", isFloating ? "max-w-full" : "max-w-3xl")}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className={cn(
                      "w-8 h-8 border shrink-0",
                      message.role === "ai" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent"
                    )}>
                      {message.role === "ai" ? (
                        <AvatarImage src="/aseec-avatar.png" className="object-cover" /> 
                      ) : null}
                      <AvatarFallback className={message.role === "ai" ? "bg-transparent" : ""}>
                        {message.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={cn(
                      "flex flex-col gap-1 min-w-0 max-w-[85%]", 
                      message.role === "user" ? "items-end" : "items-start"
                    )}>
                        <div
                            className={cn(
                            "rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap",
                            message.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-muted/50 text-foreground border border-muted rounded-tl-sm"
                            )}
                        >
                            {message.content}
                            
                            {/* Rich Response Rendering */}
                            {message.component === "ProjectSummaryCard" && (
                                <div className="mt-3 p-3 bg-card rounded-lg border shadow-sm w-full min-w-[250px] text-foreground">
                                    <h4 className="font-semibold mb-2">Resumo de Projetos</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>Total Ativos</span>
                                            <span className="font-medium">12</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-green-500 w-[70%]" />
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs">Ver Detalhes</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                ))}
            
                {/* Suggestions - Show only when just 1 message (greeting) exists */}
                {messages.length === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {suggestions.map((sugg) => (
                            <button 
                                key={sugg.label}
                                onClick={() => handleSuggestionClick(sugg.prompt)}
                                className="text-left p-3 rounded-xl border border-muted bg-background/50 hover:bg-muted/50 transition-colors flex flex-col gap-1"
                            >
                                <span className="text-xs font-semibold text-primary">{sugg.label}</span>
                                <span className="text-[10px] text-muted-foreground line-clamp-2">{sugg.prompt}</span>
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
                                 <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                 <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                 <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></div>
                             </div>
                         </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
           </div>
    
           {/* Input Area */}
           <div className={cn("border-t bg-background/50 backdrop-blur-sm", isFloating ? "p-3" : "p-4")}>
                <div className={cn("relative flex items-center gap-2", !isFloating && "max-w-3xl mx-auto")}>
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
                    <div className="text-center mt-2">
                        <p className="text-xs text-muted-foreground">A aseecIA pode cometer erros. Verifique informações importantes.</p>
                    </div>
                )}
           </div>
      </div>
    </div>
  );
});

ChatInterface.displayName = "ChatInterface";
