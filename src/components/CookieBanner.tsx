"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  setStoredConsent,
  subscribeToConsent,
} from "@/lib/consent";
import { Button } from "@/components/ui/Button";

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, getConsentServerSnapshot);
  const visible = consent === null;

  if (!visible) return null;

  function choose(value: "granted" | "denied") {
    setStoredConsent(value);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Usamos cookies para analítica y, cuando corresponda, publicidad. Puedes aceptarlas o
          rechazarlas — la herramienta funciona igual en ambos casos. Más información en nuestra{" "}
          <Link href="/cookies" className="font-medium text-emerald-700 underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("denied")}>
            Rechazar
          </Button>
          <Button size="sm" onClick={() => choose("granted")}>
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
