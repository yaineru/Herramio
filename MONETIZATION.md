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
- La herramienta (generador de QR, calculadora, subidor de archivos PDF...)
  sigue siendo siempre el elemento principal de cada página — ningún AdSlot
  interfiere con el formulario ni con los botones de descarga, en ninguna
  categoría.

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

Estas siguen sin implementarse, pero la arquitectura SaaS de la sección
siguiente ya tiene dónde encajarlas sin rediseñar nada:

- **QR dinámicos**: un QR que apunta a una URL corta propia, editable sin
  reimprimir. Encajaría como `premium_tools` en el plan Pro.
- **Estadísticas de escaneo**: requiere que el QR pase por un redirector
  propio en vez de apuntar directo al destino final.
- **Branding / marca de agua removible**: plan de pago que quita un sello
  discreto en las descargas gratuitas (actualmente no hay marca de agua en
  absoluto, así que esto requeriría decidir primero si se introduce un
  límite en el plan gratuito).
- **Páginas de negocio / menús digitales propios**: hosting de una mini
  landing por negocio (nombre, redes, menú) en vez de depender de una URL
  externa — evolución natural de `/qr-negocio` y `/qr-menu`.

---

# Arquitectura SaaS (cuentas, planes y pagos)

Todo lo de esta sección **sí está implementado** (auditar con `git log` /
el código para el estado más actual). Cubre exactamente lo que dijiste que
necesitabas documentado: arquitectura, planes, Supabase, billing, webhooks,
entitlements, ads, cómo cambiar precios, cómo agregar un plan o una
herramienta premium, y cómo probar pagos en modo test.

## Resumen del modelo de negocio

| Plan | Precio | Anuncios | Límites | Equipos |
|---|---|---|---|---|
| Gratis | $0 | Sí | Estándar | No |
| Pro | US$3.99/mes o US$29.99/año | No | Más altos | No |
| Equipo | US$9.99/mes (hasta 5 miembros) | No | Más altos | Sí |
| Pro fundador (oferta, inactiva por defecto) | US$0.99/mes | No | Más altos | No |

Los precios y features **no están hardcodeados** en ningún componente —
viven en la tabla `plans` de Supabase (ver abajo). Cambiar un precio es un
`UPDATE` en esa tabla, nunca una edición de código. Un plan puede tener
precio mensual, anual, ambos, o ninguno (el plan gratis) — no está atado a
un único intervalo por fila.

## Piezas y dónde viven

