"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: AuthActionState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input id="login-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Contraseña</Label>
          <Link href="/recuperar-contrasena" className="mb-1.5 text-xs font-medium text-emerald-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton>Iniciar sesión</SubmitButton>
      <p className="text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-emerald-600 hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
