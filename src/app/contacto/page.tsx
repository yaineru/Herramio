import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contacto",
  description: `Escríbenos si tienes dudas, sugerencias o encontraste un problema en ${SITE.name}.`,
  path: "/contacto",
});

export default function ContactoPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/contacto", label: "Contacto" }]} />
      <div className="mx-auto mt-6 max-w-lg">
        <h1 className="text-3xl font-bold text-slate-900">Contacto</h1>
        <p className="mt-2 text-slate-500">
          ¿Tienes dudas, sugerencias o encontraste un error? Escríbenos.
        </p>
        <Card className="mt-8 p-6">
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
