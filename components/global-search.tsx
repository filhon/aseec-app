"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  LayoutDashboard,
  FolderOpen,
  Map,
  Sparkles,
  MapPin,
  Building2,
  Users,
  Search
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  // Mock Data for Autocomplete
  const projects = [
    { title: "Projeto Amazônia", id: "1", type: "Missionário" },
    { title: "Construção de Poços", id: "2", type: "Humanitário" },
    { title: "Apoio a Refugiados", id: "3", type: "Social" },
  ]

  const institutions = [
    { name: "Igreja Local de Manaus", id: "inst-1" },
    { name: "ONG Esperança", id: "inst-2" },
  ]

  const people = [
    { name: "João Silva", role: "Missionário" },
    { name: "Maria Santos", role: "Coordenadora" },
  ]

  const locations = [
    { name: "Brasil", type: "País" },
    { name: "Angola", type: "País" },
    { name: "São Paulo", type: "Estado" },
  ]

  const handleSearchNavigation = (query: string, type: string) => {
      const params = new URLSearchParams()
      params.set("q", query)
      params.set("type", type)
      router.push(`/busca?${params.toString()}`)
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando ou busque..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          <CommandGroup heading="Páginas">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/projetos"))}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Projetos</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/financeiro"))}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Financeiro</span>
            </CommandItem>
             <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
            >
              <Map className="mr-2 h-4 w-4" />
              <span>Mapa</span>
            </CommandItem>
             <CommandItem
              onSelect={() => runCommand(() => router.push("/aseec-ia"))}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>aseecIA</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/configuracoes"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />

          <CommandGroup heading="Projetos">
            {projects.map((project) => (
                <CommandItem
                    key={project.id}
                    onSelect={() => runCommand(() => handleSearchNavigation(project.title, 'projeto'))}
                >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>{project.title}</span>
                </CommandItem>
            ))}
          </CommandGroup>

           <CommandGroup heading="Instituições">
            {institutions.map((inst) => (
                <CommandItem
                    key={inst.id}
                    onSelect={() => runCommand(() => handleSearchNavigation(inst.name, 'instituicao'))}
                >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>{inst.name}</span>
                </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Pessoas">
            {people.map((person, idx) => (
                <CommandItem
                    key={idx}
                    onSelect={() => runCommand(() => handleSearchNavigation(person.name, 'pessoa'))}
                >
                    <Users className="mr-2 h-4 w-4" />
                    <span>{person.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({person.role})</span>
                </CommandItem>
            ))}
          </CommandGroup>

           <CommandGroup heading="Locais">
            {locations.map((loc, idx) => (
                <CommandItem
                    key={idx}
                    onSelect={() => runCommand(() => handleSearchNavigation(loc.name, 'local'))}
                >
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{loc.name}</span>
                     <span className="ml-2 text-xs text-muted-foreground">({loc.type})</span>
                </CommandItem>
            ))}
          </CommandGroup>

        </CommandList>
      </CommandDialog>
    </>
  )
}
