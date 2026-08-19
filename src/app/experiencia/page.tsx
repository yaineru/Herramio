import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroBackground } from "@/components/marketing/HeroBackground";
import { FloatingToolverse } from "@/components/marketing/FloatingToolverse";
import { FloatingToolCard } from "@/components/marketing/FloatingToolCard";
import { CategoryHub } from "@/components/marketing/CategoryHub";
import { Reveal } from "@/components/marketing/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tools/registry";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "La experiencia Herramio",
  description: `Explora el universo de las ${TOOLS.length} herramientas de Herramio en una página interactiva: mueve el mouse, pasa por encima de una herramienta y entra directo a usarla.`,
  path: "/experiencia",
});

const UNIVERSE_IDS = [
  "qr-whatsapp",
  "pdf-unir",
  "imagen-comprimir",
  "calc-porcentaje",
  "conv-moneda",
  "texto-generador-contrasenas",
  "dev-hash-generator",
  "productividad-sorteador",
  "qr-lector",
  "dev-regex-tester",
  "calc-imc",
  "productividad-temporizador",
];
const UNIVERSE_TOOLS = UNIVERSE_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(
  (t): t is (typeof TOOLS)[number] => Boolean(t),
);

export default function ExperienciaPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <HeroBackground />
        <div className="container-page relative flex flex-col items-center py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" /> La experiencia {SITE.name}
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Un universo de herramientas, a un clic de distancia.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-500">
            Mueve el mouse, pasa por encima de una herramienta y entra directo a usarla. Cada
            tarjeta de esta página es real — nada aquí es solo una maqueta.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Explora el universo de herramientas</h2>
          <p className="mt-1 text-slate-500">12 herramientas reales, una de cada rincón de Herramio.</p>
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <FloatingToolverse>
            {UNIVERSE_TOOLS.map((tool) => (
              <FloatingToolCard key={tool.id} tool={tool} />
            ))}
          </FloatingToolverse>
        </Reveal>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Todo en un solo lugar</h2>
            <p className="mt-1 text-slate-500">Pasa el mouse por una categoría para explorarla.</p>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <CategoryHub />
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16">
        <Reveal>
          <div className="rounded-3xl bg-slate-900 px-8 py-14 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Esto es Herramio de verdad</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-300">
              Sin cuentas, sin instalar nada, sin límites. {TOOLS.length} herramientas gratis, hoy.
            </p>
            <div className="mt-7 flex justify-center">
              <MagneticButton>
                <Link href="/herramientas">
                  <Button size="lg" variant="primary">
                    Ver el catálogo completo <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
