# Estrategia de contenido y crecimiento

Este documento cubre cómo llevar tráfico **real** (no artificial) a
Herramio desde SEO y redes sociales, y da 30 ideas de video corto listas
para grabar, priorizadas por facilidad de demostración y por herramienta
ya existente en producción.

## Reglas de crecimiento (no negociables)

- Nunca comprar seguidores, vistas, likes o tráfico.
- Nunca usar bots para inflar métricas de ninguna red o de Analytics.
- Cada pieza de contenido debe demostrar la herramienta funcionando de
  verdad — el "wow" viene de ver el QR escanearse en cámara, no de edición.
- Usa siempre `?ref=` en los enlaces que compartas por plataforma (ver
  abajo) para medir qué canal realmente convierte, sin inventar números.
- No se publica contenido (blog, video, pin) sobre una herramienta que no
  existe todavía. Ver "programmatic SEO" más abajo.

## Atribución con `?ref=`

El sitio ya captura el parámetro `ref` de la URL (`src/components/ReferralTracker.tsx`)
y lo reporta como evento `campaign_landing` en GA4. Usa siempre:

| Canal      | Enlace de ejemplo                          |
| ---------- | ------------------------------------------- |
| TikTok     | `https://www.herramio.com/?ref=tiktok`      |
| Instagram  | `https://www.herramio.com/?ref=instagram`   |
| YouTube    | `https://www.herramio.com/?ref=youtube`     |
| Facebook   | `https://www.herramio.com/?ref=facebook`    |
| Pinterest  | `https://www.herramio.com/?ref=pinterest`   |
| Reddit     | `https://www.herramio.com/?ref=reddit`      |
| Blog       | `https://www.herramio.com/?ref=blog`        |

Revisa en GA4 (Informes → Interacción → Eventos → `campaign_landing`) qué
canal trae más usuarios y cuáles de ellos llegan a generar un QR
(`qr_generated`) — esa es la métrica que importa, no solo las vistas. Ver
`MEASUREMENT.md` para el sistema de medición completo, incluyendo qué
herramientas generan más tráfico.

## Long-tail keywords (por qué importan más que las genéricas)

Competir por "QR" o "PDF" a secas es prácticamente imposible para un sitio
nuevo — son términos dominados por dominios con años de autoridad. La
estrategia real es **long-tail**: frases de 4+ palabras con intención
específica, donde hay menos competencia y la persona que busca ya sabe
exactamente qué quiere hacer (convierte mejor).

Ejemplos de long-tail ya cubiertos por el contenido actual:
- "cómo crear un código qr de whatsapp con mensaje" (vs. solo "qr whatsapp")
- "cómo compartir wifi sin decir la contraseña" (vs. solo "qr wifi")
- "cómo poner un qr en el menú de mi restaurante" (vs. solo "qr menú")

Cuando se agreguen herramientas nuevas (ver `GROWTH-ROADMAP.md`), cada
artículo de blog debe apuntar a una frase long-tail específica, no al
nombre genérico de la categoría.

## Programmatic SEO — solo con contenido realmente útil

Herramio **no** genera páginas en masa cambiando una sola palabra. Antes de
crear una página nueva (herramienta o artículo), debe cumplir:

1. Hay una intención de búsqueda real y específica detrás.
2. La página ofrece algo que las páginas existentes no ofrecen (no es una
   URL más apuntando a la misma lógica sin diferenciación real).
3. El contenido (explicación, FAQ, ejemplos) es específico de esa página,
   no una plantilla con find-and-replace del nombre.

Esto ya está documentado en detalle en `SEO.md` — se repite aquí porque
aplica igual de fuerte al plan de contenido en redes: no se hacen 50
videos casi idénticos cambiando solo el nombre de la herramienta; cada
video demuestra un caso de uso real y distinto.

## Estrategia por plataforma

### TikTok

- **Frecuencia**: 4-5 videos/semana al inicio.
- **Tipo**: demostraciones rápidas de una sola herramienta, cara a cámara o
  solo pantalla + manos.
