"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  component?: string;
}

interface ChatInterfaceProps {
  isFloating?: boolean;
  initialContext?: string;
  onClose?: () => void;
}

export function ChatInterface({ isFloating = false, initialContext, onClose }: ChatInterfaceProps) {
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

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  };

  // Context Selectors
  const contexts = ["Geral", "Financeiro", "Projetos", "Riscos"];
  const [selectedContext, setSelectedContext] = useState(initialContext || "Geral");

  useEffect(() => {
    if (initialContext) setSelectedContext(initialContext);
  }, [initialContext]);

  // Suggestions
  const suggestions = [
    { label: "Resumir projetos", prompt: "Resuma a situação atual de todos os projetos ativos." },
    { label: "Riscos críticos", prompt: "Quais são os maiores riscos identificados no momento?" },
    { label: "Saúde financeira", prompt: "Como está o fluxo de caixa para os próximos 30 dias?" },
    { label: "Criar e-mail", prompt: "Crie um rascunho de e-mail cobrando atualizações dos gerentes." },
  ];

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt);
    // Optional: auto-send
    // handleSendMessage(); 
    // Let's just fill the input so user can confirm, or we can auto-send. 
    // Plan says "immediately populates the input and sends", so let's try auto-sending via a small timeout or direct call if we refactor.
    // For simplicity, let's just set it and let user press enter, OR we can call logic.
    // To allow auto-send, we can extract the send logic or just use a useEffect hook listening to a trigger, 
    // but the easiest is to call a version of handleSendMessage that accepts text.
    
    // Changing handleSendMessage to accept optional text
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `[Contexto: ${selectedContext}] Entendi. No momento estou operando em modo de demonstração.`,
      };
      
      // Mock Rich Response for "Projetos"
      if (textToSend.toLowerCase().includes("projetos")) {
          aiResponse.content = `[Contexto: ${selectedContext}] Aqui está o resumo dos projetos recentes:`;
          aiResponse.component = "ProjectSummaryCard";
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn("flex flex-col h-full", isFloating ? "px-0" : "gap-4")}>
      {/* Header - Only for standalone page, or customized for floating */}
      {!isFloating && (
        <div className="flex items-center gap-2 border-b pb-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">aseecIA</h1>
                <p className="text-sm text-muted-foreground">by Gemini</p>
            </div>
          </div>
        </div>
      )}

      {isFloating && (
           <div className="flex items-center justify-between p-4 border-b">
             <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-primary" />
                 <span className="font-semibold">aseecIA</span>
             </div>
           </div>
      )}
      
      {/* Context Selector Bar */}
      <div className={cn("flex gap-2 pb-2 overflow-x-auto no-scrollbar", isFloating ? "px-4 pt-2" : "")}>
        {contexts.map(ctx => (
            <Button 
                key={ctx} 
                variant={selectedContext === ctx ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => setSelectedContext(ctx)}
            >
                {ctx}
            </Button>
        ))}
      </div>

      {/* Chat Area */}
      <Card className={cn(
          "flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm",
          isFloating ? "border-0 shadow-none rounded-none" : "border-muted"
      )}>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className={cn("space-y-6 mx-auto", isFloating ? "max-w-full" : "max-w-3xl")}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className={cn(
                  "w-8 h-8 border",
                  message.role === "ai" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent"
                )}>
                  {message.role === "ai" ? (
                    <AvatarImage src="/gemini-icon.png" className="object-cover" /> 
                  ) : null}
                  <AvatarFallback className={message.role === "ai" ? "bg-transparent" : ""}>
                    {message.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "flex flex-col gap-1 min-w-0 max-w-[85%]", 
                  message.role === "user" ? "items-end" : "items-start"
                )}>
                    <span className="text-xs text-muted-foreground">
                        {message.role === "ai" ? "aseecIA" : "Você"}
                    </span>
                    
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
                            <div className="mt-3 p-3 bg-card rounded-lg border shadow-sm w-full min-w-[250px]">
                                <h4 className="font-semibold mb-2">Resumo de Projetos</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Ativos</span>
                                        <span className="font-medium">12</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-red-500">
                                        <span>Atrasados</span>
                                        <span className="font-medium">3</span>
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
                     <span className="text-xs text-muted-foreground">aseecIA</span>
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
      </Card>
    </div>
  );
}
