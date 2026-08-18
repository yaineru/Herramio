# Monetización

## Principio rector

**Tráfico real primero, monetización después.** No actives publicidad ni
solicites AdSense hasta tener tráfico orgánico genuino. Activar anuncios en
un sitio sin tráfico real no genera ingresos y puede perjudicar la revisión
de AdSense.

## Estado actual del código

- `NEXT_PUBLIC_ADS_ENABLED=false` por defecto (`.env.example`).
- El componente `AdSlot` (`src/components/ads/AdSlot.tsx`) reserva el
  espacio visual (con `min-height` fijo para evitar Layout Shift) pero
  muestra un placeholder discreto ("Espacio publicitario") mientras
  `ADS_ENABLED` sea `false`.
- Los espacios ya están day colocados en:
  1. Debajo del hero / generador principal (home y cada herramienta)
  2. Entre contenido (dentro de artículos de blog y páginas de herramientas)
  3. Antes del footer (home)
- El generador de QR sigue siendo siempre el elemento principal de cada
  página — ningún AdSlot interfiere con el formulario ni con los botones de
  descarga.

## Cómo activar AdSense cuando el sitio esté listo

1. Solicita una cuenta en [Google AdSense](https://www.google.com/adsense/) usando tu dominio ya conectado y con contenido real e indexado.
2. Espera la aprobación (Google revisa contenido, tráfico y cumplimiento de políticas — este proceso puede tardar días o semanas).
3. Una vez aprobado, en Vercel configura:
   ```
   NEXT_PUBLIC_ADS_ENABLED=true
   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXX
   NEXT_PUBLIC_ADSENSE_SLOT_HEADER=xxxxxxxxxx
   NEXT_PUBLIC_ADSENSE_SLOT_BELOW_GENERATOR=xxxxxxxxxx
   NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=xxxxxxxxxx
   NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=xxxxxxxxxx
   ```
   (los IDs de slot los genera AdSense al crear cada unidad de anuncio).
4. Redeploy. `AdSlot` empezará a renderizar el `<ins class="adsbygoogle">` real automáticamente, y `src/components/Analytics.tsx` cargará el script de AdSense — pero **solo después de que el visitante acepte cookies** en el aviso de consentimiento.

## Reglas que el código ya respeta (no las rompas)

- Nunca cargar el script de AdSense antes del consentimiento de cookies.
- Nunca colocar un AdSlot dentro o inmediatamente adyacente a un botón de
  acción (descargar, generar) donde un clic accidental sea probable.
- Nunca mostrar anuncios en `/api/test/*` ni en rutas de testing.
- No usar tráfico automatizado (ver `TESTING.md`) para generar impresiones.

## Ideas de monetización adicional (no implementadas, arquitectura compatible)

Estas requieren autenticación y base de datos — fuera del alcance del MVP,
pero el proyecto no tiene nada que lo impida a futuro:

- **QR dinámicos**: un QR que apunta a una URL corta propia, editable sin
  reimprimir (requiere backend + base de datos, ej. Supabase/PostgreSQL).
- **Estadísticas de escaneo**: requiere que el QR pase por un redirector
  propio en vez de apuntar directo al destino final.
- **Branding / marca de agua removible**: plan de pago que quita un sello
  discreto en las descargas gratuitas (actualmente no hay marca de agua en
  absoluto, así que esto requeriría decidir primero si se introduce un
  límite en el plan gratuito).
- **Páginas de negocio / menús digitales propios**: hosting de una mini
  landing por negocio (nombre, redes, menú) en vez de depender de una URL
  externa — evolución natural de `/qr-negocio` y `/qr-menu`.
- **Planes FREE / PRO / BUSINESS**: solo tiene sentido una vez exista una de
  las funciones anteriores que justifique cobrar; no cobres por algo que ya
  es gratis en el mercado (generación y personalización básica de QR).
