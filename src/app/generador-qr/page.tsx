import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { FAQ } from "@/components/marketing/FAQ";
import { AdSlot } from "@/components/ads/AdSlot";
import { UniversalQRGenerator } from "@/components/qr/UniversalQRGenerator";
import { JsonLd, faqPageSchema, howToSchema, softwareApplicationSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Generador de códigos QR gratis",
  description:
    "Genera códigos QR para enlaces, WiFi, WhatsApp, contacto o menús, y descárgalos en PNG o SVG. Sin registro, sin marca de agua y sin límite.",
  path: "/generador-qr",
});

/**
 * The all-in-one QR page.
 *
 * It used to be an H1, two sentences, the generator and four FAQ entries
 * of which three were the generic ones that appear across the whole site
 * ("do I need an account?"). Measured at 241 words with zero internal
 * links in its own content — the weakest page on the site despite being
 * one of the most important.
 *
 * What it was missing was not length. It was the two questions people
 * actually arrive with: which type of code do I need, and how big do I
 * print it. Both are answered here, and the type list doubles as real
 * navigation to the 14 dedicated QR pages.
 */

const QR_TYPES = [
  { task: "Llevar a alguien a una página web o a un formulario", tool: "QR de enlace", href: "/qr-url" },
  { task: "Que te escriban por WhatsApp sin guardar tu número", tool: "QR de WhatsApp", href: "/qr-whatsapp" },
  { task: "Dar acceso a tu WiFi sin dictar la contraseña", tool: "QR de WiFi", href: "/qr-wifi" },
  { task: "Poner la carta en la mesa de un restaurante", tool: "QR para menú", href: "/qr-menu" },
  { task: "Compartir tus datos en una tarjeta impresa", tool: "QR de contacto (vCard)", href: "/qr-vcard" },
  { task: "Que encuentren tu local en el mapa", tool: "QR de Google Maps", href: "/qr-google-maps" },
  { task: "Que te llamen o te escriban un SMS", tool: "QR de teléfono", href: "/qr-telefono" },
  { task: "Enviarte un correo con asunto ya escrito", tool: "QR de email", href: "/qr-email" },
  { task: "Ganar seguidores desde un cartel", tool: "QR de Instagram", href: "/qr-instagram" },
  { task: "Saber qué contiene un QR que te dieron", tool: "Lector de códigos QR", href: "/qr-lector" },
];

const STEPS = [
  {
    title: "Elige el tipo",
    text: "Selecciona arriba según lo que quieras que ocurra al escanear: abrir una web, conectar a una red, iniciar un chat.",
  },
  {
    title: "Rellena los datos",
    text: "Cada tipo arma por dentro el formato que esperan los teléfonos, así que no necesitas conocer la sintaxis.",
  },
  {
    title: "Ajusta el diseño",
    text: "Cambia color y tamaño si va sobre un fondo concreto, pero mantén el contraste: un código claro sobre fondo claro no se lee.",
  },
  {
    title: "Descarga en el formato correcto",
    text: "PNG para pantallas y mensajería; SVG si va a imprenta o a un cartel grande, porque es vectorial y no se pixela.",
  },
  {
    title: "Pruébalo antes de imprimir",
    text: "Escanéalo con más de un teléfono. Es el paso que la gente se salta y el que evita reimprimir cien copias.",
  },
];

