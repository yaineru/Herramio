import { QrCode, FileText, Image, Calculator, RefreshCw, Type, Zap, Code2, type LucideIcon } from "lucide-react";

export type CategoryId =
  | "qr"
  | "pdf"
  | "imagenes"
  | "calculadoras"
  | "convertidores"
  | "texto"
  | "desarrolladores"
  | "productividad";
export type CategoryStatus = "active" | "coming-soon";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: LucideIcon;
  status: CategoryStatus;
}

/**
 * The full set of categories Herramio is planned to grow into. A category's
 * status flips from "coming-soon" to "active" only once it has at least one
 * real, working tool — never earlier (see ARCHITECTURE.md).
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
    description: "Unir, dividir y convertir archivos PDF.",
    icon: FileText,
    status: "active",
  },
  {
    id: "imagenes",
    name: "Imágenes",
    description: "Comprimir, convertir y redimensionar imágenes.",
    icon: Image,
    status: "active",
  },
  {
    id: "calculadoras",
    name: "Calculadoras",
    description: "Porcentajes, finanzas y cálculos rápidos.",
    icon: Calculator,
    status: "active",
  },
  {
    id: "convertidores",
    name: "Convertidores",
    description: "Convierte archivos, unidades y formatos.",
    icon: RefreshCw,
    status: "active",
  },
  {
    id: "texto",
    name: "Texto",
    description: "Contar, formatear y transformar texto.",
    icon: Type,
    status: "active",
  },
  {
    id: "desarrolladores",
    name: "Desarrolladores",
    description: "JSON, Base64, hashes y otras utilidades para programar.",
    icon: Code2,
    status: "active",
  },
  {
    id: "productividad",
    name: "Productividad",
    description: "Temporizadores, cronómetro, sorteos y utilidades del día a día.",
    icon: Zap,
    status: "active",
  },
];

export function getCategory(id: CategoryId): Category {
  const category = CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown category id: ${id}`);
  return category;
}
