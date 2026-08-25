import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = buildMetadata({
  title: "Actualizar contraseña",
  description: "Elige una nueva contraseña para tu cuenta de Herramio.",
  path: "/actualizar-contrasena",
});

export default async function ActualizarContrasenaPage() {
  // Only reachable with a valid session — Supabase establishes one via the
  // recovery link's /auth/callback exchange right before landing here.
  const user = await getCurrentUser();
  if (!user) redirect("/recuperar-contrasena");

  return (
    <div className="container-page py-10">
      <div className="mx-auto mt-6 max-w-sm">
        <h1 className="text-3xl font-bold text-slate-900">Elige una nueva contraseña</h1>
        <Card className="mt-8 p-6">
          <UpdatePasswordForm />
        </Card>
      </div>
    </div>
  );
}