- **Duración**: 15-30 segundos.
- **Hook**: en los primeros 2 segundos, mostrar el problema o el resultado
  final (el teléfono conectándose al WiFi, el QR escaneándose).
- **CTA**: siempre verbal + en texto en pantalla: "Créalo gratis, link en bio".

### Instagram Reels

- **Frecuencia**: 3-4/semana, reutilizando el mismo video de TikTok con
  pequeños ajustes (formato, texto en pantalla más limpio).
- **Tipo**: mismo contenido que TikTok + carruseles educativos ("5 usos de
  un QR que no conocías") como formato complementario.
- **CTA**: "Link en bio" + sticker de enlace si la cuenta lo permite.

### YouTube Shorts

- **Frecuencia**: 3/semana.
- **Tipo**: los mismos videos verticales, con un título optimizado a
  búsqueda ("Cómo hacer un QR de WiFi gratis") ya que Shorts también indexa
  en búsqueda de YouTube.
- **CTA**: enlace en la descripción con `?ref=youtube`.

### Facebook Reels / Grupos

- **Frecuencia**: 2-3/semana, resubiendo el mismo contenido.
- **Tipo**: prioriza los casos de uso de negocio (restaurantes, WiFi,
  WhatsApp Business) — la audiencia de Facebook suele ser más orientada a
  negocios locales y adultos.
- **Extra**: comparte en grupos relevantes de emprendimiento/restaurantes
  cuando el contenido aporte valor real (no spam).

### Pinterest

- **Frecuencia**: 3-5 pines/semana.
- **Tipo**: pines estáticos o de video corto con diseño tipo infografía
  ("Cómo compartir tu WiFi sin decir la contraseña"), enlazando al artículo
  de blog correspondiente (mejor que a la home, por relevancia temática).
- **CTA**: el pin debe funcionar como miniatura de blog — Pinterest premia
  contenido evergreen tipo "cómo hacer".

### Reddit (cuando sea apropiado)

Reddit **castiga** el autopromocionarse sin aportar — úsalo distinto a las
demás redes:

- Nunca postear un link directo a Herramio como primer mensaje en un
  subreddit nuevo.
- Participa primero en subreddits relevantes (r/smallbusiness, r/InternetIsBeautiful,
  r/webdev, r/framemakers de nicho local) respondiendo preguntas reales
  donde una herramienta de Herramio sea genuinamente la mejor respuesta.
- `r/InternetIsBeautiful` específicamente premia herramientas gratuitas
  bien hechas sin login — encaja con el producto, pero solo postea ahí
  cuando el sitio ya tenga tráfico orgánico y reseñas/uso real detrás, no
  el primer día.
- Nunca uses varias cuentas para votar tu propio post (vote manipulation)
  — es detectable y puede banear el dominio de Reddit permanentemente.

## 30 ideas de video corto

Formato: **Hook → Problema → Demo → Resultado → CTA → Herramienta**.
Todas apuntan a herramientas que **ya existen** en producción hoy.

### QR de WhatsApp (`/qr-whatsapp`)

1. **Hook**: "Deja de decirle tu número a cada cliente." **Problema**: dar el número en voz alta es lento y se puede anotar mal. **Demo**: generar un QR de WhatsApp con mensaje predefinido y escanearlo con otro celular. **Resultado**: el chat se abre con el mensaje ya escrito. **CTA**: "Créalo gratis en Herramio, link en bio." **Herramienta**: QR de WhatsApp.
2. **Hook**: "Así reciben pedidos los restaurantes sin dar su número." **Problema**: clientes que no saben cómo contactar por WhatsApp. **Demo**: pegar el QR en una mesa y escanearlo. **Resultado**: mensaje de pedido predefinido enviado en 2 segundos. **CTA**: "Tu QR de pedidos, gratis." **Herramienta**: QR de WhatsApp.
3. **Hook**: "El error que cometen los freelancers en su tarjeta de presentación." **Problema**: tarjetas con número de teléfono que nadie marca. **Demo**: reemplazar el número por un QR de WhatsApp en la tarjeta. **Resultado**: el cliente escanea y escribe al instante. **CTA**: "Genera el tuyo en 10 segundos." **Herramienta**: QR de WhatsApp.
4. **Hook**: "POV: tu cliente quiere reservar mesa a las 11pm." **Problema**: nadie contesta llamadas a esa hora. **Demo**: QR de WhatsApp con mensaje "Quiero reservar una mesa para...". **Resultado**: mensaje queda esperando, se responde en la mañana. **CTA**: "Actívalo en tu restaurante hoy." **Herramienta**: QR de WhatsApp.

### QR de WiFi (`/qr-wifi`)

5. **Hook**: "¿Todavía dictas la contraseña de tu WiFi letra por letra?" **Problema**: deletrear contraseñas largas a cada visita. **Demo**: crear QR WiFi con esa contraseña. **Resultado**: escanear y conectarse al instante, sin escribir nada. **CTA**: "Créalo gratis en Herramio." **Herramienta**: QR de WiFi.
6. **Hook**: "Así se ve un Airbnb bien preparado." **Problema**: huéspedes que llegan y no saben la clave del WiFi. **Demo**: marco con QR de WiFi en la mesa de noche. **Resultado**: conexión automática al llegar. **CTA**: "Ideal para anfitriones, gratis." **Herramienta**: QR de WiFi.
7. **Hook**: "La cafetería que nunca más tiene que repetir la contraseña." **Problema**: empleados repitiendo la clave del WiFi todo el día. **Demo**: sticker con QR en el mostrador. **Resultado**: clientes se conectan solos. **CTA**: "Hazlo en tu negocio, gratis." **Herramienta**: QR de WiFi.
8. **Hook**: "Mi contraseña de WiFi tiene 20 caracteres random a propósito." **Problema**: imposible de dictar o escribir sin errores. **Demo**: generar QR con esa contraseña compleja. **Resultado**: se conecta perfecto al primer escaneo. **CTA**: "No vuelvas a escribir una contraseña de WiFi." **Herramienta**: QR de WiFi.

### QR para restaurantes / menú (`/qr-menu`)

9. **Hook**: "Así se ve un menú que nunca se queda desactualizado." **Problema**: reimprimir la carta cada vez que suben los precios. **Demo**: QR de menú apuntando a una página web editable. **Resultado**: cambio de precio reflejado al instante, sin reimprimir. **CTA**: "Crea tu QR de menú gratis." **Herramienta**: QR de menú.
10. **Hook**: "El menú QR bien hecho vs. el mal hecho." **Problema**: QR minúsculo, sin contraste, imposible de escanear. **Demo**: comparar un QR mal generado con uno personalizado y bien dimensionado desde el editor de Herramio. **Resultado**: el bien hecho escanea al instante desde lejos. **CTA**: "Personaliza el tuyo gratis." **Herramienta**: QR de menú.
11. **Hook**: "Cuánto cuesta imprimir 50 cartas nuevas... o $0." **Problema**: el costo de reimpresión cada temporada. **Demo**: mostrar el ahorro con un menú QR editable. **Resultado**: cero costo de impresión futura. **CTA**: "Digitaliza tu menú gratis." **Herramienta**: QR de menú.

### QR de Instagram / Facebook (`/qr-instagram`, `/qr-facebook`)

12. **Hook**: "Cómo conseguir seguidores reales desde tu local físico." **Problema**: clientes que no buscan tu cuenta después de salir. **Demo**: QR de Instagram en el mostrador o la bolsa de compra. **Resultado**: seguidor nuevo antes de salir de la tienda. **CTA**: "Genera tu QR de Instagram gratis." **Herramienta**: QR de Instagram.
13. **Hook**: "El error de poner tu usuario de Instagram como texto en el cartel." **Problema**: la gente escribe mal el usuario y no te encuentra. **Demo**: reemplazar el texto por un QR escaneable. **Resultado**: cero margen de error al llegar al perfil correcto. **CTA**: "Genera tu QR de Instagram gratis." **Herramienta**: QR de Instagram.
14. **Hook**: "Así un food truck se llenó de reseñas en Facebook." **Problema**: pedir reseñas verbalmente casi nunca funciona. **Demo**: QR en el ticket de compra que lleva a la página de Facebook. **Resultado**: más interacciones después de cada venta. **CTA**: "Empieza gratis hoy." **Herramienta**: QR de Facebook.

### QR de Google Maps (`/qr-google-maps`)

15. **Hook**: "Deja de explicar cómo llegar por WhatsApp." **Problema**: direcciones mal explicadas que hacen perder clientes. **Demo**: QR que abre Google Maps directo en la ubicación del negocio. **Resultado**: ruta calculada al instante desde el celular del cliente. **CTA**: "Genera tu QR de ubicación gratis." **Herramienta**: QR de Google Maps.
16. **Hook**: "Cómo evitar que la gente se pierda llegando a tu evento." **Problema**: invitados perdidos preguntando por WhatsApp el día del evento. **Demo**: QR de ubicación en la invitación impresa. **Resultado**: todos llegan usando la app de mapas. **CTA**: "Créalo gratis para tu próximo evento." **Herramienta**: QR de Google Maps.

### QR de negocios (`/qr-negocio`)

17. **Hook**: "Un solo QR para todo tu negocio." **Problema**: tener que elegir entre poner tu web, tu Instagram o tu WhatsApp en un cartel pequeño. **Demo**: QR apuntando a una página de enlaces con todo reunido. **Resultado**: el cliente elige qué canal usar desde un solo escaneo. **CTA**: "Créalo gratis en Herramio." **Herramienta**: QR de negocio.
18. **Hook**: "El QR que deberías tener en tu factura." **Problema**: facturas que terminan en la basura sin generar ningún seguimiento. **Demo**: QR de negocio impreso en el recibo. **Resultado**: cliente vuelve a contactar fácilmente. **CTA**: "Genera el tuyo gratis." **Herramienta**: QR de negocio.

### QR de tarjetas de presentación / vCard (`/qr-vcard`)

19. **Hook**: "Deja de quedarte sin tarjetas de presentación." **Problema**: tarjetas físicas que se acaban o se pierden. **Demo**: QR de vCard que guarda el contacto directo en el celular de quien escanea. **Resultado**: contacto guardado sin escribir nada. **CTA**: "Crea tu QR de contacto gratis." **Herramienta**: QR de vCard.
20. **Hook**: "Cómo hacer networking sin apps raras de intercambio de contacto." **Problema**: apps de terceros que ambas personas necesitan instalar. **Demo**: mostrar el QR de vCard desde la pantalla del celular en un evento. **Resultado**: cualquier cámara nativa lo reconoce, sin apps. **CTA**: "Genera el tuyo gratis." **Herramienta**: QR de vCard.
21. **Hook**: "Cómo dejar tu contacto en 2 segundos en una entrevista de trabajo." **Problema**: no siempre hay tiempo de intercambiar datos formalmente. **Demo**: QR de vCard en el CV impreso. **Resultado**: el reclutador guarda el contacto al instante. **CTA**: "Agrégalo gratis a tu CV." **Herramienta**: QR de vCard.

### QR de email y SMS (`/qr-email`, `/qr-sms`)

22. **Hook**: "El QR que le ahorra a tu cliente escribir tu correo completo." **Problema**: correos largos que se escriben mal desde el celular. **Demo**: QR de email con destinatario y asunto ya cargados. **Resultado**: correo listo para enviar en un toque. **CTA**: "Créalo gratis en Herramio." **Herramienta**: QR de email.
23. **Hook**: "Cómo captar leads en una feria sin pedir que llenen un formulario." **Problema**: formularios largos que la gente no completa en un stand. **Demo**: QR de SMS con mensaje predefinido tipo "Quiero más información". **Resultado**: mensaje enviado en segundos, sin fricción. **CTA**: "Pruébalo gratis en tu próximo evento." **Herramienta**: QR de SMS.

### QR de teléfono, texto y URL (`/qr-telefono`, `/qr-texto`, `/qr-url`)

24. **Hook**: "El detalle que le falta a los carteles de 'se vende'." **Problema**: nadie anota un número de teléfono al pasar en carro. **Demo**: QR de llamada en el cartel. **Resultado**: la llamada se inicia con un solo escaneo, sin anotar nada. **CTA**: "Créalo gratis en Herramio." **Herramienta**: QR de teléfono.
25. **Hook**: "Cómo dar instrucciones sin que se pierda el papel." **Problema**: instrucciones en papel que se manchan o se pierden. **Demo**: QR de texto con las instrucciones completas. **Resultado**: el texto aparece en pantalla al instante, sin depender del papel. **CTA**: "Créalo gratis en Herramio." **Herramienta**: QR de texto.
26. **Hook**: "El QR que debería tener cada empaque de producto." **Problema**: cliente que compra y no tiene forma fácil de llegar a la tienda online. **Demo**: QR de URL apuntando a la tienda, pegado en el empaque. **Resultado**: escanea y compra de nuevo en segundos. **CTA**: "Créalo gratis en Herramio." **Herramienta**: QR de URL.

### Comparativas y contenido educativo (no ligado a un solo QR)

27. **Hook**: "3 errores que hacen que tu QR no escanee (y cómo evitarlos)." **Problema**: QR mal generados que frustran al usuario final. **Demo**: mostrar en Herramio cómo ajustar contraste, tamaño y corrección de errores. **Resultado**: QR legible desde cualquier distancia. **CTA**: "Genera el tuyo bien hecho, gratis." **Herramienta**: Generador de QR (`/generador-qr`).
28. **Hook**: "¿Sabías que puedes ponerle tu logo a un QR sin que deje de funcionar?" **Problema**: la gente cree que agregar un logo rompe el QR. **Demo**: subir un logo en el panel de personalización y escanear el resultado. **Resultado**: el QR sigue funcionando gracias a la corrección de errores alta. **CTA**: "Pruébalo gratis en Herramio." **Herramienta**: Generador de QR (`/generador-qr`).
29. **Hook**: "PNG vs. SVG: cuál usar para tu QR impreso." **Problema**: elegir mal el formato arruina la impresión grande. **Demo**: comparar un QR en PNG ampliado (pixelado) contra el mismo en SVG (nítido). **Resultado**: SVG se ve perfecto a cualquier tamaño. **CTA**: "Descarga el tuyo en el formato correcto, gratis." **Herramienta**: Generador de QR (`/generador-qr`).
30. **Hook**: "Todas las formas de compartir tu negocio con un solo escaneo." **Problema**: no saber cuál de las herramientas de Herramio usar para cada caso. **Demo**: recorrido rápido por 4-5 herramientas QR distintas (WhatsApp, Maps, negocio, vCard) en un mismo local ficticio. **Resultado**: el espectador entiende cuál usar según su necesidad. **CTA**: "Explora todas las herramientas gratis en Herramio." **Herramienta**: `/herramientas`.

## Cómo priorizar

Empieza por WhatsApp y WiFi (#1-8): son las de mayor volumen de búsqueda y
las más fáciles de demostrar en video (resultado visual inmediato: el
teléfono conectándose o el chat abriéndose). No necesitas 30 formatos de
producción distintos — necesitas encontrar 3-4 hooks que funcionen y
repetir la fórmula variando el caso de uso y la herramienta.

Cuando se agreguen las primeras herramientas fuera de QR (ver "Primeras 10
herramientas recomendadas" en `GROWTH-ROADMAP.md`), este documento debe
actualizarse con nuevas ideas específicas para esas herramientas —
nunca reciclar un hook de QR cambiando solo el nombre.
