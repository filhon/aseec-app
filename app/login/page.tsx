"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

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
import { SignUpForm } from "@/components/auth/signup-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function AuthenticationPage() {
  const [view, setView] = useState<"login" | "signup" | "forgot_password">("login")

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
                 <LoginForm onForgotPassword={() => setView("forgot_password")} />
               </CardContent>
               <CardFooter className="flex flex-wrap items-center justify-center gap-2">
                 <div className="text-sm text-muted-foreground">
                   Não tem uma conta?{" "}
                   <Button variant="link" className="p-0 h-auto" onClick={() => setView("signup")}>
                     Criar conta
                   </Button>
                 </div>
               </CardFooter>
            </Card>
          )}

          {view === "signup" && (
            <Card className="border-0 shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-card">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Crie sua conta
                </CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para começar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignUpForm onLoginClick={() => setView("login")} />
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                Ao clicar em criar conta, você concorda com nossos{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Termos de Serviço
                </Link>{" "}
                e{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Política de Privacidade
                </Link>
                .
              </CardFooter>
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
                 <div className="grid gap-4">
                   <div className="grid gap-2">
                     <Label htmlFor="reset-email">Email</Label>
                     <Input
                        id="reset-email"
                        placeholder="nome@exemplo.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        required
                      />
                   </div>
                   <Button>Enviar link</Button>
                 </div>
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
