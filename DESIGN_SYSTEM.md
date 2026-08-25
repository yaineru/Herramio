# Design System

Fuente de verdad de los tokens visuales de Herramio. Todo lo que hay aquí
está **medido en el navegador real**, no estimado.

## Filosofía

Herramio no usa un color de texto más claro que el mínimo accesible. Si un
texto merece estar en pantalla, merece poder leerse. Esa regla es la que
gobierna la paleta, no la estética.

## Tokens (`src/app/globals.css`)

Los tokens se declaran con `@theme` de Tailwind v4, así que **redefinir un
token cambia todas las utilidades que lo usan** — incluidas las 129
páginas de herramientas vía componentes compartidos. Esa es la razón de
resolver los problemas aquí y no en cientos de archivos.

| Token | Valor | Por qué |
|---|---|---|
| `--color-emerald-600` | `#047857` | Verde de marca. El emerald-600 por defecto de Tailwind (`#059669`) mide **3.0:1** contra blanco — falla WCAG AA (4.5:1) tanto como fondo de botón con texto blanco como texto pequeño sobre blanco. `#047857` mide **5.48:1** (verificado en navegador). |
| `--color-emerald-700` | `#065f46` | Estado hover. Va **más oscuro**, no más claro: un hover más claro bajaría el contraste justo cuando el usuario interactúa. |
| `--color-slate-400` | `#64748b` | Texto atenuado. El slate-400 por defecto (`#94a3b8`) mide **2.63:1** — muy por debajo de AA — y estaba usado en **290** sitios con texto real (límites de tamaño, avisos de privacidad, subtítulos). Ahora resuelve al valor de slate-500 (**4.78:1**). |

**Consecuencia deliberada**: `slate-400` y `slate-500` renderizan igual.
Es la decisión de diseño, no un descuido — esta paleta no tiene un color
de texto por debajo del mínimo accesible. Los ~38 usos decorativos
(iconos) quedan levemente más oscuros, lo que solo aumenta visibilidad.

## Auditoría de contraste — resultados medidos

Metodología: script en el navegador real que resuelve **cualquier** color
CSS a sRGB usando canvas (el parseo por string no sirve — Tailwind v4
emite `lab()`/`oklch()`, y un primer intento de medición dio números
basura por eso), calcula el ratio WCAG contra el fondo efectivo
heredado, y aplica el umbral correcto según tamaño y peso de fuente.

| Página | Fallos antes | Fallos después |
|---|---|---|
| Home | 18 | **0** |
| `/precios` | — | **0** |
| `/originalidad` | — | **0** |
| `/favoritos` | — | **0** |
| `/iniciar-sesion` | — | **0** |
| `/pdf-unir` (representa las 129 vía `ToolPageShell`) | 3 | **0** |

Sin overflow horizontal en ninguna, verificado a **320px, 375px, 1280px y
1440px**.

Correcciones puntuales además de los tokens (todas en componentes
compartidos, por lo que aplican a todo el catálogo):

- `ToolCard`: badge de categoría slate-500 → slate-600 (sobre fondo
  slate-100 medía 4.35:1, justo bajo el mínimo).
- `SearchTrigger`: el prompt principal ("¿Qué necesitas hacer?") pasó de
  slate-400 a slate-500.
- `FileDropZone`: el `hint` (que comunica límites de tamaño reales) pasó
  a slate-500.
- `Footer`, `Hero`, `CategoryHub`, `ToolPageShell`: textos atenuados
  subidos a slate-500.

## Lo que NO se pudo verificar

**No hay evaluación estética en este documento.** Las capturas de pantalla
no están disponibles en este entorno (el Browser pane no está visible, y
sin él la página no compone frames). Todo lo anterior es *corrección*
medible — contraste, overflow, jerarquía de encabezados, etiquetas — no
juicio visual sobre si el resultado se ve bien.

Verificado también que **no hay fallo de foco**: una medición inicial
sugirió que los inputs no mostraban anillo de foco, pero resultó ser un
artefacto (`document.hasFocus() === false` porque la ventana del navegador
no está enfocada al no estar visible el panel). Las reglas CSS de
`:focus` y `:focus-visible` existen y se generan correctamente,
confirmado inspeccionando el CSS generado.

## Verificado en producción

Los tokens viajan correctamente al bundle desplegado — confirmado
descargando el CSS del despliegue Preview real de Vercel:

```
--color-emerald-600:#047857
--color-slate-400:#64748b
```
