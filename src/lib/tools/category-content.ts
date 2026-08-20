import type { CategoryId } from "@/lib/tools/categories";

/**
 * Real, specific copy per category — written once here rather than
 * generated, so /categoria/[id] pages read as an actual product section
 * instead of a templated wrapper around a grid.
 */
export const CATEGORY_INTRO: Record<CategoryId, string> = {
  qr: "Genera códigos QR personalizados para enlaces, WiFi, WhatsApp, tarjetas de contacto, menús de restaurante y más — cada uno listo para descargar en PNG o SVG e imprimir o compartir digitalmente.",
  pdf: "Une, divide y convierte archivos PDF sin instalar programas ni crear una cuenta. Tus documentos — contratos, facturas, identificaciones — se procesan directamente en tu navegador.",
  imagenes: "Comprime y convierte imágenes entre JPG, PNG y WebP con control de calidad, directamente en tu navegador y sin subir tus fotos a ningún servidor.",
  calculadoras: "Porcentajes, IMC, descuentos, IVA, regla de tres, edad y diferencia entre fechas — cálculos cotidianos resueltos al instante, sin fórmulas que recordar.",
  convertidores: "Convierte unidades de longitud, peso, temperatura y volumen, además de tipos de cambio entre monedas actualizados a diario.",
  texto: "Cuenta palabras y caracteres, genera contraseñas seguras, crea texto de relleno Lorem Ipsum y limpia texto copiado de otras fuentes.",
  desarrolladores: "Formatea JSON, codifica Base64, genera hashes y UUID, prueba expresiones regulares y convierte entre CSV, JSON y formatos de color — utilidades diarias para programar.",
  productividad: "Temporizador Pomodoro, cronómetro, sorteador de nombres y generador de equipos — herramientas simples para organizar el trabajo y el tiempo.",
};
