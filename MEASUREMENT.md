# Sistema de medición

Cómo vamos a saber si Herramio está creciendo de verdad. Todo esto depende
de que Google Analytics 4 y Google Search Console estén configurados (ver
`SEO.md` y el informe de la fase de dominio) — hasta entonces, estas son
las métricas que **vamos a mirar**, no datos que ya tengamos.

## La métrica central: ¿qué herramientas generan más tráfico?

Esta es la pregunta que debe revisarse cada semana, antes que cualquier
otra. El producto entero es un catálogo de herramientas — saber cuáles
atraen gente reales dirige todo lo demás: qué categoría nueva construir
primero, qué contenido de blog/video duplicar, y eventualmente dónde
priorizar posiciones publicitarias.

**Cómo verlo en GA4** una vez esté conectado:
Informes → Interacción → Eventos → filtrar por `tool_view` → dimensión
secundaria `tool` (el parámetro que ya envía `src/lib/analytics.ts`).
Esto da un ranking directo de qué herramienta abre más gente.

Cruza esto con `qr_generated` (mismo parámetro `tool`) para ver no solo
quién *visita* una herramienta sino quién realmente la *usa* — la
diferencia entre ambas cifras importa: una herramienta muy visitada pero
con poco `qr_generated` puede indicar un formulario confuso o un problema
de UX, no falta de interés.

## Eventos ya instrumentados (no requieren desarrollo adicional)

| Evento | Cuándo se dispara | Parámetro clave |
|---|---|---|
| `tool_view` | Al entrar a cualquier página de herramienta | `tool` (slug) |
| `tool_used` | Cuando una herramienta no-QR produce un resultado real (calculadora, dev tool, productividad...) | `tool` |
| `tool_downloaded` | Al descargar un archivo generado por una herramienta no-QR | `tool`, `format` |
| `tool_copied` | Al copiar un resultado o enlace al portapapeles | `tool` |
| `tool_error` | Cuando una herramienta falla o muestra un error de validación | `tool`, `reason` |
| `qr_generated` | Cuando el QR se genera exitosamente (primera vez con datos válidos) | `tool` |
| `qr_download_png` / `qr_download_svg` | Al descargar el QR | `tool`, `format` |
| `share_clicked` | Al hacer clic en compartir por WhatsApp/Facebook/X | `tool`, `channel` |
| `favorite_added` / `favorite_removed` | Al marcar/desmarcar una herramienta como favorita | `tool` |
| `search_used` | 500ms después de que el usuario deja de escribir en el buscador (Ctrl/Cmd+K), si hay texto | `query`, `results_count` |
| `search_result_clicked` | Al hacer clic (o Enter) en un resultado del buscador | `tool`, `query` |
| `category_selected` | Al hacer clic en una tarjeta de categoría (`CategoryGrid`, home o `/herramientas`) | `category` |
| `cta_clicked` | Al hacer clic en un CTA principal — Hero, navbar (desktop/mobile), destacada del hub | `cta` (`hero_explore`, `navbar_generador_qr`, `navbar_mobile_generador_qr`, `hub_featured_<tool>`) |
| `blog_article_view` | (preparado, ver nota) | `slug` |
| `campaign_landing` | Cuando alguien llega con `?ref=` en la URL | `ref_source` |

**Nota sobre `blog_article_view`**: el evento existe en `AnalyticsEvents`
pero no está disparándose todavía desde las páginas de blog — es una
mejora pendiente de una línea (`AnalyticsEvents.blogArticleView(slug)` en
un `useEffect` de `src/app/blog/[slug]/page.tsx`), no un evento ya activo.
No lo reporté como "funcionando" para no exagerar el estado actual.

