# Branding — Herramio

## Identidad

- **Nombre**: Herramio
- **Tagline principal**: "Todas tus herramientas online, en un solo lugar."
- **Tagline alternativo**: "Herramientas online rápidas, gratis y sin complicaciones."
- **Tono de copy**: directo, humano, útil, simple. Preferir *"Crea tu QR gratis"* sobre *"Soluciones digitales para potenciar tu ecosistema"*.
- **Logomarca**: una "H" geométrica construida con tres rectángulos (dos barras verticales + una horizontal), sobre una tile oscura (`#0f172a`, slate-900). Ver `src/components/BrandMark.tsx` — es la fuente única de verdad, usada en Navbar y Footer.
- **Favicon**: `src/app/icon.svg` (convención de Next.js) y `public/icon.svg` (usado en JSON-LD `Organization.logo` y en el manifest) comparten el mismo diseño que `BrandMark`. Si cambias el logo, actualiza los tres lugares.
- **Color de acento**: se mantiene `emerald-600` para CTAs, enlaces y estados activos — el logo es oscuro/neutro, el acento de color vive en la interfaz, no en la marca.

## Dónde vive la configuración de marca

Todo el texto de marca sale de **una sola fuente**: `src/lib/site.ts` (`SITE.name`, `SITE.tagline`, `SITE.description`, `SITE.url`). Ningún componente debería tener "Herramio" escrito a mano — si necesitas el nombre del sitio en un componente nuevo, impórtalo de `SITE.name`.

Dos excepciones documentadas que si tienen el dominio/nombre escrito porque son placeholders que debes actualizar manualmente antes de producción:

- `src/components/ContactForm.tsx` — `CONTACT_EMAIL = "hola@herramio.app"`
- `.env.example` / `NEXT_PUBLIC_SITE_URL` — apunta a `https://www.herramio.app` hasta que conectes el dominio real

## Historial de marca

El proyecto se lanzó originalmente como **QRFacil**, una plataforma enfocada solo en códigos QR. Se re-marcó a **Herramio** para reflejar la visión de una plataforma de herramientas online que crece más allá de QR (PDF, imágenes, calculadoras, convertidores, texto). La arquitectura de generación de QR no cambió — solo la marca y la navegación alrededor de ella.

## Cómo evitar que vuelva a aparecer una marca vieja

Antes de cualquier release, corre:

```bash
grep -rn "QRFacil\|qrfacil" src public *.md
```

Los únicos resultados esperados son menciones históricas en la documentación (como este archivo), nunca en `src/` ni `public/`.
