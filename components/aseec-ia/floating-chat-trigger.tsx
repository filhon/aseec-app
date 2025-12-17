"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChatInterface } from "@/components/aseec-ia/chat-interface";

export function FloatingChatTrigger() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Derive context from pathname
  const getContextFromPath = (path: string) => {
    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/projetos")) return "Projetos";
    if (path.includes("/aseec-ia")) return "Página dedicada aseecIA";
    if (path === "/") return "Home";
    return "Geral";
  };

  const currentContext = getContextFromPath(pathname);

  // Don't show floating button on the dedicated page to avoid redundancy, nor on Home as requested
  if (pathname === "/aseec-ia" || pathname === "/") return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-24 sm:bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 animate-in fade-in zoom-in duration-300 hover:scale-110 transition-transform bg-primary text-primary-foreground border-2 border-white/20"
        >
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">Abrir aseecIA</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col gap-0 border-l border-border/40 bg-background/95 backdrop-blur-xl">
        <VisuallyHidden>
            <SheetTitle>aseecIA Chat</SheetTitle>
            <SheetDescription>Chat com a inteligência artificial</SheetDescription>
        </VisuallyHidden>
        <ChatInterface 
            isFloating={true} 
            initialContext={currentContext} 
            onClose={() => setIsOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
