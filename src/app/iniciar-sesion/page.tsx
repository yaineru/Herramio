import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth/current-user";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = buildMetadata({
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta de Herramio.",
  path: "/iniciar-sesion",
});

export default async function IniciarSesionPage({ searchParams }: PageProps<"/iniciar-sesion">) {
  const user = await getCurrentUser();
  const next = safeRedirectPath((await searchParams).next, "/cuenta");
  if (user) redirect(next);

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/iniciar-sesion", label: "Iniciar sesión" }]} />
      <div className="mx-auto mt-6 max-w-sm">
        <h1 className="text-3xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-slate-500">Bienvenido de nuevo.</p>
        <Card className="mt-8 p-6">
          <LoginForm next={next} />
        </Card>
      </div>
    </div>
  );
}
