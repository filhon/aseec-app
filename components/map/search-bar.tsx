"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"

interface SearchBarProps {
  onMenuClick: () => void
}

export function SearchBar({ onMenuClick }: SearchBarProps) {
  return (
    <div className="absolute top-4 left-4 z-[400] flex w-full max-w-sm items-center gap-2">
      <Button 
        variant="secondary" 
        size="icon" 
        className="shadow-md" 
        onClick={onMenuClick}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar endereço..."
          className="w-full bg-background pl-8 shadow-md"
        />
      </div>
    </div>
  )
}
