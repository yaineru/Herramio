import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <QrCode className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">404 — Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        Este enlace no lleva a ninguna parte, pero tu próximo código QR sí.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button variant="outline">Ir al inicio</Button>
        </Link>
        <Link href="/generador-qr">
          <Button>Crear un QR</Button>
        </Link>
      </div>
    </div>
  );
}
