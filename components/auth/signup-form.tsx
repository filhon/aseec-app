"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignUpFormProps {
  onLoginClick: () => void
}

export function SignUpForm({ onLoginClick }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  /* Removed state-based checkStrength and useEffect */
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
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Como você quer ser chamado?"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              disabled={isLoading}
              required
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
              disabled={isLoading}
              required
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
