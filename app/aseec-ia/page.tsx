"use client";

import { useState, useRef } from "react";
import { ChatInterface, ChatInterfaceRef } from "@/components/aseec-ia/chat-interface";
import { InsightsTabs } from "@/components/aseec-ia/insights/insights-tabs";
import { LayoutDashboard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AseecIAPage() {
    const chatRef = useRef<ChatInterfaceRef>(null);
    const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");

    const handleInsightClick = (context: string, prompt: string) => {
        setActiveTab("chat");
        // Small timeout to allow tab switch rendering if needed, though hidden div should be instant.
        setTimeout(() => {
             chatRef.current?.sendMessage(context, prompt);
        }, 100);
    };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden p-6">
        {/* Page Header & Tabs */}
        <div className="flex flex-col gap-4 pb-4 shrink-0 border-b">
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Central de Insights</h1>
                    <p className="text-sm text-muted-foreground">Monitoramento inteligente e análise assistida.</p>
                </div>
            </div>
            
            <div className="flex p-1 bg-muted/50 rounded-lg w-full max-w-sm self-start">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("insights")}
                    className={cn(
                        "flex-1 rounded-md text-sm font-medium transition-all",
                        activeTab === "insights" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Insights
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("chat")}
                    className={cn(
                        "flex-1 rounded-md text-sm font-medium transition-all",
                        activeTab === "chat" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat IA
                </Button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative mt-4">
            
            {/* Tab: Insights */}
            <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-300", 
                activeTab === "insights" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
            )}>
                <InsightsTabs onInsightClick={handleInsightClick} />
            </div>

            {/* Tab: Chat (Kept mounted to preserve history) */}
            <div className={cn("absolute inset-0 flex flex-col transition-opacity duration-300",
                 activeTab === "chat" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
            )}>
                 <div className="h-full rounded-xl border bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
                    <ChatInterface ref={chatRef} isFloating={true} />
                 </div>
            </div>
        </div>
    </div>
  );
}
