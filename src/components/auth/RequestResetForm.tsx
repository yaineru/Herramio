"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type AuthActionState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: AuthActionState = { error: null };

export function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="reset-email">Correo electrónico</Label>
        <Input id="reset-email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton>Enviar enlace de recuperación</SubmitButton>
    </form>
  );
}
