import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = buildMetadata({
  title: "Crear cuenta",
  description: "Crea tu cuenta gratis en Herramio: favoritos, historial y una experiencia sin anuncios con Pro.",
  path: "/registro",
});

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (user) redirect("/cuenta");

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/registro", label: "Crear cuenta" }]} />
      <div className="mx-auto mt-6 max-w-sm">
        <h1 className="text-3xl font-bold text-slate-900">Crea tu cuenta gratis</h1>
        <p className="mt-2 text-slate-500">Guarda favoritos, revisa tu historial y descubre Pro cuando quieras.</p>
        <Card className="mt-8 p-6">
          <SignupForm />
        </Card>
      </div>
    </div>
  );
}