| Pieza | Archivo | Qué hace |
|---|---|---|
| Cliente Supabase (browser) | `src/lib/supabase/client.ts` | Para Client Components (poco usado — casi todo pasa por Server Actions) |
| Cliente Supabase (server) | `src/lib/supabase/server.ts` | Lee la sesión de las cookies; usado en Server Components, Server Actions y Route Handlers |
| Cliente admin (service role) | `src/lib/supabase/admin.ts` | Bypasea RLS — **solo** para el webhook de Stripe y casos server-to-server equivalentes |
| Refresco de sesión | `middleware.ts` + `src/lib/supabase/middleware.ts` | Solo refresca la cookie de sesión en cada request; nunca decide autorización |
| Usuario actual | `src/lib/auth/current-user.ts` | `getCurrentUser()` — usa `auth.getUser()` (revalida contra Supabase), no `getSession()` |
| Resolución de plan | `src/lib/auth/entitlements.ts` | `getEntitlements()` — LA función central: suscripción propia → suscripción del equipo → `free` por defecto |
| Qué puede hacer el usuario | `src/lib/plans/types.ts` | `Entitlements` se deriva siempre de un `Plan`, nunca se setea aparte |
| Anuncios | `src/lib/ads/should-show-ads.ts` | `shouldShowAds()` — combina el kill switch (`NEXT_PUBLIC_ADS_ENABLED`) con `entitlements.adsEnabled` |
| Planes (lectura) | `src/lib/plans/queries.ts` | `getActivePlans()`, `getPlanById()`, `getPlanByProviderPriceId()` (resuelve mensual o anual) |
| Server Actions de auth | `src/lib/auth/actions.ts` | signUp / signIn / signOut / reset / update password |
| **Interfaz de proveedor de pagos** | `src/lib/billing/provider.ts` | `BillingProvider` — el contrato que implementa cada procesador; el resto de la app nunca llama a Stripe o Mercado Pago directamente |
| Selección de proveedor | `src/lib/billing/get-provider.ts` | `getBillingProvider()` — único lugar que decide cuál procesador está activo (`BILLING_PROVIDER` env var) |
| Implementación Mercado Pago | `src/lib/billing/providers/mercadopago-provider.ts` | Procesador **por defecto** — ver la comparación investigada más abajo |
| Implementación Stripe | `src/lib/billing/providers/stripe-provider.ts` | Mantenida completa para una futura expansión internacional, no es el default |
| Lógica de dominio del webhook | `src/lib/billing/apply-webhook-event.ts` | `applyBillingSubscriptionEvent()` — el único lugar que escribe `subscriptions`, sin importar qué procesador llamó |
| Server Actions de billing | `src/lib/billing/actions.ts` | Checkout, portal de facturación (si el procesador lo tiene) y cancelación directa (si no) — todo vía `getBillingProvider()` |
| Webhooks | `src/app/api/webhooks/stripe/route.ts` y `.../mercadopago/route.ts` | Verifican firma, garantizan idempotencia, delegan a `applyBillingSubscriptionEvent()` — nunca la página de éxito del checkout activa nada |
| Límites de uso | `src/lib/plans/limits.ts` | `checkUsageLimit()` — genérico, lee el límite de `entitlements.metadata`, nunca lo hardcodea |
| Favoritos con límite real | `src/components/tools/FavoriteButton.tsx`, `src/components/providers/EntitlementsProvider.tsx` | Único límite real hoy (favoritos autenticados) — ver la sección dedicada más abajo |
| Uso de herramientas (real, no fingido) | `src/lib/usage/actions.ts`, `src/lib/usage/queries.ts`, `src/components/tools/UsageTracker.tsx` | Analítico, nunca gatea acceso — ver la sección dedicada |
| Rate limiting | `src/lib/rate-limit/check.ts` | `checkRateLimit()` — solo en los Server Actions de auth; falla abierto |
| Admin (solo lectura) | `src/lib/admin/auth.ts`, `src/lib/admin/metrics.ts`, `src/app/admin/page.tsx` | Protegido por `ADMIN_EMAILS`; 404 real para no-admins |

## Supabase: esquema, RLS y estado real de la migración

Migraciones en `supabase/migrations/`:

- `0001_init.sql` + `0002_seed_plans.sql` — **ya aplicadas contra el
  proyecto real** (confirmado vía REST el 2026-08-24 — las 9 tablas
  existen y responden). Estos dos archivos se dejan intactos con su forma
  original tal como se aplicaron — nunca se edita una migración que ya
  corrió contra una base de datos real, sin importar si tiene commits en
  git o no.
- `0003_pricing_and_entitlements_rework.sql` — **ya aplicada** (confirmado
  vía REST el 2026-08-24: `pro` = US$3.99/US$29.99, `team` = US$9.99,
  `pro_founding` = US$0.99/inactiva, `subscriptions.billing_interval`
  existe, RLS sigue bloqueando escrituras anónimas). Convirtió `plans` de
  "un precio + un intervalo por fila" al esquema actual (mensual/anual,
  `metadata` jsonb, ids de precio por intervalo).
- `0004_rate_limiting.sql` — **todavía NO aplicada**. Agrega la tabla
  `rate_limit_events` y la función `check_and_record_rate_limit()` que
  protege los Server Actions de auth contra abuso (ver "Rate limiting" más
  abajo). Sin esto, `checkRateLimit()` falla abierto automáticamente (no
  rompe el login/registro — simplemente no limita nada todavía).

**Cómo aplicar 0004** (la única pendiente):

