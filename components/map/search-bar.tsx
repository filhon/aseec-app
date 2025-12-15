"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"

interface SearchBarProps {
  onMenuClick: () => void
  onSearch: (query: string) => void
  isHidden?: boolean
}

export function SearchBar({ onMenuClick, onSearch, isHidden }: SearchBarProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("q") as string
    if (query) {
      onSearch(query)
    }
  }

  if (isHidden) return null

  return (
    <form 
      onSubmit={handleSearch}
      className="absolute top-4 left-4 z-[400] flex w-full max-w-sm items-center gap-2"
    >
      <Button 
        type="button"
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
          name="q"
          type="search"
          placeholder="Buscar endereço..."
          className="w-full bg-background pl-8 shadow-md"
        />
      </div>
    </form>
  )
}
