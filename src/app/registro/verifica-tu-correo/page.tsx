import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo";
import { AnalyticsPageEvent } from "@/components/AnalyticsPageEvent";

export const metadata: Metadata = buildMetadata({
  title: "Verifica tu correo",
  description: "Confirma tu correo para activar tu cuenta de Herramio.",
  path: "/registro/verifica-tu-correo",
});

export default function VerificaTuCorreoPage() {
  return (
    <div className="container-page py-10">
      <AnalyticsPageEvent event="signup_completed" />
      <div className="mx-auto mt-6 max-w-sm text-center">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Revisa tu correo</h1>
          <p className="mt-2 text-slate-500">
            Te enviamos un enlace de confirmación. Ábrelo para activar tu cuenta.
          </p>
        </Card>
      </div>
    </div>
  );
}