```bash
# Opción A — CLI, si tienes la contraseña de la base de datos:
npx supabase link --project-ref <project-ref>
npx supabase db push

# Opción B — sin CLI (la usada para 0001-0003): copia el contenido de
# supabase/migrations/0004_rate_limiting.sql y pégalo en
# Supabase Dashboard → SQL Editor → New query → Run.
```

Después de aplicar cualquier migración nueva, regenera los tipos (el archivo actual está escrito a
mano para poder avanzar sin acceso directo a la base de datos):

```bash
npx supabase gen types typescript --project-id <project-ref> > src/lib/supabase/database.types.ts
```

y revisa que sigan siendo `type` (no `interface`) — ver el comentario al
inicio de ese archivo; mezclarlo con `interface` rompe el tipado de
`.select()` de forma silenciosa (se resuelve a `never` sin error de build).

### RLS: verificado con escrituras reales, no solo revisado en código

Probado directamente contra el proyecto real (no solo leído en el SQL):

- `INSERT` anónimo en `subscriptions` → rechazado explícitamente:
  `42501 new row violates row-level security policy`.
- `PATCH` anónimo en `plans` (intentando cambiar un precio) → Postgres
  devuelve `204` pero la fila **no cambió** — RLS bloquea la actualización
  sin candidatos que coincidan; PostgREST igual responde `204` en un PATCH
  sin filas afectadas, así que un `204` por sí solo no es prueba de éxito
  al probar RLS — hay que releer la fila.

## Variables de entorno

Ver `.env.example` — nunca commitees valores reales:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, bypasea RLS

BILLING_PROVIDER=mercadopago    # o "stripe" — ver get-provider.ts

MERCADOPAGO_ACCESS_TOKEN=       # server-only
MERCADOPAGO_WEBHOOK_SECRET=     # server-only

STRIPE_SECRET_KEY=              # server-only, solo si BILLING_PROVIDER=stripe
STRIPE_WEBHOOK_SECRET=          # server-only

ADMIN_EMAILS=                   # server-only, lista separada por comas — ver /admin
```

Los ids de precio **no van en variables de entorno** — van en las columnas
`provider_price_id_monthly` / `provider_price_id_annual` de la tabla
`plans`, para poder cambiar de precio o de intervalo sin redeploy.

## Proveedor de pagos: investigado, no asumido

Comparación real (Colombia, agosto 2026 — ver fuentes citadas en el chat
de esta sesión):

| | Mercado Pago | Stripe | Wompi |
|---|---|---|---|
| Cuenta para un negocio en Colombia | Directa | Requiere incorporar empresa en EE. UU. (Stripe Atlas, US$500 + US$100/año) | Directa |
| Motor de suscripciones nativo | Sí (`/preapproval`, planes asociados) | Sí (Billing) | No — solo tokenización, hay que construir la recurrencia propia |
| Comisión aproximada | ~3.3–3.5% + ~800–900 COP + IVA | 2.9% + US$0.30 + 0.7% (Billing) | ~3.49% + IVA + 700 COP |
| Efectivo en US$3.99/mes | ~10.7% | ~15% | ~variable, sin motor nativo |
| Efectivo en US$9.99/mes | ~6.8% | ~8% | — |
| Efectivo en US$0.99/mes (fundador) | ~30% | ~40%+ | ~30% |

**Decisión: Mercado Pago como proveedor por defecto** (`BILLING_PROVIDER`
sin configurar cae en `mercadopago`). Sin incorporación extranjera, con
motor de suscripciones real, y con márgenes saludables a los precios
objetivo actuales. Stripe queda completamente implementado detrás de la
misma interfaz `BillingProvider` para una futura fase de expansión
internacional — cambiarlo es una variable de entorno, no una reescritura.
Wompi se descartó como *segundo* proveedor colombiano: mismo mercado que
Mercado Pago, sin motor de suscripciones nativo.

El plan "fundador" (US$0.99) sigue siendo estructuralmente poco rentable
en cualquier procesador — la comisión fija domina a ese precio. Es
aceptable como oferta de adquisición por tiempo limitado, no como el
modelo de estado estable.

## Cómo probar pagos en modo test (antes de cobrar de verdad)

**Mercado Pago** (proveedor por defecto):

1. Crea una cuenta de Mercado Pago Developers → copia las credenciales de
   **prueba** (empiezan con `TEST-`) → `MERCADOPAGO_ACCESS_TOKEN`.
2. Crea un plan de prueba (`preapproval_plan`) para Pro y otro para Equipo
   desde el panel o vía API → guarda cada id en `plans.provider_price_id_monthly`
   / `_annual` con un `UPDATE`.
3. Developers → Tus integraciones → Webhooks → configura la URL
   `https://<tu-dominio>/api/webhooks/mercadopago`, activa el evento
   "Planes y suscripciones" → copia la **firma secreta** →
   `MERCADOPAGO_WEBHOOK_SECRET`.
