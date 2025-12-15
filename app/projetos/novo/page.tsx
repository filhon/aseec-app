"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { ProjectSyncList } from "@/components/projects/project-sync-list"
import { NewProjectForm } from "@/components/projects/new-project-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, RefreshCw, Plus } from "lucide-react"
import { toast } from "sonner"

export default function NewProjectPage() {
    const { isAdmin, loading } = useAdmin()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("sync")

    // Protect route
    useEffect(() => {
        if (!loading && !isAdmin) {
            toast.error("Acesso negado", {
                description: "Você precisa ser administrador para acessar esta página."
            })
            router.push("/projetos")
        }
    }, [isAdmin, loading, router])

    if (loading || !isAdmin) {
        return null // Or a loading spinner
    }

    return (
        <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight text-primary">Novo Projeto</h1>
                    <p className="text-muted-foreground mt-1">
                        Importe projetos do sistema financeiro ou crie manualmente.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                            <TabsTrigger value="sync" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Importar
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Criação Manual
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <TabsContent value="sync" className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800 mb-6">
                            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Sincronização Automática
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                Esta é a forma recomendada de adicionar projetos. Os dados são trazidos diretamente do sistema financeiro,
                                garantindo que os valores de investimento e aprovação estejam sempre corretos.
                            </p>
                        </div>
                        <ProjectSyncList />
                    </TabsContent>

                    <TabsContent value="manual">
                        <NewProjectForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
