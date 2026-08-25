import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Revisa tu correo",
  description: "Enlace de recuperación de contraseña enviado.",
  path: "/recuperar-contrasena/revisa-tu-correo",
});

export default function RevisaTuCorreoPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto mt-6 max-w-sm text-center">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Revisa tu correo</h1>
          <p className="mt-2 text-slate-500">
            Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña.
          </p>
        </Card>
      </div>
    </div>
  );
}
