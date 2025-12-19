
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, Settings, Sparkles, ChartNoAxesCombined, Map as MapIcon, Search } from "lucide-react";
import { UserNav } from "@/components/layout/user-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/lib/permissions";

interface AppSidebarProps {
  mode?: "desktop" | "mobile"
  className?: string
  onNavigate?: () => void
}

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: Permission;
}

export function AppSidebar({ mode = "desktop", className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname()
  const { can } = usePermissions()

  const allNavItems: NavItemConfig[] = [
    { href: "/", label: "Mapa", icon: MapIcon },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiredPermission: "view:dashboard" },
    { href: "/projetos", label: "Projetos", icon: FolderOpen },
    { href: "/financeiro", label: "Financeiro", icon: ChartNoAxesCombined, requiredPermission: "view:financeiro" },
    { href: "/aseec-ia", label: "aseecIA", icon: Sparkles, requiredPermission: "view:aseecia" },
    { href: "/configuracoes", label: "Configurações", icon: Settings, requiredPermission: "view:settings" },
  ]

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    if (!item.requiredPermission) return true;
    return can(item.requiredPermission);
  });

  const isDesktop = mode === "desktop"

  return (
    <aside 
      className={cn(
        "bg-background flex flex-col",
        isDesktop ? "fixed inset-y-0 left-0 z-10 hidden w-64 border-r sm:flex" : "w-full h-full",
        className
      )}
    >
      {/* Logo - Only show in mobile mode or if explicitly desired, but usually desktop sidebar has it. 
          For mobile/map usage, the Sidebar parent might have a title, but we can keep the logo for consistency or hide it.
          Let's keep it consistent for now.
      */}
      <div className={cn("flex h-16 items-center justify-between px-6", isDesktop && "border-b")}>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg" onClick={onNavigate}>
          <Image 
            src="/logo-hebron.png" 
            alt="Hebron Logo" 
            width={120} 
            height={32} 
            className="h-8 w-auto object-contain brightness-0 dark:invert"
            priority
          />
        </Link>
        {pathname !== "/" && (
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Link href="/busca" title="Buscar">
                    <Search className="h-4 w-4" />
                </Link>
            </Button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2 px-4 py-6 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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

      {/* Footer: User & Theme (Integrated) */}
      <div className={cn("p-4", isDesktop && "border-t")}>
          <UserNav />
      </div>
    </aside>
  )
}

