"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { InviteCodeForm } from "@/components/auth/invite-code-form"
import { SignUpForm } from "@/components/auth/signup-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

export default function AuthenticationPage() {
  const [view, setView] = useState<"login" | "invite" | "forgot_password" | "register">("login")
  const [inviteCode, setInviteCode] = useState<string>("")
  const [inviteCodeId, setInviteCodeId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

  const handleInviteSuccess = (code: string, codeId: string) => {
    setInviteCode(code)
    setInviteCodeId(codeId)
    setView("register")
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/configuracoes`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.")
    }

    setIsLoading(false)
  }

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-muted/40">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <Image
           src="/login-bg.jpg"
           alt="Fundo Hebron ASEEC"
           fill
           className="object-cover opacity-80"
           priority
           quality={75}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-20 flex items-center text-lg font-medium user-select-none">
          <Image
             src="/logo-hebron.png"
             alt="Logo Hebron ASEEC"
             width={180}
             height={60}
             className="h-auto w-auto object-contain"
             priority
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Instrumentos de Deus na transformação de vidas.&rdquo;
            </p>
            <footer className="text-sm">Histórico de Projetos Missionários</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          
          <div className="flex flex-col space-y-2 text-center lg:hidden">
            <Image
              src="/logo-hebron.png"
              alt="Logo Hebron ASEEC"
              width={128}
              height={42}
              className="mx-auto h-auto w-auto object-contain mb-4"
              priority
            />
          </div>

          {view === "login" && (
            <Card className="border-0 shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-card">
               <CardHeader className="space-y-1">
                 <CardTitle className="text-2xl font-bold tracking-tight">
                   Bem-vindo de volta
                 </CardTitle>
                 <CardDescription>
                   Entre com seu email e senha para acessar sua conta
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <LoginForm 
                   onForgotPassword={() => setView("forgot_password")} 
                   onInviteClick={() => setView("invite")}
                 />
               </CardContent>
               <CardFooter className="flex flex-wrap items-center justify-center gap-2">
                 {/* Footer content removed as requested */}
               </CardFooter>
            </Card>
          )}

          {view === "invite" && (
            <Card className="border-0 shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-card">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Código de Convite
                </CardTitle>
                <CardDescription>
                  Insira o código fornecido pelo administrador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteCodeForm 
                  onBack={() => setView("login")} 
                  onSuccess={handleInviteSuccess}
                />
              </CardContent>
            </Card>
          )}

          {view === "register" && (
            <Card className="border-0 shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-card">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Crie sua conta
                </CardTitle>
                <CardDescription>
                  Complete seu cadastro para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignUpForm 
                  onLoginClick={() => setView("login")} 
                  inviteCode={inviteCode}
                  inviteCodeId={inviteCodeId}
                />
              </CardContent>
            </Card>
          )}

          {view === "forgot_password" && (
             <Card className="border-0 shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-card">
               <CardHeader className="space-y-1">
                 <CardTitle className="text-2xl font-bold tracking-tight">
                   Recuperar senha
                 </CardTitle>
                 <CardDescription>
                   Digite seu email para receber um link de redefinição
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <form onSubmit={handleForgotPassword} className="grid gap-4">
                   <div className="grid gap-2">
                     <Label htmlFor="reset-email">Email</Label>
                     <Input
                        id="reset-email"
                        placeholder="nome@exemplo.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={isLoading}
                      />
                   </div>
                   <Button disabled={isLoading}>
                     {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                     Enviar link
                   </Button>
                 </form>
               </CardContent>
               <CardFooter>
                 <Button variant="link" className="w-full" onClick={() => setView("login")}>
                   Voltar para login
                 </Button>
               </CardFooter>
             </Card>
          )}

        </div>
      </div>
    </div>
  )
}
