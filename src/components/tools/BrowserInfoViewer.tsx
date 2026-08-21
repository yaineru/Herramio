"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Monitor, ShieldAlert, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { parseUserAgent } from "@/lib/dev/user-agent";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "privacidad-info-navegador";

interface BrowserInfo {
  browser: string;
  browserVersion: string | null;
  os: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  language: string;
  timezone: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  platform: string;
}

function collectInfo(): BrowserInfo {
  const parsed = parseUserAgent(navigator.userAgent);
  return {
    browser: parsed.browser,
    browserVersion: parsed.browserVersion,
    os: parsed.os,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === "1",
    platform: navigator.platform || "Desconocida",
  };
}

export function BrowserInfoViewer() {
  const [info, setInfo] = useState<BrowserInfo | null>(null);

  useEffect(() => {
    // navigator/screen only exist in the browser, so this must run after
    // mount rather than during SSR — deferred a tick to avoid setting state
    // synchronously within the effect body.
    const timeout = setTimeout(() => {
      setInfo(collectInfo());
      AnalyticsEvents.toolUsed(TOOL_ID);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!info) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-400">Analizando tu navegador…</p>
      </Card>
    );
  }

  const rows: { icon: typeof Monitor; label: string; value: string }[] = [
    { icon: Globe, label: "Navegador", value: `${info.browser}${info.browserVersion ? ` ${info.browserVersion}` : ""}` },
    { icon: Monitor, label: "Sistema operativo", value: info.os },
    { icon: Monitor, label: "Resolución de pantalla", value: `${info.screenWidth} × ${info.screenHeight}px` },
    { icon: Monitor, label: "Tamaño de ventana visible", value: `${info.viewportWidth} × ${info.viewportHeight}px` },
    { icon: Globe, label: "Idioma", value: info.language },
    { icon: Globe, label: "Zona horaria", value: info.timezone },
    { icon: Monitor, label: "Plataforma", value: info.platform },
  ];

  return (
    <Card className="p-6">
      <p className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        Cualquier sitio que visitas puede leer esta misma información sin pedirte permiso.
      </p>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm text-slate-500">
              <row.icon className="h-3.5 w-3.5 shrink-0" /> {row.label}
            </span>
            <span className="font-mono text-sm text-slate-900">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
          <span className="text-sm text-slate-500">Cookies habilitadas</span>
          {info.cookiesEnabled ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-red-500" />}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
          <span className="text-sm text-slate-500">&ldquo;No rastrear&rdquo; activado</span>
          {info.doNotTrack ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Todo se lee directamente de tu navegador — nada de esto se envía a ningún servidor ni se guarda.
      </p>
    </Card>
  );
}
