"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { HeroBackground } from "@/components/marketing/HeroBackground";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { openSearchPalette } from "@/lib/search-events";
import { AnalyticsEvents } from "@/lib/analytics";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools/registry";

const EXAMPLES = [
  { label: "Crear un código QR...", query: "QR" },
  { label: "Comprimir un PDF...", query: "PDF" },
  { label: "Calcular un porcentaje...", query: "calculadoras" },
  { label: "Convertir una imagen...", query: "imágenes" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-white">
      <HeroBackground />
      <div className="container-page relative flex flex-col items-center py-20 text-center sm:py-28">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {SITE.name} · herramientas gratuitas
        </span>

        <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Todo lo que necesitas. En un solo lugar.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-500">
          Herramientas online gratuitas para convertir, calcular, crear y resolver tareas en
          segundos.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> Todo se procesa en tu navegador — nada se sube a un servidor.
        </p>

        <div className="mt-8 w-full max-w-lg">
          <SearchTrigger variant="large" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => openSearchPalette(example.query)}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
            >
              {example.label}
            </button>
          ))}
        </div>

        <div className="mt-7">
          <MagneticButton>
            <Link href="/herramientas" onClick={() => AnalyticsEvents.ctaClicked("hero_explore")}>
              <Button size="lg">
                Explorar las {TOOLS.length} herramientas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </MagneticButton>
        </div>

        {/* slate-500: slate-400 measures 2.63:1 on white — below WCAG AA. */}
        <p className="mt-6 text-sm text-slate-500">
          Sin registro. Sin instalar nada. Sin límites de uso.
        </p>
      </div>
    </section>
  );
}
