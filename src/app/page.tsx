import Link from "next/link";
import type { Metadata } from "next";
import { Zap, ShieldCheck, Smartphone, Infinity as InfinityIcon, ArrowRight } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { ContinueWhereYouLeftOff } from "@/components/marketing/ContinueWhereYouLeftOff";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { CategoryHub } from "@/components/marketing/CategoryHub";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { FAQ } from "@/components/marketing/FAQ";
import { Reveal } from "@/components/marketing/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Button } from "@/components/ui/Button";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd, softwareApplicationSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools/registry";
import { BLOG_POSTS } from "@/lib/blog/posts";

export const metadata: Metadata = buildMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: "/",
});

const POPULAR_IDS = [
  "qr-whatsapp",
  "qr-wifi",
  "imagen-comprimir",
  "calc-porcentaje",
  "pdf-unir",
  "texto-generador-contrasenas",
  "dev-json-formatter",
  "productividad-temporizador",
  "conv-unidades",
];
const POPULAR_TOOLS = POPULAR_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(
  (t): t is (typeof TOOLS)[number] => Boolean(t),
);

const BENEFITS = [
  {
    icon: Zap,
    title: "Rápido de verdad",
    text: "Cada herramienta corre en tu navegador: sin esperas, sin subir archivos a un servidor cuando no hace falta.",
  },
  {
    icon: ShieldCheck,
    title: "Sin registro",
    text: "No pedimos cuenta ni datos personales para usar ninguna herramienta gratuita.",
  },
  {
    icon: Smartphone,
    title: "Funciona en el celular",
    text: "Pensado mobile-first: usa cualquier herramienta desde tu teléfono sin fricción.",
  },
  {
    icon: InfinityIcon,
    title: "Sin límites de uso",
    text: "Usa las herramientas las veces que necesites, sin cuotas ni marcas de agua.",
  },
];

const FAQ_ITEMS = [
  {
    question: "¿Herramio es realmente gratis?",
    answer:
      "Sí. Todas las herramientas disponibles hoy son gratuitas y no requieren registro. El sitio se sostiene con publicidad no intrusiva.",
  },
  {
    question: "¿Qué herramientas hay disponibles ahora?",
    answer:
      `Hoy Herramio ofrece ${TOOLS.length} herramientas en 8 categorías: QR, PDF, imágenes, calculadoras, convertidores, texto, desarrolladores y productividad — y seguimos sumando más.`,
  },
  {
    question: "¿Puedo pedir una herramienta que todavía no existe?",
    answer:
      "Sí — busca lo que necesitas con el buscador (Ctrl/Cmd + K) y, si no existe, verás la opción de contarnos qué te gustaría que construyéramos.",
  },
  {
    question: "¿Guardan la información que proceso en las herramientas?",
    answer:
      "No. La generación de códigos QR ocurre en tu propio navegador; no almacenamos ese contenido en un servidor.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={softwareApplicationSchema({
          name: SITE.name,
          description: SITE.description,
          url: SITE.url,
        })}
      />

      <Hero />

      <ContinueWhereYouLeftOff />

      <section className="container-page py-16">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Navegación</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900">¿Qué quieres hacer?</h2>
            </div>
            <p className="hidden text-sm text-slate-500 md:block">Explora por categoría y encuentra la herramienta adecuada en segundos.</p>
          </div>
        </Reveal>
        <Reveal delay={100} className="mt-8">
          <CategoryGrid />
        </Reveal>
      </section>

      <section className="container-page pb-16">
        <Reveal>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 elevation-3 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Producto estrella</p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-900">Originalidad, diseñada como un producto serio.</h2>
                <p className="mt-3 max-w-xl text-base text-slate-600">
                  Revisa coincidencias, citas y referencias antes de entregar un trabajo. La experiencia está pensada para interpretación humana, transparencia y claridad.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/originalidad">
                    <Button size="md" variant="secondary">Ver Originalidad</Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Resumen</span>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">14.2%</span>
                </div>
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-white p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Coincidencias</div>
                    <div className="mt-2 font-semibold text-slate-900">6 fuentes relevantes</div>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Citas</div>
                    <div className="mt-2 font-semibold text-slate-900">31 correctamente atribuidas</div>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Estado</div>
                    <div className="mt-2 font-semibold text-slate-900">Requiere revisión humana</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-6">
        <AdSlot placement="below-generator" />
      </section>

      <section className="container-page py-10">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Herramientas populares</h2>
              <p className="mt-1 text-slate-500">Una muestra de lo que puedes hacer en cada categoría.</p>
            </div>
            <Link href="/herramientas" className="hidden shrink-0 text-sm font-medium text-slate-900 hover:underline sm:block">
              Ver todas →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <ToolGrid tools={POPULAR_TOOLS} />
        </Reveal>
      </section>

      <section className="container-page py-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-slate-900">Todo en un solo lugar</h2>
          <p className="mt-1 text-slate-500">Pasa el mouse por una categoría para explorarla.</p>
        </Reveal>
        <Reveal delay={100} className="mt-8">
          <CategoryHub />
        </Reveal>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <Reveal>
            <h2 className="text-2xl font-bold text-slate-900">Por qué usar {SITE.name}</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <b.icon className="h-5 w-5 text-slate-900" strokeWidth={1.75} />
                  <h3 className="mt-3 font-semibold text-slate-900">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <Reveal>
          <FAQ items={FAQ_ITEMS} />
        </Reveal>
      </section>

      <section className="container-page pb-16">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Del blog</h2>
            <Link href="/blog" className="text-sm font-medium text-slate-900 hover:underline">
              Ver todos los artículos →
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {BLOG_POSTS.slice(0, 3).map((post, i) => (
            <Reveal key={post.slug} delay={i * 80}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-slate-900">{post.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <Reveal>
          <div className="rounded-3xl bg-slate-900 px-8 py-14 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">¿Listo para resolverlo en segundos?</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-300">
              {TOOLS.length} herramientas gratis, sin registro, directamente en tu navegador.
            </p>
            <div className="mt-7 flex justify-center">
              <MagneticButton>
                <Link href="/herramientas">
                  <Button size="lg" variant="primary">
                    Ver todas las herramientas <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-page pb-20">
        <AdSlot placement="footer" />
      </section>
    </>
  );
}
