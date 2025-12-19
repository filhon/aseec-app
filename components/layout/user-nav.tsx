"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown, LogOut, Moon, Sun, Laptop, Heart, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { useState } from "react"

export function UserNav() {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const { user, profile, isLoading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error("Erro ao sair: " + error.message)
      setIsLoggingOut(false)
      return
    }

    toast.success("Até logo!")
    router.push("/login")
    router.refresh()
  }

  // Generate initials from name
  const getInitials = (name: string | null) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-2">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="hidden lg:flex flex-col gap-1 min-w-0 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Usuário"
  const displayEmail = user?.email || "email@exemplo.com"
  const initials = getInitials(profile?.full_name ?? user?.user_metadata?.full_name ?? null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full lg:h-auto lg:w-full lg:rounded-md lg:justify-start lg:px-2 lg:py-2 lg:gap-2 lg:text-left hover:bg-muted/50" suppressHydrationWarning>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-sm leading-tight break-words">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate w-full">{displayEmail}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground opacity-50 shrink-0 hidden lg:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[1001]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground text-ellipsis overflow-hidden">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>

          <DropdownMenuItem asChild>
            <Link href="/favoritos" className="w-full cursor-pointer">
              <Heart className="mr-2 h-4 w-4" />
              <span>Favoritos</span>
            </Link>
          </DropdownMenuItem>

        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Claro</span>
                {theme === 'light' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Escuro</span>
                {theme === 'dark' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>Sistema</span>
                {theme === 'system' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10" 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