**Nota sobre el renombrado de eventos**: en la segunda ronda de expansión
se renombraron los eventos genéricos de herramienta para seguir una
convención `tool_*` consistente — `tool_opened` → `tool_view`, `tool_use` →
`tool_used`, `tool_download` → `tool_downloaded`, `copy_link` →
`tool_copied`. Solo cambió el string que se envía a GA4 (en
`src/lib/analytics.ts`); las funciones que llaman los componentes
(`AnalyticsEvents.toolOpened(...)`, etc.) mantienen el mismo nombre para no
tocar decenas de archivos. Como el proyecto todavía no tenía tráfico real
ni dashboards construidos sobre los nombres viejos, no hay histórico que
se pierda con el cambio.

## KPIs a monitorear (una vez haya datos)

### Adquisición
- Usuarios y sesiones (GA4 → Informes → Ciclo de vida → Adquisición)
- Fuente/canal de tráfico (orgánico, social, directo, referido)
- Rendimiento por canal usando `?ref=` (ver `CONTENT-GROWTH.md`)

### Búsqueda orgánica (Search Console, una vez verificado)
- Impresiones y clics por página
- CTR (clics ÷ impresiones) — un CTR bajo con impresiones altas suele
  indicar un title/description poco atractivo, no falta de ranking
- Posición media por keyword
- Páginas indexadas vs. páginas enviadas (para detectar problemas de
  indexación temprano)

### Producto
- **Herramienta más visitada** (`tool_view` por `tool`) — la métrica
  central mencionada arriba
- Tasa de generación real: `qr_generated` ÷ `tool_view` por herramienta (QR) o `tool_used` ÷ `tool_view` (resto de categorías)
- Formato de descarga preferido: PNG vs. SVG (`qr_download_png` vs.
  `qr_download_svg`)
- Uso del buscador (Ctrl/Cmd+K): `search_used` (qué escribe la gente) y
  `search_result_clicked` (qué termina abriendo) — instrumentado desde
  esta ronda
- Favoritos guardados por herramienta (`favorite_added` menos
  `favorite_removed`) como señal de qué herramientas generan intención de
  volver

### Audiencia
- País (GA4 → Demografía)
- Dispositivo: móvil vs. escritorio (crítico dado que el diseño es
  mobile-first — si el móvil tiene peor tasa de generación que escritorio,
  es una señal de un problema real de UX a revisar)

## Mejoras de instrumentación pendientes (no implementadas todavía)

Estas requieren pequeños cambios de código — los dejo listados en vez de
implementarlos ahora para no tocar código fuera del alcance de esta fase,
pero son la base de un dashboard completo:

1. **`blog_article_view`**: disparar el evento ya definido desde la
   página de artículo.
2. **Evento de categoría "coming soon" solicitada**: cuando alguien hace
   clic en una categoría "Próximamente" o ve el mensaje de "no encontramos
   esa herramienta", registrar qué buscaban — validación directa de qué
   construir primero. (Ya no aplica a Productividad, que se activó en esta
   ronda; hoy la única categoría `coming-soon` restante es ninguna — las 8
   categorías del catálogo están activas.)

~~Evento de búsqueda~~ — implementado en esta ronda como `search_used` /
`search_result_clicked` (ver tabla de eventos arriba).

## Cadencia de revisión sugerida

- **Semanal**: herramienta más visitada, usuarios totales, canal que más
  trajo tráfico esa semana.
- **Mensual**: Search Console completo (impresiones, CTR, posición media),
  comparación mes contra mes, qué artículos de blog están indexando.
- **Por lanzamiento de herramienta nueva**: seguimiento diario los
  primeros 7 días de esa herramienta específica (`tool_opened` /
  `qr_generated` por `tool`), para decidir rápido si vale la pena seguir
  invirtiendo en esa categoría.

## Qué no hacer

- No compares tráfico contra proyecciones inventadas — compara siempre
  contra el propio histórico de Herramio.
- No optimices para vistas de página si no vienen acompañadas de uso real
  de las herramientas (`tool_opened` sin `qr_generated` sostenido es una
  señal de alerta, no de éxito).
- No actives AdSense basándote en una sola semana buena — espera una
  tendencia sostenida (ver `MONETIZATION.md`).
