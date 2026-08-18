# Testing

## Pruebas unitarias

```bash
npm run test        # una sola corrida
npm run test:watch  # modo watch
```

Cubren la lógica de generación de payloads QR (`src/lib/qr/payloads.ts`),
el registro de builders por tipo (`src/lib/qr/registry.ts`, que valida
campos requeridos antes de generar) y el cálculo de contraste de color
(`src/lib/qr/style.ts`). 31 pruebas en total, incluyendo:

- URL, WhatsApp (con y sin mensaje), WiFi (WPA/nopass/oculta, escape de
  caracteres especiales), email, teléfono, SMS, ubicación (Maps),
  Instagram/Facebook y vCard.
- Casos de campos vacíos/requeridos (no debe generarse un QR vacío o
  inválido).
- Umbrales de contraste (adecuado / advertencia / peligro).

### Qué falta por cubrir (recomendado a futuro)

Estas pruebas requieren un navegador real (Playwright) porque dependen de
Canvas/SVG del DOM y de descargas de archivo — quedan fuera del alcance de
Vitest + jsdom:

- Render end-to-end de cada herramienta y verificación visual del QR
- Verificación de que el botón "Descargar PNG/SVG" dispara una descarga real
- Pruebas de responsive (mobile/tablet/desktop) automatizadas

Como estas se hicieron manualmente durante el desarrollo (home, generador
universal, QR de WiFi, blog, vista móvil — todo verificado en un navegador
real sin errores de consola), quedan documentadas aquí como el siguiente
paso si el equipo adopta Playwright.

## QA manual (checklist antes de cada release)

- [ ] Home carga y el hero, herramientas, FAQ y blog se ven correctos
- [ ] `/generador-qr` genera un QR real al escribir en cada una de las 11 pestañas
- [ ] Cada herramienta dedicada (`/qr-*`) genera el payload esperado
- [ ] Los botones "Descargar PNG" y "Descargar SVG" no lanzan errores en consola
- [ ] El aviso de cookies aparece una vez, y Aceptar/Rechazar no rompe la página
- [ ] Vista móvil (375px) no tiene overflow horizontal
- [ ] `npm run build` y `npm run lint` terminan sin errores

## Pruebas de carga — reglas de seguridad (léelas antes de ejecutar nada)

El módulo de carga vive en `tests/load/` y está **diseñado para no poder
tocar producción ni publicidad por accidente**:

- Toda petición de prueba se identifica con el header `X-Test-Traffic: true`
  y el parámetro `?test=1`.
- El endpoint objetivo, `src/app/api/test/ping`, responde `403` a menos que
  `ALLOW_LOAD_TEST=true` esté configurado explícitamente **y** la petición
  traiga ese header — por defecto (`ALLOW_LOAD_TEST` sin definir o `false`)
  el endpoint está muerto, incluida producción.
- El script (`tests/load/load-test.mjs`) se niega a apuntar a un host que no
  sea `localhost` o que no contenga `staging`, salvo que pases `--force`
  (resérvalo para un deployment de pruebas dedicado, nunca para el dominio real).
- El módulo nunca genera clics en anuncios, nunca simula usuarios reales en
  páginas de marketing, nunca falsea el user-agent y nunca usa proxies para
  evadir detección — solo mide capacidad del servidor contra un endpoint
  reservado para esto.

### Cómo correr las pruebas (10 → 1000 usuarios)

```bash
# Terminal 1
ALLOW_LOAD_TEST=true npm run dev

# Terminal 2
node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=10   --duration=20
node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=50   --duration=20
node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=100  --duration=30
node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=500  --duration=30
node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=1000 --duration=30
```

Cada corrida imprime: requests totales, exitosos, errores, requests/seg,
latencia promedio, p95 y p99. Ver `tests/load/README.md` para instrucciones
detalladas, incluyendo cómo correrlo contra un preview de Vercel dedicado a
staging y un ejemplo equivalente con k6.

**Nunca** configures `ALLOW_LOAD_TEST=true` en el entorno de Production de
Vercel.
