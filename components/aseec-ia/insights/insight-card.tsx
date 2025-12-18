"use client";

import { LucideIcon, ArrowRight, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface InsightCardProps {
    title: string;
    icon: LucideIcon;
    summary: string;
    trend?: "up" | "down" | "neutral" | "danger" | "success";
    trendValue?: string; // e.g. "+15%", "2 Critical"
    aiAnalysis: string;
    onAskAI?: () => void;
    relatedLink?: string;
    className?: string;
}

export function InsightCard({
    title,
    icon: Icon,
    summary,
    trend,
    trendValue,
    aiAnalysis,
    onAskAI,
    relatedLink,
    className
}: InsightCardProps) {

    const getTrendIcon = () => {
        switch (trend) {
            case "up": return <TrendingUp className="w-4 h-4 text-green-500" />;
            case "down": return <TrendingDown className="w-4 h-4 text-red-500" />;
            case "danger": return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return null;
        }
    };

    const getTrendColor = () => {
         switch (trend) {
            case "up": 
            case "success": return "text-green-600 dark:text-green-400";
            case "down": 
            case "danger": return "text-red-600 dark:text-red-400";
            default: return "text-muted-foreground";
        }
    };

    return (
        <Card className={cn("flex flex-col h-full hover:shadow-md transition-all border-l-4", 
            trend === "danger" ? "border-l-red-500" : 
            trend === "success" || trend === "up" ? "border-l-green-500" :
            title === "Geral" ? "border-l-primary" : "border-l-transparent border-t-4 border-t-primary lg:border-t-0 lg:border-l-primary",
            className
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-muted/50">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                    {title}
                </CardTitle>
                {trend && (
                    <div className={cn("flex items-center gap-1 text-xs font-bold bg-muted/30 px-2 py-1 rounded-full", getTrendColor())}>
                        {getTrendIcon()}
                        {trendValue}
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-2">
                <div className="mb-4">
                    <p className="text-2xl font-bold tracking-tight">{summary}</p>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex gap-2 items-start p-3 bg-primary/5 rounded-lg border border-primary/10">
                         {/* AI Icon */}
                        <div className="mt-0.5 min-w-[16px]">
                             <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" opacity="0.5"/>
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77V2Z" fill="currentColor"/>
                             </svg>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {aiAnalysis}
                        </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        {onAskAI && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs px-2 hover:bg-primary/10 hover:text-primary transition-colors" onClick={onAskAI}>
                                Explorar na IA
                            </Button>
                        )}
                        {relatedLink && (
                             <Button variant="link" size="sm" className="h-8 text-xs px-2 gap-1" asChild>
                                <a href={relatedLink}>
                                    Detalhes <ArrowRight className="w-3 h-3" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
