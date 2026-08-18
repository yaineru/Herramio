"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        Ocurrió un error inesperado generando esta página. Puedes intentar de nuevo o volver al
        inicio.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button variant="outline">Ir al inicio</Button>
        </Link>
        <Button onClick={() => reset()}>Reintentar</Button>
      </div>
    </div>
  );
}
