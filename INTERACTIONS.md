# Interacciones — sistema de animación e interacción con mouse

Referencia completa del sistema de movimiento de Herramio: qué componentes
existen, cómo funcionan, cómo reutilizarlos, y las reglas de performance y
accesibilidad que todos siguen. Complementa la sección "Sistema de
interacción/movimiento" de [ARCHITECTURE.md](ARCHITECTURE.md), que explica
el porqué arquitectónico (por qué `TiltWrapper` está separado de
`ToolCard`, por ejemplo); este documento es más una guía de uso.

## Regla de oro: nunca `setState` por movimiento del mouse

Ningún componente de esta lista llama a un `setState` de React en cada
`pointermove`. En su lugar:

1. El listener de `pointermove` guarda la posición en un `ref` (no en
   estado) y programa un `requestAnimationFrame` si no hay uno pendiente.
2. Dentro del callback de `requestAnimationFrame`, se escribe directamente
   sobre `element.style.transform` / `element.style.setProperty(...)`.
3. Al desmontar, se cancela cualquier `requestAnimationFrame` pendiente y
   se remueven los listeners.

Esto evita re-renders de React en cada frame — el DOM se actualiza
directamente, que es lo que un navegador puede hacer a 60fps sin esfuerzo.

## Componentes

### `src/lib/motion/preferences.ts`
Dos funciones de gate, ambas basadas en `matchMedia`:
- `prefersFinePointer()` — `(pointer: fine) and (hover: hover)`. Falso en
  touch, tablets sin mouse, etc.
- `prefersReducedMotion()` — `(prefers-reduced-motion: reduce)`.
- `motionEffectsEnabled()` — combina ambas. **Todo** componente de esta
  lista llama a esta función al montar y, si es `false`, ni siquiera
  registra el `pointermove` — cero costo en dispositivos que no lo
  necesitan o no lo quieren.

### `src/lib/motion/motion-math.ts`
Toda la matemática de posición vive aquí como funciones puras, sin DOM ni
React — así se pueden probar con Vitest sin un navegador real (ver
`tests/unit/motion-math.test.ts`, 23 casos). Si agregas un efecto nuevo,
la lógica de cálculo va aquí, no inline en el componente.

| Función | Usada por | Qué hace |
|---|---|---|
| `computeGlowPosition` | `CursorSpotlight` | Posición del puntero → porcentaje del contenedor, para el centro de un `radial-gradient`. |
| `computeProximity` | `HeroBackground` | Distancia a un nodo → valor 0-1 con caída lineal. |
| `nodeStyleForProximity` | `HeroBackground` | Proximidad 0-1 → escala + opacidad del icono. |
| `computeTilt` | `TiltWrapper` | Posición del puntero dentro de una tarjeta → ángulo de inclinación (máx. configurable). |
| `computeMagneticOffset` | `MagneticButton` | Posición del puntero → desplazamiento hacia el cursor, con tope en px. |
| `computeParallaxOffset` | `FloatingToolverse` | Posición del puntero + profundidad de la tarjeta → desplazamiento de paralaje en capas. |

### `src/components/marketing/CursorSpotlight.tsx`
Montado una única vez en `src/app/layout.tsx`. Una luz ambiental de muy
baja opacidad que sigue el cursor por **toda la app** (no solo el Hero).
`position: fixed`, `pointer-events: none`, `z-30` (debajo del navbar y del
buscador). No reemplaza el cursor nativo.

### `src/components/marketing/HeroBackground.tsx`
Fondo del Hero: una rejilla de puntos + una "constelación" de 8 iconos de
categorías que reaccionan de forma sutil (escala + opacidad) cuando el
cursor se acerca. El brillo ambiental global ya lo cubre `CursorSpotlight`
— este componente deliberadamente **no** duplica ese efecto.