const FAQ_ITEMS = [
  {
    question: "¿De qué tamaño debo imprimir el código?",
    answer:
      "La regla práctica es 1 cm de lado por cada 10 cm de distancia de lectura. Para una mesa (unos 30 cm) bastan 3 cm; para un cartel que se lee a 2 metros, unos 20 cm. Si vas a imprimir grande, descarga el SVG: al ser vectorial no se pixela por mucho que lo amplíes.",
  },
  {
    question: "¿Puedo cambiar a dónde apunta el código después de imprimirlo?",
    answer:
      "No. Estos códigos son estáticos: el destino va codificado dentro de la propia imagen, no en un servidor nuestro. Eso tiene una ventaja —siguen funcionando aunque Herramio deje de existir— y una desventaja: si cambia la dirección, hay que generar e imprimir uno nuevo. Si prevés cambios, apunta el QR a una URL corta que tú controles y cambia el destino allí.",
  },
  {
    question: "¿Por qué mi QR de WiFi no funciona en algunos teléfonos?",
    answer:
      "Android y iOS leen el formato de WiFi de forma nativa desde la cámara, pero algunas apps lectoras genéricas solo muestran el texto en crudo en vez de ofrecer la conexión. También conviene elegir bien el tipo de cifrado: si la red es WPA2 y eliges «sin contraseña», el código se genera pero no conecta.",
  },
  {
    question: "¿PNG o SVG?",
    answer:
      "PNG para lo que se ve en pantalla: WhatsApp, correo, una presentación. SVG para imprenta, vinilo o cualquier cosa que se amplíe, porque es vectorial y se mantiene nítido a cualquier tamaño. Ambos se descargan sin marca de agua.",
  },
  {
    question: "¿Cuánta información cabe en un código QR?",
    answer:
      "Bastante, pero cuanta más metas, más denso sale el patrón y peor se lee impreso en tamaño pequeño. Una vCard con todos los campos rellenos genera un código visiblemente más apretado que un enlace corto. Si el resultado se ve muy denso, acorta el contenido o imprímelo más grande.",
  },
  {
    question: "¿Se suben mis datos a un servidor?",
    answer:
      "No. El código se genera en tu navegador y ni el contenido ni la imagen salen de tu dispositivo. Puedes comprobarlo desconectando internet después de cargar la página: el generador sigue funcionando.",
  },
];

export default function GeneradorQrPage() {
  return (
    <div className="container-page py-10">
      <JsonLd
        data={softwareApplicationSchema({
          name: "Generador de códigos QR",
          description: SITE.description,
          url: `${SITE.url}/generador-qr`,
        })}
      />
      <JsonLd data={faqPageSchema(FAQ_ITEMS)} />
      <JsonLd
        data={howToSchema({
          name: "Cómo crear un código QR",
          description: "Pasos para generar, personalizar y descargar un código QR listo para imprimir o compartir.",
          steps: STEPS,
        })}
      />

      <Breadcrumbs items={[{ href: "/generador-qr", label: "Generador QR" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">
          Generador de códigos QR gratis
        </h1>
        <p className="mt-3 text-slate-600">
          Elige el tipo de código que necesitas, completa los datos y descárgalo en PNG o SVG. Sin registro, sin
          marca de agua y sin límite de descargas — todo se genera en tu propio navegador.
        </p>
      </div>

      <div className="mt-8">
        <UniversalQRGenerator />
      </div>

      {/* Task -> dedicated tool. The generator above does all of these, but
          someone who knows exactly what they need is better served by the
          page written for that case, and this is where the internal links
          to the 14 QR tools genuinely belong. */}
      <section className="mt-14" aria-labelledby="tipos-heading">
        <h2 id="tipos-heading" className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
          ¿Qué tipo de código necesitas?
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          El generador de arriba los cubre todos. Si ya sabes cuál quieres, cada tipo tiene su propia página con las
          indicaciones concretas de ese caso.
        </p>
        <ul className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {QR_TYPES.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{item.task}</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                  {item.tool}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          <Link href="/categoria/qr" className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Ver las 14 herramientas de QR
          </Link>
        </p>
      </section>

      <section className="mt-14" aria-labelledby="pasos-heading">
        <h2 id="pasos-heading" className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
          Cómo crear tu código, paso a paso
        </h2>
        <ol className="mt-5 space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3.5">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-0.5 text-[15px] leading-relaxed text-slate-700">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="my-12">
        <AdSlot placement="below-generator" />
      </div>

      <div className="mx-auto max-w-2xl">
        <FAQ items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
