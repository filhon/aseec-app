"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  content?: React.ReactNode
  className?: string
}

export function Sidebar({ isOpen, onClose, title = "Detalhes", content, className }: SidebarProps) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-[500] h-full w-full max-w-sm transform bg-background shadow-xl transition-transform duration-300 ease-in-out md:w-80",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className={cn("p-4", className)}>
        {content || (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione um local no mapa para ver mais detalhes.
            </p>
            <div className="h-32 rounded-lg bg-muted/50" />
            <div className="h-8 w-3/4 rounded bg-muted/50" />
            <div className="h-8 w-1/2 rounded bg-muted/50" />
          </div>
        )}
      </div>
    </div>
  )
}
