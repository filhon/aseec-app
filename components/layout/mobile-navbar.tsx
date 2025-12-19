"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderOpen, ChartNoAxesCombined, Settings, Activity, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/lib/permissions"

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: Permission;
}

export function MobileNavbar() {
  const pathname = usePathname()
  const { can } = usePermissions()

  const allNavItems: NavItemConfig[] = [
    { href: "/", label: "Mapa", icon: Map },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiredPermission: "view:dashboard" },
    { href: "/projetos", label: "Projetos", icon: FolderOpen },
    { href: "/projetos/feed", label: "Feed", icon: Activity, requiredPermission: "view:feed" },
    { href: "/financeiro", label: "Finanças", icon: ChartNoAxesCombined, requiredPermission: "view:financeiro" },
    { href: "/configuracoes", label: "Config", icon: Settings, requiredPermission: "view:settings" },
  ]

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    if (!item.requiredPermission) return true;
    return can(item.requiredPermission);
  });

  // Calculate grid columns based on visible items
  const gridCols = `grid-cols-${navItems.length}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block h-16 w-full border-t bg-background sm:hidden">
      <div className={cn("grid h-full", gridCols)} style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
        {navItems.map((item) => {
          // Logic to differentiate Projects vs Feed vs Dashboard
          let isActive = pathname === item.href
          
          if (item.href === "/") {
             isActive = pathname === "/"
          } else if (item.href === "/projetos") {
             // Projects is active if path starts with /projetos BUT is not /projetos/feed
             isActive = pathname.startsWith("/projetos") && !pathname.startsWith("/projetos/feed")
          } else if (item.href !== "/dashboard" && pathname.startsWith(item.href)) {
             // General prefix match for others (like /financeiro)
             isActive = true
          } else if (item.href === "/dashboard" && pathname === "/dashboard") {
             isActive = true
          }

          const active = isActive

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center gap-1 px-1 border-t-2 transition-colors",
                active 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

