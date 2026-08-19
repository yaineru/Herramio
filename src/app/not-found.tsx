import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { TOOLS } from "@/lib/tools/registry";

const SUGGESTED_IDS = [
  "qr-whatsapp",
  "calc-porcentaje",
  "imagen-comprimir",
  "pdf-unir",
  "texto-generador-contrasenas",
  "dev-json-formatter",
];
const SUGGESTED_TOOLS = SUGGESTED_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(
  (t): t is (typeof TOOLS)[number] => Boolean(t),
);

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Compass className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">Esta página no existe</h1>
        <p className="mt-2 max-w-md text-slate-500">
          El enlace que seguiste no lleva a ninguna herramienta real. Pero seguramente lo que
          buscabas sí existe — prueba a buscarlo.
        </p>

        <div className="mt-8 w-full max-w-lg">
          <SearchTrigger variant="large" placeholder={`Buscar entre las ${TOOLS.length} herramientas...`} />
        </div>

        <div className="mt-6">
          <Link href="/">
            <Button variant="outline">Ir al inicio</Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <h2 className="text-center text-lg font-semibold text-slate-900">O prueba una de estas</h2>
        <div className="mt-6">
          <ToolGrid tools={SUGGESTED_TOOLS} />
        </div>
      </div>
    </div>
  );
}
