import { QrCode, FileText, Image, Calculator, RefreshCw, Type, type LucideIcon } from "lucide-react";

export type CategoryId = "qr" | "pdf" | "imagenes" | "calculadoras" | "convertidores" | "texto";
export type CategoryStatus = "active" | "coming-soon";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: LucideIcon;
  status: CategoryStatus;
}

/**
 * The full set of categories Herramio is planned to grow into. Only "qr"
 * has real tools today — the rest render as "Próximamente" so the catalog
 * communicates where the product is headed without linking to anything
 * that doesn't exist yet.
 */
export const CATEGORIES: Category[] = [
  {
    id: "qr",
    name: "QR",
    description: "Genera y personaliza códigos QR para cualquier uso.",
    icon: QrCode,
    status: "active",
  },
  {
    id: "pdf",
    name: "PDF",
    description: "Comprimir, unir, dividir y convertir archivos PDF.",
    icon: FileText,
    status: "coming-soon",
  },
  {
    id: "imagenes",
    name: "Imágenes",
    description: "Comprimir, convertir y redimensionar imágenes.",
    icon: Image,
    status: "coming-soon",
  },
  {
    id: "calculadoras",
    name: "Calculadoras",
    description: "Porcentajes, finanzas y cálculos rápidos.",
    icon: Calculator,
    status: "coming-soon",
  },
  {
    id: "convertidores",
    name: "Convertidores",
    description: "Convierte archivos, unidades y formatos.",
    icon: RefreshCw,
    status: "coming-soon",
  },
  {
    id: "texto",
    name: "Texto",
    description: "Contar, formatear y transformar texto.",
    icon: Type,
    status: "coming-soon",
  },
];

export function getCategory(id: CategoryId): Category {
  const category = CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown category id: ${id}`);
  return category;
}
