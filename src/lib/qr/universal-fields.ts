import type { FieldConfig } from "@/lib/qr/fields";
import type { QrKind } from "@/lib/qr/registry";

export interface UniversalKindConfig {
  kind: QrKind;
  label: string;
  emoji: string;
  fields: FieldConfig[];
  emptyHint: string;
}

export const UNIVERSAL_KINDS: UniversalKindConfig[] = [
  {
    kind: "qr-url",
    label: "URL",
    emoji: "🔗",
    emptyHint: "Escribe un enlace para generar tu QR.",
    fields: [
      { name: "url", label: "Enlace (URL)", type: "url", placeholder: "https://tusitio.com", required: true },
    ],
  },
  {
    kind: "qr-texto",
    label: "Texto",
    emoji: "📝",
    emptyHint: "Escribe un texto para generar tu QR.",
    fields: [
      { name: "text", label: "Texto", type: "textarea", placeholder: "Escribe cualquier texto...", required: true, maxLength: 2000 },
    ],
  },
  {
    kind: "qr-whatsapp",
    label: "WhatsApp",
    emoji: "💬",
    emptyHint: "Escribe un número de WhatsApp para generar tu QR.",
    fields: [
      { name: "phone", label: "Número de WhatsApp", type: "tel", placeholder: "+52 55 1234 5678", required: true },
      { name: "message", label: "Mensaje predefinido (opcional)", type: "textarea", placeholder: "Hola, quiero más información..." },
    ],
  },
  {
    kind: "qr-wifi",
    label: "WiFi",
    emoji: "📶",
    emptyHint: "Escribe el nombre de tu red para generar el QR.",
    fields: [
      { name: "ssid", label: "Nombre de la red (SSID)", type: "text", placeholder: "MiRedWiFi", required: true },
      { name: "password", label: "Contraseña", type: "text", placeholder: "••••••••" },
      {
        name: "security",
        label: "Tipo de seguridad",
        type: "select",
        defaultValue: "WPA",
        options: [
          { value: "WPA", label: "WPA/WPA2" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "Sin contraseña" },
        ],
      },
      { name: "hidden", label: "Es una red oculta", type: "checkbox" },
    ],
  },
  {
    kind: "qr-email",
    label: "Email",
    emoji: "✉️",
    emptyHint: "Escribe un correo destinatario para generar el QR.",
    fields: [
      { name: "to", label: "Correo destinatario", type: "email", placeholder: "contacto@tunegocio.com", required: true },
      { name: "subject", label: "Asunto (opcional)", type: "text", placeholder: "Consulta desde código QR" },
      { name: "body", label: "Mensaje (opcional)", type: "textarea", placeholder: "Escribe un mensaje..." },
    ],
  },
  {
    kind: "qr-telefono",
    label: "Teléfono",
    emoji: "📞",
    emptyHint: "Escribe un número de teléfono para generar el QR.",
    fields: [
      { name: "phone", label: "Número de teléfono", type: "tel", placeholder: "+52 55 1234 5678", required: true },
    ],
  },
  {
    kind: "qr-sms",
    label: "SMS",
    emoji: "💌",
    emptyHint: "Escribe un número de teléfono para generar el QR.",
    fields: [
      { name: "phone", label: "Número de teléfono", type: "tel", placeholder: "+52 55 1234 5678", required: true },
      { name: "message", label: "Mensaje predefinido (opcional)", type: "textarea", placeholder: "Escribe el mensaje..." },
    ],
  },
  {
    kind: "qr-vcard",
    label: "Contacto",
    emoji: "👤",
    emptyHint: "Completa al menos tu nombre o teléfono para generar el QR.",
    fields: [
      { name: "firstName", label: "Nombre", type: "text", placeholder: "Ana", required: true },
      { name: "lastName", label: "Apellido", type: "text", placeholder: "García" },
      { name: "phone", label: "Teléfono", type: "tel", placeholder: "+52 55 1234 5678" },
      { name: "email", label: "Correo electrónico", type: "email", placeholder: "ana@empresa.com" },
      { name: "company", label: "Empresa", type: "text", placeholder: "Mi Empresa SAS" },
      { name: "website", label: "Sitio web", type: "url", placeholder: "https://miempresa.com" },
    ],
  },
  {
    kind: "qr-google-maps",
    label: "Ubicación",
    emoji: "📍",
    emptyHint: "Pega un enlace o escribe una dirección para generar tu QR.",
    fields: [
      { name: "query", label: "Enlace de Google Maps o dirección", type: "text", placeholder: "Pega el enlace o escribe una dirección", required: true },
    ],
  },
  {
    kind: "qr-instagram",
    label: "Instagram",
    emoji: "📷",
    emptyHint: "Escribe tu usuario de Instagram para generar el QR.",
    fields: [
      { name: "username", label: "Usuario o URL de Instagram", type: "text", placeholder: "@tunombre", required: true },
    ],
  },
  {
    kind: "qr-facebook",
    label: "Facebook",
    emoji: "📘",
    emptyHint: "Escribe tu página de Facebook para generar el QR.",
    fields: [
      { name: "username", label: "Página o URL de Facebook", type: "text", placeholder: "tupagina", required: true },
    ],
  },
];
