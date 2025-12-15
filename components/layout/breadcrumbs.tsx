"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { useBreadcrumbStore } from "@/stores/use-breadcrumb-store"

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  projetos: "Projetos",
  financeiro: "Financeiro",
  "contas-pagar": "Contas a Pagar",
  "contas-receber": "Contas a Receber",
  configuracoes: "Configurações",
  cadastros: "Cadastros",
  entidades: "Entidades",
  "centros-custo": "Centros de Custo",
  usuarios: "Usuários",
  mapa: "Mapa",
  "aseec-ia": "ASEEC IA",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter((item) => item !== "")
  const { labels } = useBreadcrumbStore()

  // Function to format label
  const getLabel = (segment: string) => {
    // 1. Check dynamic store
    if (labels[segment]) {
        return labels[segment]
    }
    // 2. Check static map
    if (routeMap[segment]) {
      return routeMap[segment]
    }
    // Simple fallback: capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  // If we are on home page or empty path, or just a root section (e.g. /dashboard), hide breadcrumb to avoid "lost text" look
  if (segments.length <= 1) return null

  return (
    <Breadcrumb className="mb-4 hidden md:flex">
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`
          const isLast = index === segments.length - 1
          const label = getLabel(segment)

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
