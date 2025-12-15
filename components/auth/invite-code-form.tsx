"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

interface InviteCodeFormProps {
  onBack: () => void
  onSuccess: (code: string) => void
}

export function InviteCodeForm({ onBack, onSuccess = () => {} }: InviteCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState("")

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Mock validation success
      onSuccess(value)
    }, 1500)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2 justify-center text-center">
            <Label htmlFor="otp" className="mb-2">Digite o código de convite</Label>
            <InputOTP
              maxLength={6}
              value={value}
              onChange={(value) => setValue(value)}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground mt-2">
              Peça o código ao administrador
            </p>
          </div>
          
          <Button disabled={isLoading || value.length < 6}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Entrar
          </Button>
        </div>
      </form>
      
      <Button variant="ghost" onClick={onBack} disabled={isLoading}>
        Voltar para login
      </Button>
    </div>
  )
}
