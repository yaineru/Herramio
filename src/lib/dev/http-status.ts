export interface HttpStatusEntry {
  code: number;
  name: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  description: string;
}

export const HTTP_STATUS_CODES: HttpStatusEntry[] = [
  { code: 100, name: "Continue", category: "1xx", description: "El servidor recibió los encabezados y el cliente puede continuar enviando el cuerpo de la petición." },
  { code: 101, name: "Switching Protocols", category: "1xx", description: "El servidor acepta cambiar de protocolo, según lo pidió el cliente (por ejemplo, a WebSocket)." },
  { code: 200, name: "OK", category: "2xx", description: "La petición se completó correctamente." },
  { code: 201, name: "Created", category: "2xx", description: "La petición se completó y se creó un nuevo recurso." },
  { code: 202, name: "Accepted", category: "2xx", description: "La petición fue aceptada para procesarse, pero el proceso aún no terminó." },
  { code: 204, name: "No Content", category: "2xx", description: "La petición se completó correctamente, pero no hay contenido que devolver." },
  { code: 301, name: "Moved Permanently", category: "3xx", description: "El recurso se movió de forma permanente a una nueva URL." },
  { code: 302, name: "Found", category: "3xx", description: "El recurso está temporalmente en una URL distinta." },
  { code: 304, name: "Not Modified", category: "3xx", description: "El recurso no cambió desde la última vez que se pidió; se puede usar la copia en caché." },
  { code: 307, name: "Temporary Redirect", category: "3xx", description: "Redirección temporal que conserva el método y el cuerpo de la petición original." },
  { code: 308, name: "Permanent Redirect", category: "3xx", description: "Redirección permanente que conserva el método y el cuerpo de la petición original." },
  { code: 400, name: "Bad Request", category: "4xx", description: "El servidor no entendió la petición por un error de sintaxis o datos inválidos." },
  { code: 401, name: "Unauthorized", category: "4xx", description: "Se necesita autenticación válida para acceder al recurso." },
  { code: 403, name: "Forbidden", category: "4xx", description: "El servidor entendió la petición pero se niega a autorizarla." },
  { code: 404, name: "Not Found", category: "4xx", description: "El servidor no encontró el recurso solicitado." },
  { code: 405, name: "Method Not Allowed", category: "4xx", description: "El método HTTP usado no está permitido para este recurso." },
  { code: 408, name: "Request Timeout", category: "4xx", description: "El servidor agotó el tiempo de espera de la petición del cliente." },
  { code: 409, name: "Conflict", category: "4xx", description: "La petición entra en conflicto con el estado actual del recurso." },
  { code: 410, name: "Gone", category: "4xx", description: "El recurso ya no está disponible y no se sabe una nueva dirección." },
  { code: 418, name: "I'm a Teapot", category: "4xx", description: "Código de broma del RFC 2324: el servidor se niega a preparar café porque es una tetera." },
  { code: 422, name: "Unprocessable Entity", category: "4xx", description: "La sintaxis de la petición es correcta, pero los datos no pudieron procesarse." },
  { code: 429, name: "Too Many Requests", category: "4xx", description: "El cliente envió demasiadas peticiones en poco tiempo (límite de tasa excedido)." },
  { code: 500, name: "Internal Server Error", category: "5xx", description: "Error genérico del servidor: algo salió mal y no se especifica qué." },
  { code: 501, name: "Not Implemented", category: "5xx", description: "El servidor no reconoce el método de la petición o no puede cumplirla." },
  { code: 502, name: "Bad Gateway", category: "5xx", description: "Un servidor actuando como proxy recibió una respuesta inválida del servidor de origen." },
  { code: 503, name: "Service Unavailable", category: "5xx", description: "El servidor no está disponible temporalmente (sobrecarga o mantenimiento)." },
  { code: 504, name: "Gateway Timeout", category: "5xx", description: "Un servidor actuando como proxy no recibió respuesta a tiempo del servidor de origen." },
];

/** Case-insensitive search over code, name, and description. Empty query returns the full list. */
export function searchHttpStatusCodes(query: string): HttpStatusEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return HTTP_STATUS_CODES;
  return HTTP_STATUS_CODES.filter(
    (entry) =>
      String(entry.code).includes(trimmed) ||
      entry.name.toLowerCase().includes(trimmed) ||
      entry.description.toLowerCase().includes(trimmed),
  );
}

export function getHttpStatusByCode(code: number): HttpStatusEntry | undefined {
  return HTTP_STATUS_CODES.find((entry) => entry.code === code);
}