4. Usa una [tarjeta de prueba de Mercado
   Pago](https://www.mercadopago.com.co/developers/es/docs/checkout-api/additional-content/your-integrations/test/cards)
   en `/precios`.
5. Verifica en el panel (modo prueba) que la suscripción se autorizó, y en
   Supabase que la fila de `subscriptions` se sincronizó vía webhook —
   **nunca confíes en que la página de regreso del checkout por sí sola
   significa que el usuario ya es Pro**.
6. **Pendiente de confirmar contra una cuenta sandbox real** (no se pudo
   probar en esta sesión sin credenciales): que `init_point` es el campo
   correcto para redirigir en modo prueba, y que la respuesta de
   `PreApproval.get()` realmente incluye `preapproval_plan_id` — ver los
   comentarios en `mercadopago-provider.ts`.

**Stripe** (si `BILLING_PROVIDER=stripe`): mismo flujo con claves
`sk_test_...`/`whsec_...`, tarjeta `4242 4242 4242 4242`, y el endpoint
`/api/webhooks/stripe`.

**Nunca uses una tarjeta real ni credenciales de producción durante
pruebas.**

## Cómo cambiar un precio

Nunca en código — un `UPDATE` en Supabase:

```sql
update public.plans set monthly_price_cents = 499 where id = 'pro'; -- US$4.99/mes
update public.plans set annual_price_cents = 3999 where id = 'pro'; -- US$39.99/año
```

`monthly_price_cents` / `annual_price_cents` pueden ser independientes o
null (un plan no tiene por qué ofrecer ambos intervalos).

## Cómo agregar un plan nuevo

1. `insert into public.plans (id, name, ...)` — `id` es texto libre a
   todo nivel (base de datos y TypeScript); un plan nuevo (p. ej. una
   oferta "pro_black_friday") es una fila, nunca un cambio de código.
   Código que necesite tratar un plan específico distinto (no solo mostrar
   su precio/nombre) importa una constante de `src/lib/plans/types.ts`
   (`FREE_PLAN_ID`, `PRO_PLAN_ID`, `TEAM_PLAN_ID`) — no compara contra un
   `enum` exhaustivo.
2. Crea el precio/plan correspondiente en el proveedor activo y guarda su
   id en `provider_price_id_monthly` / `_annual`.
3. La etiqueta visible es la propia columna `name` de la fila — no hay un
   mapa aparte que mantener sincronizado.

## Cómo agregar una función o herramienta premium

1. Si ya existe un flag de `Entitlements` que sirve (`premiumTools`,
   `higherLimits`, ...), léelo donde corresponda con `await
   getEntitlements()` — nunca reimplementes la resolución de plan.
2. Si es un límite numérico o flag específico de un plan que no justifica
   su propia columna (p. ej. `pdf_daily_limit`), guárdalo en la columna
   `metadata` (jsonb) del plan y léelo vía `entitlements.metadata` — evita
   una migración nueva por cada límite. Si en cambio es un flag que varios
   planes comparten y que gatea una decisión estructural (como
   `premiumTools`), sí amerita su propia columna booleana.
3. Para gatear una herramienta específica del registro
   (`src/lib/tools/registry.ts`), comprueba el flag en el Server Component
   de esa página; el registro no necesita saber de planes por sí mismo a
   menos que se decida marcar herramientas como premium ahí directamente.

## Límites de uso reales — favoritos

Auditado (no supuesto): las 129 herramientas son 100% del lado del
cliente, así que fingir un límite "N usos gratis por día" no tendría
ningún costo de servidor real detrás — sería puro teatro. El único lugar
donde SÍ hay algo real que limitar es **favoritos**, porque ahí sí hay
almacenamiento server-side real de por medio para usuarios autenticados.

- `checkUsageLimit()` (`src/lib/plans/limits.ts`) — función pura: lee un
  límite numérico de `entitlements.metadata[clave]` y lo compara contra un
  conteo actual. Ausente/`null`/no-numérico = ilimitado (nunca un límite
  inventado). Reutilizable para el próximo límite real que aparezca — no
  hay que rediseñar nada, solo llamarla con otra clave.
- Plan Gratis tiene `metadata.favorites_limit = 10` (visitantes anónimos
  siguen sin límite — favoritos anónimos son 100% localStorage, sin costo
  de servidor, y limitarlos ahí solo generaría fricción de registro sin
  ningún ahorro real). Pro/Team no tienen la clave = ilimitados.
- Se aplica en `FavoriteButton` (bloquea agregar más allá del límite, con
  un mensaje breve + link a `/precios` — nunca bloquea quitar) y se
  muestra como "X/10 favoritos" en `/favoritos`.
- El valor de la interfaz llega server-side una sola vez (en
  `getNavAuthState()`, dentro de `layout.tsx`) y se distribuye a
  componentes profundos como `FavoriteButton` (usado en las 129 páginas de
  herramientas) vía `EntitlementsProvider`/`useFavoritesLimit()` — así se
  evita reescribir las 129 páginas para pasar el dato.

Historial de uso real (no fingido) también existe: `UsageTracker` llama a
`increment_tool_usage()` (ya existía en el esquema, ahora se usa de
verdad) para usuarios autenticados — silencioso, nunca bloquea nada, es
puramente analítico. Se muestra en `/cuenta` como perk real de Pro/Team
("Uso de herramientas, últimos 30 días") y alimenta el ranking de
herramientas más usadas en `/admin`.

## Rate limiting

Solo en los Server Actions de autenticación (`signUpAction`,
`signInAction`, `requestPasswordResetAction`) — el vector de abuso real
para este proyecto, dado que las 129 herramientas no tienen costo de
servidor que proteger (ver arriba). Implementado con Postgres (tabla
`rate_limit_events` + función `check_and_record_rate_limit()`, migración
`0004_rate_limiting.sql`) — sin Redis/Upstash, el tráfico actual no lo
justifica. Falla abierto (permite la request) ante cualquier error de
infraestructura — un problema transitorio de Supabase nunca debe bloquear
a un usuario real.

- Registro: 5 intentos/hora por IP (el ataque real es probar muchos
  correos distintos, no repetir uno).
- Login: 10 intentos/15 min por correo (credential stuffing contra una
  cuenta específica).
- Recuperar contraseña: 3/hora por correo (evita bombardear el correo de
  otra persona con enlaces de reseteo).

## Panel de administración (`/admin`)

Solo lectura. Protegido por `ADMIN_EMAILS` (lista de correos separada por
comas, variable de entorno server-only) — deliberadamente no un rol en
base de datos todavía; lo más simple que es real y seguro (nunca llega al
navegador, no puede falsificarse desde el cliente). Un no-admin recibe un
`404` real (no un redirect, que sí confirmaría que la ruta existe).
`robots.txt` además lo excluye de indexación.

Muestra: usuarios totales, MRR estimado (excluye `past_due` — pago no
confirmado), suscripciones personales y de equipo activas por plan,
herramientas más usadas (30 días, solo usuarios registrados), y los
últimos eventos de webhook procesados. Usa el cliente de service role
(`createAdminClient()`) porque agrega datos de todos los usuarios — RLS
por diseño no permitiría esto con el cliente normal.

## Eventos de analítica (funnel real, no inventado)

Vía el mismo GA4 del proyecto (`AnalyticsEvents` en `src/lib/analytics.ts`)
— no se agregó un sistema nuevo. Implementados: `signup_started`,
`signup_completed`, `pricing_viewed`, `paywall_shown` (cuando de verdad se
muestra un paywall, ej. el límite de favoritos), `checkout_started`, y
`checkout_completed` (disparado al volver de la pasarela con
`?checkout=exito` — **representa que el usuario volvió reclamando éxito,
no que la suscripción ya está confirmada activa**, eso solo lo sabe el
webhook).

**Deliberadamente no implementados**: `subscription_active` /
`subscription_cancelled`. Son hechos que solo el webhook conoce — GA4
client-side no tiene forma honesta de dispararlos sin inventar el dato.
Implementarlos de verdad requeriría el GA4 Measurement Protocol
(server-side, necesita otro secreto de API) — no se construyó por no
inventar infraestructura nueva sin que se pidiera explícitamente. Hoy esos
hechos SÍ están disponibles, con datos reales: la tabla `subscriptions` y
`/admin`.

## Endurecimiento de webhooks: orden de entrega

Ni Stripe ni Mercado Pago garantizan que los webhooks lleguen en el orden
en que ocurrieron los eventos. En vez de confiar en el snapshot que trae
cada notificación (que podría estar desactualizado si llegó tarde),
**ambos proveedores siempre vuelven a consultar el estado actual de la
suscripción directamente a la API** antes de escribir en Supabase
(`stripe.subscriptions.retrieve()` / `PreApproval.get()`). Así, sin
importar el orden de entrega — o si el mismo evento llega dos veces — el
resultado siempre converge al estado real más reciente. Ver el comentario
en `stripe-provider.ts` para el detalle.

## Qué falta (no implementado todavía)

- **Ninguna cuenta de Mercado Pago o Stripe configurada todavía** — el
  código de checkout/portal/cancelación/webhook está completo para ambos
  proveedores (incluyendo el endurecimiento de orden de entrega arriba)
  pero no se ha podido probar contra credenciales reales. Ver "Cómo probar
  pagos en modo test" arriba para los pasos exactos una vez exista una
  cuenta.
- **Mercado Pago: dos detalles del SDK sin confirmar contra una respuesta
  real** — si `init_point` es el campo correcto en modo sandbox, y si
  `preapproval_plan_id` realmente viene en la respuesta de
  `PreApproval.get()` (el tipo que expone el SDK no lo declara, aunque la
  API sí debería devolverlo — ver el comentario en
  `mercadopago-provider.ts`).
- **Equipos/workspaces**: el esquema (`workspaces`,
  `workspace_members`, `workspace_invitations`) y la resolución de
  entitlements ya soportan un usuario heredando el plan de su equipo, pero
  no existe todavía la UI para crear un equipo, invitar miembros o
  aceptar/rechazar invitaciones.
- **Reactivar una suscripción cancelada**: deliberadamente no
  implementado — el comportamiento real difiere entre proveedores (Stripe
  sí permite deshacer un `cancel_at_period_end`; Mercado Pago trata
  `cancelled` como terminal) y no quise construir un botón que finja
  funcionar igual en ambos.
- **`rate_limit_events` no tiene limpieza automática** — a este volumen no
  hace falta todavía; si crece, un `pg_cron` que borre filas de más de
  ~1 día es la solución obvia cuando haga falta.
- **Sin rol de administrador real en base de datos** — `ADMIN_EMAILS` es
  correcto para uno o dos operadores; si el equipo crece, migrar a una
  columna `is_admin` + políticas RLS es el siguiente paso natural, no
  antes.

---

# Mercado Pago — estado operativo (agosto 2026)

Precios vigentes, decididos como precios y no como conversión de divisa. Una
cuenta colombiana de Mercado Pago solo puede cobrar COP.

| Plan | Precio | Frecuencia | Plan id en Mercado Pago (TEST) |
|---|---|---|---|
| Pro Mensual | 29.900 COP | 1 mes | `f752a4e49c70436e9c6b4a453035a606` |
| Pro Anual | 299.000 COP | 12 meses | `3d37fa0a6fea499a802aae7b2628ce4b` |
| Team Mensual | 79.900 COP | 1 mes | `fc83cd823f3648c88d159a68ea7fbe44` |

Los ids de plan **no son secretos**. El access token y el webhook secret sí.

## Cómo funciona el checkout (y por qué no puede ser de otra forma)

No se puede crear una suscripción desde el servidor. `POST /preapproval`
responde **`400 card_token_id is required`** en todas sus variantes: el token de
tarjeta lo genera el navegador con MP.js a partir de datos que este servidor
nunca debe ver. La única ruta es el checkout alojado del plan:

```
/precios -> createCheckoutSessionAction(planId, interval)
         -> PreApprovalPlan.get(providerPriceId).init_point
         -> + ?external_reference=<uuid del usuario>
         -> redirect
```

El importe vive en el plan, del lado de Mercado Pago. Nada que envíe este
proceso puede cambiar lo que se cobra.

## Webhook

URL: `/api/webhooks/mercadopago`. Tópicos a registrar:

| Tópico | Qué hacemos |
|---|---|
| `subscription_preapproval` | fuente de verdad del estado de la suscripción |
| `subscription_authorized_payment` | resolvemos la cuota a su suscripción y **releemos** el preapproval |
| `subscription_preapproval_plan` | se registra, no se actúa |
| `payments` | se registra, no se actúa |

**Regla que no se debe romper: el estado de acceso sale del preapproval, nunca
de un pago.** Mercado Pago reintenta un cobro rechazado (estado `recycling`)
hasta 10 días y solo entonces cancela la suscripción. Marcar a alguien como
moroso porque una cuota está reintentándose sería inventar un estado que el
proveedor no reporta, y cortarle el acceso a un usuario que el proveedor sigue
considerando al día. Tras 3 cuotas rechazadas Mercado Pago cancela la
suscripción y eso llega como `subscription_preapproval` — que ya manejamos.

## Renovación fallida: qué pasa exactamente

1. La cuota se rechaza → queda en `recycling`, con hasta 4 reintentos en ~10 días.
2. Durante ese periodo el preapproval sigue `authorized` → **el usuario conserva
   el acceso**. Es la política de Mercado Pago, no una inventada aquí.
3. Si Mercado Pago pausa la suscripción → `paused` → mapeado a `past_due`, que
   `getEntitlements` sigue tratando como activo (periodo de gracia del proveedor).
4. Tras 3 cuotas rechazadas Mercado Pago la cancela → `cancelled` → `canceled`
   → deja de estar en los estados activos → **acceso revocado**.

## Verificación

- `node scripts/mercadopago-setup.mjs` — auditoría; `--create` crea los planes.
- `node scripts/verify-billing-mapping.mjs` — lo que se muestra es lo que se cobra.
- `node scripts/billing-e2e-test.mjs` — ciclo completo contra TEST (43 comprobaciones).

## Puesta en producción

1. Registrar el webhook en el panel de Mercado Pago y copiar su **secret**.
2. `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET` en Vercel.
3. Crear los planes con credenciales de producción (el script se niega a
   hacerlo en una cuenta real sin `--i-understand-this-is-a-real-account`).
4. Un primer cobro real, manual.

## Rollback

Eliminar `MERCADOPAGO_ACCESS_TOKEN` de Vercel y redesplegar. El checkout
redirige a `/precios?error=pagos_no_configurados`; las suscripciones ya
concedidas siguen intactas en la base de datos y el acceso no cambia. El
webhook rechaza todo mientras falte el secret, así que no se corrompe nada.