### `src/components/marketing/TiltWrapper.tsx` + `ToolCard.tsx`
`ToolCard` es un Server Component (necesita renderizar `tool.icon`, una
referencia a componente, que no puede cruzar el límite Server→Client como
prop). `TiltWrapper` es un Client Component que solo recibe `children` ya
renderizados y les aplica una inclinación 3D sutil (máx. 6°) en hover.
**Si necesitas envolver contenido de un Server Component con un efecto de
mouse nuevo, replica este patrón** — no conviertas el Server Component en
`"use client"` directamente; ver la nota de "Sistema de
interacción/movimiento" en `ARCHITECTURE.md` para el error exacto que eso
produce en build.

### `src/components/ui/MagneticButton.tsx`
Envuelve un botón/link con una atracción magnética sutil (máx. 6px) hacia
el cursor. Usado solo en 2-3 CTAs principales por página (Hero, CTA final,
navbar) — nunca en todos los botones, para que siga sintiéndose premium y
no repetitivo.

### `src/components/marketing/FloatingToolverse.tsx` + `FloatingToolCard.tsx`
El "universo de herramientas" de `/experiencia`: una rejilla de tarjetas
reales con un desplazamiento de paralaje en capas (cada tarjeta tiene una
`depth` distinta, así que no se mueven todas igual) más una posición
vertical estática y determinista (no aleatoria, para que SSR y cliente
coincidan sin parpadeo de hidratación). Mismo split Server/Client que
`ToolCard`/`TiltWrapper` y por la misma razón.

### `src/components/marketing/CategoryHub.tsx`
La sección "Todo en un solo lugar": pestañas de categoría (`role="tab"`)
que cambian un panel central al pasar el mouse **o** al enfocar con
teclado (`onMouseEnter` y `onFocus` disparan el mismo cambio de estado) —
no es un efecto de mouse continuo, es una interacción discreta, así que
usa `useState` normal de React, no el sistema de `motion-math`.

### `src/components/marketing/Reveal.tsx`
Aparición progresiva al hacer scroll, vía `IntersectionObserver` (no una
librería). Anima solo `opacity` y `transform: translateY` — nunca
`display`, para que el contenido siga presente para lectores de pantalla y
crawlers de Google aunque la animación no haya corrido todavía. Soporta
`delay` (ms) para crear efecto stagger en listas.

## Accesibilidad

`prefers-reduced-motion` se respeta en dos capas independientes:
1. **JS**: `motionEffectsEnabled()` evita que se registre cualquier
   listener de mouse.
2. **CSS**: la variante `motion-reduce:` de Tailwind desactiva
   transiciones/transforms residuales incluso si algo se coló por fuera
   del gate de JS.

Ningún wrapper de movimiento (`TiltWrapper`, `MagneticButton`,
`FloatingToolverse`) agrega un `<div>` con `tabIndex` — el elemento
enfocable real (el `<Link>`/`<button>` de adentro) sigue siendo el único
en el orden de tabulación. El contenido revelado en hover (descripción +
CTA de `FloatingToolCard`) usa `opacity`/`max-height`, nunca
`display:none`, así que un lector de pantalla lo anuncia igual sin
necesitar "pasar el mouse".

## Performance

Cero dependencias nuevas para todo este sistema — solo CSS variables,
`transform`, `requestAnimationFrame` y `IntersectionObserver`, todas APIs
nativas del navegador. Ver la sección de load test en
`tests/load/README.md` para confirmar que el trabajo no afecta el
throughput del servidor (es 100% client-side).

## Cómo agregar un efecto de mouse nuevo

1. ¿Es continuo (sigue al cursor todo el tiempo) o discreto (hover/focus
   dispara un cambio de estado puntual)? Continuo → sigue el patrón de
   `rAF` + refs de esta guía. Discreto → `useState` normal está bien (ver
   `CategoryHub`).
2. Si es continuo: escribe el cálculo como función pura en
   `motion-math.ts`, con tests.
3. Gatea con `motionEffectsEnabled()` al montar.
4. Si el componente necesita envolver contenido de un Server Component que
   use iconos/componentes como prop, sepáralo en un wrapper "solo
   `children`" (patrón `TiltWrapper`).
5. Verifica en 375/768/1024/1440px que no rompe el layout, y que
   `prefers-reduced-motion` lo desactiva.
