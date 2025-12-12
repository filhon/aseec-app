"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderOpen, Settings, LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projetos", icon: FolderOpen },
    { href: "/settings", label: "Configurações", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <Image 
              src="/logo-hebron.png" 
              alt="Hebron Logo" 
              width={120} 
              height={32} 
              className="h-8 w-auto object-contain brightness-0 dark:invert"
              priority
            />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 px-4 py-6 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary ${
                  isActive
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer: Logoff & Theme */}
        <div className="border-t p-4 flex items-center gap-2">
            <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground hover:text-destructive justify-start px-2">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
            </Button>
            <ModeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <main className="p-4 sm:px-6 sm:py-0 w-full max-w-[1600px] mx-auto">
            {children}
        </main>
      </div>
    </div>
  )
}
