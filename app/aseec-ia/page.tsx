"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";
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
}

export default function AseecIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Olá! Eu sou a aseecIA, sua assistente inteligente alimentada pelo Gemini. Tenho acesso a todo o contexto dos seus projetos. Como posso ajudar você hoje?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        // Find the scrollable viewport inside the ScrollArea
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Entendi. No momento estou operando em modo de demonstração, mas logo estarei conectada à minha chave de API para analisar seus dados em tempo real!",
      };
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
    <div className="flex flex-col h-[calc(100vh-2rem)] gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b pb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">aseecIA</h1>
          <p className="text-sm text-muted-foreground">by Gemini</p>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm border-muted">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6 max-w-3xl mx-auto">
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
                  "flex flex-col gap-1 min-w-0 max-w-[80%]",
                  message.role === "user" ? "items-end" : "items-start"
                )}>
                    {/* Optional Name Label */}
                    <span className="text-xs text-muted-foreground">
                        {message.role === "ai" ? "aseecIA" : "Você"}
                    </span>
                    
                    <div
                        className={cn(
                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted/50 text-foreground border border-muted rounded-tl-sm"
                        )}
                    >
                        {message.content}
                    </div>
                </div>
              </div>
            ))}
            
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
        <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto relative flex items-center gap-2">
                <Input
                    placeholder="Pergunte sobre seus projetos..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-12 py-6 rounded-full shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20"
                    disabled={isLoading}
                />
                <Button 
                    size="icon" 
                    className="absolute right-1.5 h-9 w-9 rounded-full" 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                >
                    <Send className="w-4 h-4" />
                    <span className="sr-only">Enviar</span>
                </Button>
            </div>
            <div className="text-center mt-2">
                <p className="text-xs text-muted-foreground">A aseecIA pode cometer erros. Verifique informações importantes.</p>
            </div>
        </div>
      </Card>
    </div>
  );
}
