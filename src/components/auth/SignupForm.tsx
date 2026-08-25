"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { AnalyticsEvents } from "@/lib/analytics";

const initialState: AuthActionState = { error: null };

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} onSubmit={() => AnalyticsEvents.signupStarted()} className="space-y-4">
      <div>
        <Label htmlFor="signup-name">Nombre</Label>
        <Input id="signup-name" name="displayName" autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="signup-email">Correo electrónico</Label>
        <Input id="signup-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="signup-password">Contraseña</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1 text-xs text-slate-400">Mínimo 8 caracteres.</p>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton>Crear cuenta gratis</SubmitButton>
      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/iniciar-sesion" className="font-medium text-emerald-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
