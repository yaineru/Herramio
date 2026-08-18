import {
  Link2,
  MessageCircle,
  Wifi,
  AlignLeft,
  MapPin,
  Camera,
  ThumbsUp,
  Mail,
  Phone,
  MessageSquare,
  IdCard,
  UtensilsCrossed,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/lib/tools/categories";

export type ToolStatus = "active" | "beta" | "coming-soon";

export interface Tool {
  id: string;
  slug: string;
  href: string;
  name: string;
  shortName: string;
  description: string;
  category: CategoryId;
  icon: LucideIcon;
  keywords: string[];
  status: ToolStatus;
  relatedTools: string[];
}

/**
 * Central catalog of every tool on Herramio. Adding a new tool anywhere in
 * the product should mean adding one entry here (plus its page) — nothing
 * else should need to hardcode a tool's name, icon, or slug.
 */
export const TOOLS: Tool[] = [
  {
    id: "qr-url",
    slug: "qr-url",
    href: "/qr-url",
    name: "QR para enlaces (URL)",
    shortName: "QR de URL",
    description: "Convierte cualquier enlace o página web en un código QR escaneable.",
    category: "qr",
    icon: Link2,
    keywords: ["url", "enlace", "link", "pagina web", "sitio web"],
    status: "active",
    relatedTools: ["qr-negocio", "qr-menu", "qr-vcard"],
  },
  {
    id: "qr-whatsapp",
    slug: "qr-whatsapp",
    href: "/qr-whatsapp",
    name: "QR de WhatsApp",
    shortName: "QR WhatsApp",
    description: "Crea un QR que abre un chat de WhatsApp con número y mensaje predefinido.",
    category: "qr",
    icon: MessageCircle,
    keywords: ["whatsapp", "chat", "mensaje", "ventas", "atencion al cliente"],
    status: "active",
    relatedTools: ["qr-sms", "qr-telefono", "qr-vcard"],
  },
  {
    id: "qr-wifi",
    slug: "qr-wifi",
    href: "/qr-wifi",
    name: "QR de WiFi",
    shortName: "QR WiFi",
    description: "Comparte tu red WiFi sin decir la contraseña en voz alta.",
    category: "qr",
    icon: Wifi,
    keywords: ["wifi", "red", "contraseña", "internet", "conexion"],
    status: "active",
    relatedTools: ["qr-menu", "qr-negocio", "qr-url"],
  },
  {
    id: "qr-texto",
    slug: "qr-texto",
    href: "/qr-texto",
    name: "QR de texto",
    shortName: "QR de texto",
    description: "Codifica cualquier texto plano, notas o instrucciones en un QR.",
    category: "qr",
    icon: AlignLeft,
    keywords: ["texto", "nota", "instrucciones", "mensaje"],
    status: "active",
    relatedTools: ["qr-url", "qr-email", "qr-vcard"],
  },
  {
    id: "qr-google-maps",
    slug: "qr-google-maps",
    href: "/qr-google-maps",
    name: "QR de Google Maps",
    shortName: "QR Maps",
    description: "Genera un QR que lleva directo a una ubicación o dirección en el mapa.",
    category: "qr",
    icon: MapPin,
    keywords: ["maps", "mapa", "ubicacion", "direccion", "google maps"],
    status: "active",
    relatedTools: ["qr-negocio", "qr-menu", "qr-whatsapp"],
  },
  {
    id: "qr-instagram",
    slug: "qr-instagram",
    href: "/qr-instagram",
    name: "QR de Instagram",
    shortName: "QR Instagram",
    description: "Lleva a tus clientes directo a tu perfil de Instagram con un escaneo.",
    category: "qr",
    icon: Camera,
    keywords: ["instagram", "redes sociales", "perfil", "seguidores"],
    status: "active",
    relatedTools: ["qr-facebook", "qr-negocio", "qr-vcard"],
  },
  {
    id: "qr-facebook",
    slug: "qr-facebook",
    href: "/qr-facebook",
    name: "QR de Facebook",
    shortName: "QR Facebook",
    description: "Comparte tu página o perfil de Facebook mediante un código QR.",
    category: "qr",
    icon: ThumbsUp,
    keywords: ["facebook", "redes sociales", "pagina", "perfil"],
    status: "active",
    relatedTools: ["qr-instagram", "qr-negocio", "qr-whatsapp"],
  },
  {
    id: "qr-email",
    slug: "qr-email",
    href: "/qr-email",
    name: "QR de correo electrónico",
    shortName: "QR Email",
    description: "Genera un QR que abre un correo nuevo con destinatario, asunto y mensaje.",
    category: "qr",
    icon: Mail,
    keywords: ["email", "correo", "mail", "contacto"],
    status: "active",
    relatedTools: ["qr-telefono", "qr-sms", "qr-vcard"],
  },
  {
    id: "qr-telefono",
    slug: "qr-telefono",
    href: "/qr-telefono",
    name: "QR de llamada telefónica",
    shortName: "QR Teléfono",
    description: "Crea un QR que inicia una llamada telefónica al escanearlo.",
    category: "qr",
    icon: Phone,
    keywords: ["telefono", "llamada", "numero", "contacto"],
    status: "active",
    relatedTools: ["qr-whatsapp", "qr-sms", "qr-vcard"],
  },
  {
    id: "qr-sms",
    slug: "qr-sms",
    href: "/qr-sms",
    name: "QR de SMS",
    shortName: "QR SMS",
    description: "Genera un QR que abre la app de mensajes con número y texto predefinidos.",
    category: "qr",
    icon: MessageSquare,
    keywords: ["sms", "mensaje de texto", "telefono"],
    status: "active",
    relatedTools: ["qr-whatsapp", "qr-telefono", "qr-email"],
  },
  {
    id: "qr-vcard",
    slug: "qr-vcard",
    href: "/qr-vcard",
    name: "QR de tarjeta de contacto (vCard)",
    shortName: "QR vCard",
    description: "Comparte tu tarjeta de presentación digital: nombre, teléfono, empresa y más.",
    category: "qr",
    icon: IdCard,
    keywords: ["vcard", "contacto", "tarjeta de presentacion", "negocios"],
    status: "active",
    relatedTools: ["qr-whatsapp", "qr-email", "qr-negocio"],
  },
  {
    id: "qr-menu",
    slug: "qr-menu",
    href: "/qr-menu",
    name: "QR para menú de restaurante",
    shortName: "QR Menú",
    description: "Crea un QR que lleva al menú digital de tu restaurante, bar o cafetería.",
    category: "qr",
    icon: UtensilsCrossed,
    keywords: ["menu", "restaurante", "carta", "bar", "cafeteria"],
    status: "active",
    relatedTools: ["qr-wifi", "qr-negocio", "qr-google-maps"],
  },
  {
    id: "qr-negocio",
    slug: "qr-negocio",
    href: "/qr-negocio",
    name: "QR para negocios",
    shortName: "QR Negocio",
    description: "Un QR todo-en-uno para que tu negocio comparta web, redes y contacto.",
    category: "qr",
    icon: Store,
    keywords: ["negocio", "empresa", "todo en uno", "enlaces"],
    status: "active",
    relatedTools: ["qr-whatsapp", "qr-google-maps", "qr-vcard"],
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: CategoryId): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  return tool.relatedTools
    .map((id) => getToolById(id))
    .filter((t): t is Tool => Boolean(t))
    .slice(0, limit);
}
