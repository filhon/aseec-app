"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/use-admin";
import { NewProjectForm } from "@/components/projects/new-project-form";
import { toast } from "sonner";

export default function NewProjectPage() {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  // Protect route
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Acesso negado", {
        description: "Você precisa ser administrador para acessar esta página.",
      });
      router.push("/projetos");
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Novo Projeto
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie um projeto manualmente e vincule ao financeiro.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        <NewProjectForm />
      </div>
    </div>
  );
}
