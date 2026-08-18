# Deployment

## 1. Subir el proyecto a GitHub

```bash
git add .
git commit -m "Initial commit: QR toolkit platform"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

`.gitignore` ya excluye `node_modules`, `.next`, `.env*.local` y demás
archivos temporales — nunca se suben secretos ni credenciales.

## 2. Desplegar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) e importa el repositorio de GitHub.
2. Vercel detecta Next.js automáticamente — no se necesita configuración de build manual.
3. Antes del primer deploy, configura las variables de entorno (Project → Settings → Environment Variables), usando `.env.example` como referencia:
   - `NEXT_PUBLIC_SITE_URL` → tu dominio final (con `https://`)
   - `NEXT_PUBLIC_GA_ID` → tu ID de Google Analytics 4 (opcional al inicio)
   - `NEXT_PUBLIC_ADS_ENABLED` → `false` hasta tener AdSense aprobado
   - Deja `TEST_TRAFFIC` y `ALLOW_LOAD_TEST` en `false` (o sin definir) en Production
4. Despliega. Cada push a `main` genera un deploy de producción; cada Pull Request genera un deploy de preview automático.

## 3. Conectar tu dominio propio

Ya tienes el dominio comprado — esto es lo que debes hacer, sin comprar nada nuevo:

1. En Vercel: **Project → Settings → Domains → Add** y escribe tu dominio (ej. `tudominio.com`).
2. Vercel te mostrará los registros DNS exactos a crear. Generalmente son:
   - **Dominio raíz** (`tudominio.com`): un registro **A** apuntando a `76.76.21.21` (Vercel te confirma la IP exacta en su panel — puede variar).
   - **Subdominio `www`** (`www.tudominio.com`): un registro **CNAME** apuntando a `cname.vercel-dns.com`.
3. Entra al panel de tu proveedor de dominio (donde lo compraste) y crea esos registros exactamente como Vercel los muestra.
4. Espera la propagación DNS (de minutos a un par de horas).
5. Vercel emite el certificado **SSL** automáticamente (Let's Encrypt) en cuanto detecta el DNS correcto — no necesitas hacer nada manual para HTTPS.
6. Verifica que ambos funcionen y redirijan correctamente entre sí (Vercel hace esto automáticamente, normalmente redirigiendo `tudominio.com` → `www.tudominio.com` o viceversa, según cuál marques como dominio primario en el panel de Domains).
7. Actualiza `NEXT_PUBLIC_SITE_URL` en las variables de entorno de producción con tu dominio final y vuelve a desplegar (Redeploy) para que el sitemap, canonical y OG usen la URL correcta.

### Cómo comprobar que todo quedó bien

- Abre `https://tudominio.com` y `https://www.tudominio.com` — ambos deben cargar el sitio con candado (SSL válido).
- Corre `https://www.ssllabs.com/ssltest/` o simplemente revisa el candado del navegador para confirmar el certificado.
- Verifica `https://tudominio.com/sitemap.xml` y `https://tudominio.com/robots.txt` — deben responder con tu dominio real en las URLs listadas.

## 4. Entornos: production, preview, development

- **Production**: rama `main`, dominio real conectado. `NEXT_PUBLIC_ADS_ENABLED` puede activarse aquí una vez AdSense esté aprobado.
- **Preview**: cualquier Pull Request genera una URL única de Vercel — útil para revisar cambios antes de fusionar a `main`. Mantén `ALLOW_LOAD_TEST` y `TEST_TRAFFIC` en `false` salvo que sea un preview dedicado a pruebas de carga (ver `TESTING.md`).
- **Development**: `npm run dev` en tu máquina, usando `.env.local`.

## 5. Después del deploy: Google Search Console

1. Entra a [search.google.com/search-console](https://search.google.com/search-console).
2. Agrega una propiedad de tipo **"Dominio"** (verifica todo el dominio, con y sin `www`) o **"Prefijo de URL"** si prefieres verificar solo `https://www.tudominio.com`.
3. Verifica la propiedad (Search Console te da un registro TXT para agregar en el DNS, o puedes verificar vía meta tag/HTML file si usas prefijo de URL).
4. Una vez verificado, ve a **Sitemaps** en el menú lateral y envía: `https://tudominio.com/sitemap.xml`.
5. Usa **Inspección de URLs** para solicitar la indexación manual de tus páginas más importantes (home, `/generador-qr`, tus herramientas principales) y acelerar el primer rastreo.
