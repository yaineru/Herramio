import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Lightbulb, ShieldQuestion, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contacto",
  description: `Escríbenos si tienes dudas, sugerencias o encontraste un problema en ${SITE.name}. Te contamos qué información nos ayuda a resolverlo más rápido.`,
  path: "/contacto",
});

/**
 * Two channels on purpose.
 *
 * The form builds a mailto: link, which depends on the visitor having a
 * mail client configured — on a phone that is usually fine, on a shared
 * desktop it often is not. The feedback button writes straight to our
 * database and works regardless, so it is offered alongside rather than
 * hidden behind the form.
 */

const REASONS = [
  {
    icon: Bug,
    title: "Algo no funciona",
    body: "Cuéntanos qué herramienta usaste, qué esperabas y qué pasó en su lugar. Si el problema fue con un archivo, el formato y el tamaño aproximado ayudan mucho: casi todos los fallos que recibimos dependen del archivo concreto.",
  },
  {
    icon: Lightbulb,
    title: "Falta una herramienta",
    body: "Describe la tarea, no la herramienta. Saber qué intentas resolver nos dice más que un nombre, y a veces ya existe algo que lo hace y no lo encontraste — lo cual también es un problema que queremos arreglar.",
  },
  {
    icon: ShieldQuestion,
    title: "Privacidad o datos",
    body: "Las herramientas gratuitas procesan todo en tu navegador y no envían tus archivos a ningún servidor. Si tu duda es sobre qué guardamos exactamente, está detallado en la página de privacidad; si algo no queda claro allí, escríbenos y lo corregimos.",
  },
];

export default function ContactoPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/contacto", label: "Contacto" }]} />

      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">Contacto</h1>
        <p className="mt-3 text-slate-600">
          Herramio lo mantiene un equipo pequeño, así que los mensajes los lee una persona. Cuanto más concreto sea
          el tuyo, antes podemos hacer algo con él.
        </p>

        <section className="mt-8 space-y-4" aria-labelledby="motivos-heading">
          <h2 id="motivos-heading" className="text-lg font-semibold text-slate-900">
            Qué contarnos según el caso
          </h2>
          {REASONS.map((reason) => (
            <div key={reason.title} className="flex gap-3.5 rounded-xl border border-slate-200 bg-white p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <reason.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{reason.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{reason.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8" aria-labelledby="antes-heading">
          <h2 id="antes-heading" className="text-lg font-semibold text-slate-900">
            Puede que ya esté respondido
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Antes de escribir, estas páginas resuelven la mayoría de las dudas que nos llegan:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/faq" className="font-medium text-emerald-700 hover:underline">
                Preguntas frecuentes
              </Link>{" "}
              <span className="text-slate-600">— si es gratis, si hay que registrarse, qué se guarda.</span>
            </li>
            <li>
              <Link href="/privacidad" className="font-medium text-emerald-700 hover:underline">
                Privacidad
              </Link>{" "}
              <span className="text-slate-600">— qué datos se procesan y dónde.</span>
            </li>
            <li>
              <Link href="/sobre-nosotros" className="font-medium text-emerald-700 hover:underline">
                Sobre nosotros
              </Link>{" "}
              <span className="text-slate-600">— quién está detrás de Herramio y por qué existe.</span>
            </li>
            <li>
              <Link href="/herramientas" className="font-medium text-emerald-700 hover:underline">
                Todas las herramientas
              </Link>{" "}
              <span className="text-slate-600">— por si lo que buscas ya existe.</span>
            </li>
          </ul>
        </section>

        <Card className="mt-8 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Mail className="h-4.5 w-4.5 text-slate-500" aria-hidden="true" />
            Escríbenos
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            El mensaje llega directamente a nuestro panel — no necesitas tener configurado un cliente de correo, ni
            salir de esta página.
          </p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </Card>

        <p className="mt-6 text-sm leading-relaxed text-slate-600">
          No publicamos una dirección de correo porque preferimos un canal que podamos garantizar: este formulario
          guarda tu mensaje y lo leemos desde el panel de administración. Respondemos al correo que nos dejes, aunque
          no prometemos un plazo concreto — somos pocos y preferimos no comprometernos a algo que no podemos
          asegurar.
        </p>
      </div>

      {/* Feedback stays available and stays a different thing: this page is
          for "necesito comunicarme", the widget is for "esto podría
          mejorar". */}
      <FeedbackWidget />
    </div>
  );
}
