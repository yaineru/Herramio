import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { RequestResetForm } from "@/components/auth/RequestResetForm";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Recuperar contraseña",
  description: "Recupera el acceso a tu cuenta de Herramio.",
  path: "/recuperar-contrasena",
});

export default function RecuperarContrasenaPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/recuperar-contrasena", label: "Recuperar contraseña" }]} />
      <div className="mx-auto mt-6 max-w-sm">
        <h1 className="text-3xl font-bold text-slate-900">Recuperar contraseña</h1>
        <p className="mt-2 text-slate-500">Te enviaremos un enlace para restablecerla.</p>
        <Card className="mt-8 p-6">
          <RequestResetForm />
        </Card>
      </div>
    </div>
  );
}
