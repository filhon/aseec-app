"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for error in URL params
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      toast.error("Link de recuperação inválido ou expirado")
    }
  }, [searchParams])

  const getStrength = (pass: string) => {
    let score = 0
    if (!pass) return 0

    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    return score
  }

  const strength = getStrength(password)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (strength < 2) {
      toast.error("A senha deve ter pelo menos 8 caracteres com letras maiúsculas e números")
      return
    }

    setIsLoading(true)

    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setIsLoading(false)
      toast.error(error.message)
      return
    }

    setIsSuccess(true)
    toast.success("Senha atualizada com sucesso!")
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <Card className="border-0 shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isSuccess ? "Senha Atualizada!" : "Nova Senha"}
        </CardTitle>
        <CardDescription>
          {isSuccess 
            ? "Sua senha foi alterada com sucesso" 
            : "Digite sua nova senha para acessar o sistema"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-sm text-muted-foreground text-center">
              Você será redirecionado para o dashboard em instantes...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300 ease-in-out",
                      strength === 0 && "w-0",
                      strength === 1 && "w-1/4 bg-red-500",
                      strength === 2 && "w-2/4 bg-orange-500",
                      strength === 3 && "w-3/4 bg-yellow-500",
                      strength === 4 && "w-full bg-green-500"
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {strength < 2 && "Senha fraca"}
                  {strength === 2 && "Senha média"}
                  {strength === 3 && "Senha boa"}
                  {strength === 4 && "Senha forte"}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="new-password"
                disabled={isLoading}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">As senhas não coincidem</p>
              )}
            </div>

            <Button disabled={isLoading || password !== confirmPassword}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar Senha
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="link" className="w-full" asChild>
          <Link href="/login">Voltar para login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
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

          <Suspense fallback={
            <Card className="border-0 shadow-none sm:border sm:shadow-lg bg-transparent sm:bg-card">
              <CardContent className="flex items-center justify-center py-8">
                <Icons.spinner className="h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          }>
            <ResetPasswordForm />
          </Suspense>

        </div>
      </div>
    </div>
  )
}
