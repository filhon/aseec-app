"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

import { UserNav } from "@/components/layout/user-nav"
import { Search } from "lucide-react"
import { useSearchStore } from "@/hooks/use-search-store"

export function MobileHeader() {
  const { onOpen } = useSearchStore()

  // Mobile Header no longer needs state for Sheet as we use Bottom Nav

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 sm:hidden justify-between sticky top-0 z-30 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
      {/* Left Slot: Action Button (Search) */}
      <div className="flex-1 flex justify-start">
         <Button variant="ghost" size="icon" onClick={onOpen}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
         </Button>
      </div>
      
      {/* Center Slot: Logo */}
      <div className="flex-initial flex justify-center">
         <Link href="/dashboard" className="flex items-center gap-2">
             <Image 
                src="/logo-hebron.png" 
                alt="Hebron Logo" 
                width={100} 
                height={28} 
                className="h-7 w-auto object-contain brightness-0 dark:invert"
                priority
              />
         </Link>
      </div>
      
      {/* Right Slot: User Nav */}
      <div className="flex-1 flex justify-end">
          <UserNav />
      </div>
    </header>
  )
}
