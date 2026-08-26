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
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <HeroBackground />
      <div className="container-page relative flex flex-col items-center py-20 text-center sm:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800 shadow-[0_8px_18px_rgba(16,185,129,0.12)]">
          <ShieldCheck className="h-3.5 w-3.5" /> {SITE.name}
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-6xl">
          Herramientas profesionales para resolver el trabajo real.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          De PDF y QR a análisis, comparadores y productividad: todo funciona rápido, claro y sin fricción.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-700" /> Procesamiento local, seguro y pensado para uso diario.
        </p>

        <div className="mt-8 w-full max-w-2xl">
          <SearchTrigger variant="large" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => openSearchPalette(example.query)}
              className="rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900"
            >
              {example.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton>
            <Link href="/herramientas" onClick={() => AnalyticsEvents.ctaClicked("hero_explore")}>
              <Button size="lg" variant="secondary">
                Explorar las {TOOLS.length} herramientas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </MagneticButton>
          <Link
            href="/originalidad"
            onClick={() => AnalyticsEvents.ctaClicked("hero_originality")}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            Ver Originalidad
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Sin registro</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Sin instalar nada</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">129 herramientas</span>
        </div>
      </div>
    </section>
  );
}
