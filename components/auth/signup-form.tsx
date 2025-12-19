"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { markInviteCodeAsUsed } from "@/lib/actions/auth"
import { toast } from "sonner"

interface SignUpFormProps {
  onLoginClick: () => void
  inviteCode?: string
  inviteCodeId?: string
  initialName?: string
  initialEmail?: string
}

export function SignUpForm({ onLoginClick, inviteCode, inviteCodeId, initialName, initialEmail }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialName || "")
  const [email, setEmail] = useState(initialEmail || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        // Skip email confirmation for invited users by not setting emailRedirectTo
        ...(inviteCodeId ? {} : { emailRedirectTo: `${window.location.origin}/auth/callback` }),
      },
    })

    if (error) {
      setIsLoading(false)
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado")
      } else {
        toast.error(error.message)
      }
      return
    }

    // Check if email confirmation is required
    if (data.user?.identities?.length === 0) {
      toast.error("Este email já está cadastrado")
      setIsLoading(false)
      return
    }

    // Mark invite code as used (do this after successful signup)
    if (inviteCodeId) {
      const markResult = await markInviteCodeAsUsed(inviteCodeId)
      if (!markResult.success) {
        console.error("Failed to mark invite code as used:", markResult.error)
      }
    }

    // For invited users or auto-confirmed users, redirect to dashboard
    if (inviteCodeId || data.session) {
      toast.success("Conta criada com sucesso!")
      router.push("/")
      router.refresh()
    } else {
      // Email confirmation required (only for non-invited users)
      toast.success("Conta criada! Verifique seu email para confirmar o cadastro.")
      onLoginClick()
    }

    setIsLoading(false)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {initialName && (
            <div className="text-center mb-2">
              <h3 className="font-semibold text-lg">Olá, {initialName}!</h3>
              <p className="text-sm text-muted-foreground">Verifique o seu e-mail e crie uma senha.</p>
            </div>
          )}

          {inviteCode && !initialName && (
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Código de convite</p>
              <p className="font-mono font-semibold">{inviteCode}</p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Como você quer ser chamado?"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              disabled={isLoading || !!initialName}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="nome@exemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || !!initialEmail}
              readOnly={!!initialEmail}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
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
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type={showConfirmPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="new-password"
                disabled={isLoading}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
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

          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Criar conta
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Já tem uma conta?
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading} onClick={onLoginClick}>
        Fazer login
      </Button>
    </div>
  )
}
