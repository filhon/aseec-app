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
import { validateInviteCode } from "@/lib/actions/auth"
import { toast } from "sonner"

interface InviteCodeFormProps {
  onBack: () => void
  onSuccess: (code: string, codeId: string) => void
}

export function InviteCodeForm({ onBack, onSuccess }: InviteCodeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState("")

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    const result = await validateInviteCode(value)

    if (!result.success) {
      setIsLoading(false)
      toast.error(result.error)
      return
    }

    toast.success("Código válido! Prossiga com o cadastro.")
    onSuccess(result.code!, result.codeId!)
    setIsLoading(false)
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
              onChange={(value) => setValue(value.toUpperCase())}
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
            Validar código
          </Button>
        </div>
      </form>
      
      <Button variant="ghost" onClick={onBack} disabled={isLoading}>
        Voltar para login
      </Button>
    </div>
  )
}
