# Estrategia de contenido y crecimiento

Este documento cubre cómo llevar tráfico **real** (no artificial) a
Herramio desde redes sociales y búsqueda orgánica, y da 50 ideas de video
corto listas para grabar.

## Reglas de crecimiento (no negociables)

- Nunca comprar seguidores, vistas, likes o tráfico.
- Nunca usar bots para inflar métricas de ninguna red o de Analytics.
- Cada pieza de contenido debe demostrar la herramienta funcionando de
  verdad — el "wow" viene de ver el QR escanearse en cámara, no de edición.
- Usa siempre `?ref=` en los enlaces que compartas por plataforma (ver
  abajo) para medir qué canal realmente convierte, sin inventar números.

## Atribución con `?ref=`

El sitio ya captura el parámetro `ref` de la URL (`src/components/ReferralTracker.tsx`)
y lo reporta como evento `campaign_landing` en GA4. Usa siempre:

| Canal      | Enlace de ejemplo                          |
| ---------- | ------------------------------------------- |
| TikTok     | `https://tudominio.com/?ref=tiktok`         |
| Instagram  | `https://tudominio.com/?ref=instagram`      |
| YouTube    | `https://tudominio.com/?ref=youtube`        |
| Facebook   | `https://tudominio.com/?ref=facebook`       |
| Blog       | `https://tudominio.com/?ref=blog`           |

Revisa en GA4 (Informes → Interacción → Eventos → `campaign_landing`) qué
canal trae más usuarios y cuáles de ellos llegan a generar un QR
(`qr_generated`) — esa es la métrica que importa, no solo las vistas.

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

## 50 ideas de video corto

Formato: **Hook → Problema → Demo → Resultado → CTA**.

### QR de WhatsApp

1. **Hook**: "Deja de decirle tu número a cada cliente." **Problema**: dar el número en voz alta es lento y se puede anotar mal. **Demo**: generar un QR de WhatsApp con mensaje predefinido y escanearlo con otro celular. **Resultado**: el chat se abre con el mensaje ya escrito. **CTA**: "Créalo gratis en Herramio, link en bio."
2. **Hook**: "Así reciben pedidos los restaurantes sin dar su número." **Problema**: clientes que no saben cómo contactar por WhatsApp. **Demo**: pegar el QR en una mesa y escanearlo. **Resultado**: mensaje de pedido predefinido enviado en 2 segundos. **CTA**: "Tu QR de pedidos, gratis."
3. **Hook**: "El error que cometen los freelancers en su tarjeta de presentación." **Problema**: tarjetas con número de teléfono que nadie marca. **Demo**: reemplazar el número por un QR de WhatsApp en la tarjeta. **Resultado**: el cliente escanea y escribe al instante. **CTA**: "Genera el tuyo en 10 segundos."
4. **Hook**: "Cómo conseguir clientes en una feria sin repartir tarjetas." **Problema**: las tarjetas se pierden o se tiran. **Demo**: cartel con QR de WhatsApp en el stand. **Resultado**: decenas de chats iniciados en un día de feria. **CTA**: "Pruébalo gratis antes de tu próximo evento."
5. **Hook**: "POV: tu cliente quiere reservar mesa a las 11pm." **Problema**: nadie contesta llamadas a esa hora. **Demo**: QR de WhatsApp con mensaje "Quiero reservar una mesa para...". **Resultado**: mensaje queda esperando, se responde en la mañana. **CTA**: "Actívalo en tu restaurante hoy."

### QR de WiFi

6. **Hook**: "¿Sabías que puedes compartir tu WiFi sin decir la contraseña?" **Problema**: deletrear contraseñas largas a cada visita. **Demo**: generar el QR de WiFi y escanearlo con la cámara del celular. **Resultado**: el teléfono se conecta solo. **CTA**: "Créalo gratis en Herramio."
7. **Hook**: "Así se ve un Airbnb bien preparado." **Problema**: huéspedes que llegan y no saben la clave del WiFi. **Demo**: marco con QR de WiFi en la mesa de noche. **Resultado**: conexión automática al llegar. **CTA**: "Ideal para anfitriones, gratis."
8. **Hook**: "La cafetería que nunca más tiene que repetir la contraseña." **Problema**: empleados repitiendo la clave del WiFi todo el día. **Demo**: sticker con QR en el mostrador. **Resultado**: clientes se conectan solos. **CTA**: "Hazlo en tu negocio, gratis."
9. **Hook**: "Mi contraseña de WiFi tiene 20 caracteres random." **Problema**: imposible de dictar o escribir sin errores. **Demo**: generar QR con esa contraseña compleja. **Resultado**: se conecta perfecto al primer escaneo. **CTA**: "No vuelvas a escribir una contraseña de WiFi."
10. **Hook**: "Cómo preparar tu casa para cuando llega la familia en diciembre." **Problema**: cada visita pregunta la clave del WiFi. **Demo**: imprimir un QR de WiFi y pegarlo junto al router. **Resultado**: todos se conectan sin preguntar. **CTA**: "Prepáralo gratis antes de las visitas."

### QR para restaurantes

11. **Hook**: "Así se ve un menú que nunca se queda desactualizado." **Problema**: reimprimir la carta cada vez que suben los precios. **Demo**: QR de menú apuntando a una página web editable. **Resultado**: cambio de precio reflejado al instante, sin reimprimir. **CTA**: "Crea tu QR de menú gratis."
12. **Hook**: "El menú QR bien hecho vs. el mal hecho." **Problema**: QR minúsculo, sin contraste, imposible de escanear. **Demo**: comparar un QR mal generado con uno personalizado y bien dimensionado. **Resultado**: el bien hecho escanea al instante desde lejos. **CTA**: "Personaliza el tuyo gratis."
13. **Hook**: "Cuánto cuesta imprimir 50 cartas nuevas... o $0." **Problema**: el costo de reimpresión cada temporada. **Demo**: mostrar el ahorro con un menú QR editable. **Resultado**: cero costo de impresión futura. **CTA**: "Digitaliza tu menú gratis."
14. **Hook**: "El detalle que hace ver profesional a un restaurante pequeño." **Problema**: cartas plastificadas gastadas o manchadas. **Demo**: atril con QR minimalista en la mesa. **Resultado**: experiencia limpia y moderna para el cliente. **CTA**: "Pruébalo gratis en tu negocio."
15. **Hook**: "Así resolví las alergias alimentarias en mi restaurante." **Problema**: preguntas constantes sobre ingredientes. **Demo**: menú digital con QR que incluye información de alérgenos. **Resultado**: el cliente resuelve la duda solo, sin interrumpir al mesero. **CTA**: "Crea tu QR de menú ahora."

### QR de Instagram

16. **Hook**: "Cómo conseguir seguidores reales desde tu local físico." **Problema**: clientes que no buscan tu cuenta después de salir. **Demo**: QR de Instagram en el mostrador o la bolsa de compra. **Resultado**: seguidor nuevo antes de salir de la tienda. **CTA**: "Genera tu QR de Instagram gratis."
17. **Hook**: "El QR que deberías tener en tu empaque." **Problema**: el cliente se lleva el producto y se olvida de seguirte. **Demo**: pegar el QR en el empaque y escanearlo. **Resultado**: perfil de Instagram abierto al instante. **CTA**: "Créalo en segundos, gratis."
18. **Hook**: "Así conseguí que mi stand en la feria destacara." **Problema**: nadie recuerda buscarte después del evento. **Demo**: cartel con QR de Instagram grande y visible. **Resultado**: seguidores nuevos capturados en el momento. **CTA**: "Prepara el tuyo para tu próximo evento."
19. **Hook**: "El error de poner tu usuario de Instagram como texto." **Problema**: la gente escribe mal el usuario y no te encuentra. **Demo**: reemplazar el texto por un QR escaneable. **Resultado**: cero margen de error al llegar al perfil correcto. **CTA**: "Genera tu QR de Instagram gratis."
20. **Hook**: "Cómo un food truck se llenó de reseñas en Instagram." **Problema**: pedir reseñas verbalmente casi nunca funciona. **Demo**: QR en el ticket de compra que lleva al perfil. **Resultado**: más interacciones después de cada venta. **CTA**: "Empieza gratis hoy."

### QR de Google Maps

21. **Hook**: "Deja de explicar cómo llegar por WhatsApp." **Problema**: direcciones mal explicadas que hacen perder clientes. **Demo**: QR que abre Google Maps directo en la ubicación. **Resultado**: ruta calculada al instante desde el celular del cliente. **CTA**: "Genera tu QR de ubicación gratis."
22. **Hook**: "El detalle que le falta a tu tarjeta de presentación." **Problema**: nadie escribe una dirección a mano desde una tarjeta. **Demo**: QR de ubicación al reverso de la tarjeta. **Resultado**: cliente llega sin perderse. **CTA**: "Agrégalo gratis a tu tarjeta."
23. **Hook**: "Cómo evitar que la gente se pierda llegando a tu evento." **Problema**: invitados perdidos preguntando por WhatsApp el día del evento. **Demo**: QR de ubicación en la invitación impresa. **Resultado**: todos llegan usando la app de mapas. **CTA**: "Créalo gratis para tu próximo evento."
24. **Hook**: "Así en un volante puedes ahorrarte un párrafo de direcciones." **Problema**: instrucciones de "dos cuadras después del semáforo" que confunden. **Demo**: reemplazar el texto por un QR de Maps. **Resultado**: llegada exacta sin ambigüedad. **CTA**: "Pruébalo gratis."
25. **Hook**: "El QR que todo local debería tener en la puerta." **Problema**: clientes que pasan de largo sin encontrar la entrada correcta. **Demo**: QR en la fachada enlazando a la ficha de Google Maps. **Resultado**: más reseñas y visitas repetidas encontrando el negocio fácil. **CTA**: "Créalo gratis en Herramio."

### QR para eventos

26. **Hook**: "Cómo organizar una boda sin perder invitaciones de papel." **Problema**: invitados que pierden la tarjeta con la info del evento. **Demo**: QR en la invitación con ubicación y detalles. **Resultado**: toda la info accesible aunque se pierda el papel. **CTA**: "Crea el QR de tu evento gratis."
27. **Hook**: "El truco para que nadie llegue tarde a tu evento." **Problema**: gente preguntando la dirección el mismo día. **Demo**: QR de Maps compartido en el grupo de WhatsApp del evento. **Resultado**: todos llegan a tiempo sin preguntar. **CTA**: "Pruébalo gratis para tu próximo evento."
28. **Hook**: "Cómo cobrar rifas o donaciones en un evento sin efectivo." **Problema**: no todos llevan efectivo encima. **Demo**: QR de WhatsApp para coordinar pagos o info de transferencia. **Resultado**: proceso más rápido y sin fricción. **CTA**: "Genera el tuyo gratis."
29. **Hook**: "Así comparto la lista de regalos sin mandar 50 mensajes." **Problema**: reenviar el mismo link de regalos a cada invitado. **Demo**: QR en la invitación que lleva directo a la lista. **Resultado**: cada invitado accede solo, cuando quiere. **CTA**: "Créalo gratis para tu evento."
30. **Hook**: "El gafete de evento que sí sirve para hacer contactos." **Problema**: intercambiar tarjetas de papel que se pierden. **Demo**: QR de vCard impreso en el gafete del evento. **Resultado**: contacto guardado al instante entre asistentes. **CTA**: "Crea tu QR de contacto gratis."

### QR para negocios

31. **Hook**: "Un solo QR para todo tu negocio." **Problema**: tener que elegir entre poner tu web, tu Instagram o tu WhatsApp. **Demo**: QR apuntando a una página de enlaces con todo reunido. **Resultado**: el cliente elige qué canal usar desde un solo escaneo. **CTA**: "Créalo gratis en Herramio."
32. **Hook**: "Cómo un negocio pequeño se ve más profesional en 5 minutos." **Problema**: material impreso sin ningún canal digital claro. **Demo**: agregar un QR de negocio al empaque o recibo. **Resultado**: presencia digital inmediata sin rediseñar nada. **CTA**: "Pruébalo gratis hoy."
33. **Hook**: "El QR que deberías tener en tu factura." **Problema**: facturas que terminan en la basura sin generar ningún seguimiento. **Demo**: QR de negocio o WhatsApp impreso en el recibo. **Resultado**: cliente vuelve a contactar fácilmente. **CTA**: "Genera el tuyo gratis."
34. **Hook**: "Cómo capturar clientes desde un anuncio impreso en la calle." **Problema**: anuncios impresos que no generan ninguna acción medible. **Demo**: QR de negocio con `?ref=` para medir cuántos escanean. **Resultado**: datos reales de cuántas personas respondieron al anuncio. **CTA**: "Mide tu próximo volante, gratis."
35. **Hook**: "El error de poner solo tu nombre de negocio en la vitrina." **Problema**: pasar de largo sin saber cómo contactar. **Demo**: QR en la vitrina con acceso directo a WhatsApp o redes. **Resultado**: contacto inmediato incluso fuera de horario de atención. **CTA**: "Créalo gratis en minutos."

### QR de tarjetas de presentación

36. **Hook**: "Deja de quedarte sin tarjetas de presentación." **Problema**: tarjetas físicas que se acaban o se pierden. **Demo**: QR de vCard que guarda el contacto directo en el celular. **Resultado**: contacto guardado sin escribir nada. **CTA**: "Crea tu QR de contacto gratis."
37. **Hook**: "El upgrade de tu tarjeta de presentación de toda la vida." **Problema**: tarjetas de papel que la gente tira sin guardar el contacto. **Demo**: agregar un QR vCard a la tarjeta física. **Resultado**: el contacto queda guardado digitalmente al instante. **CTA**: "Actualízala gratis hoy."
38. **Hook**: "Cómo hacer networking sin apps raras de intercambio de contacto." **Problema**: apps de terceros que ambas personas necesitan instalar. **Demo**: mostrar el QR de vCard desde la pantalla del celular. **Resultado**: cualquier cámara nativa lo reconoce, sin apps. **CTA**: "Genera el tuyo gratis."
39. **Hook**: "El detalle que hace ver senior a un freelancer junior." **Problema**: compartir contacto de forma improvisada (foto de pantalla, dictado). **Demo**: mostrar un QR de vCard profesional en el firma de correo. **Resultado**: percepción de marca personal más sólida. **CTA**: "Créalo gratis en Herramio."
40. **Hook**: "Cómo dejar tu contacto en 2 segundos en una entrevista de trabajo." **Problema**: no siempre hay tiempo de intercambiar datos formalmente. **Demo**: QR de vCard en el CV impreso o en LinkedIn. **Resultado**: el reclutador guarda el contacto al instante. **CTA**: "Agrégalo gratis a tu CV."

### QR para menús (formato específico)

41. **Hook**: "El menú que se actualiza solo, sin llamar a la imprenta." **Problema**: cambios de temporada que implican reimprimir todo. **Demo**: editar el menú en la web y mostrar que el mismo QR ya refleja el cambio. **Resultado**: cero reimpresión, actualización instantánea. **CTA**: "Digitaliza tu menú gratis."
42. **Hook**: "Cómo se ve una cafetería que ahorra en impresión cada mes." **Problema**: gasto recurrente en cartas plastificadas. **Demo**: comparar el costo de imprimir vs. un QR reutilizable. **Resultado**: ahorro mensual visible. **CTA**: "Prueba tu QR de menú gratis."
43. **Hook**: "El bar que resolvió las cartas manchadas de cerveza." **Problema**: cartas de papel que se dañan rápido en un bar. **Demo**: QR resistente en un posavasos o base acrílica. **Resultado**: menú siempre limpio y legible. **CTA**: "Crea el tuyo gratis."
44. **Hook**: "Cómo mostrar fotos de tus platillos sin gastar en catálogo impreso." **Problema**: catálogos a color son caros de imprimir. **Demo**: menú digital con fotos enlazado por QR. **Resultado**: experiencia visual rica sin costo de impresión. **CTA**: "Empieza gratis hoy."
45. **Hook**: "El truco para vender más postres sin que el mesero los ofrezca." **Problema**: el mesero se olvida de mencionar el menú de postres. **Demo**: QR adicional en la mesa apuntando solo a la sección de postres. **Resultado**: más pedidos de postre sin depender del mesero. **CTA**: "Crea QRs por sección, gratis."

### QR para emprendedores

46. **Hook**: "Cómo lancé mi marca sin gastar en diseñador para las tarjetas." **Problema**: presupuesto limitado al iniciar un negocio. **Demo**: crear un QR de negocio personalizado con los colores de marca, gratis. **Resultado**: material profesional sin costo de diseño. **CTA**: "Empieza gratis en Herramio."
47. **Hook**: "El error de emprendedor que casi todos cometen al inicio." **Problema**: no tener ningún canal de contacto claro en el primer material impreso. **Demo**: agregar un QR de WhatsApp desde el día uno. **Resultado**: primeros clientes contactando sin fricción. **CTA**: "Créalo gratis antes de imprimir nada."
48. **Hook**: "Cómo validar tu idea de negocio con $0 de inversión en marketing." **Problema**: no hay presupuesto para anuncios pagados al inicio. **Demo**: repartir volantes con QR y medir escaneos con `?ref=`. **Resultado**: datos reales de interés sin gastar en ads. **CTA**: "Mide tu primera campaña gratis."
49. **Hook**: "El QR que debe llevar tu primer empaque de producto." **Problema**: vender sin ningún canal digital de seguimiento. **Demo**: QR de Instagram o negocio en la etiqueta del producto. **Resultado**: primeros seguidores desde la primera venta. **CTA**: "Créalo gratis para tu marca."
50. **Hook**: "Cómo un emprendimiento desde casa se ve como negocio serio." **Problema**: vender por redes sin ningún elemento físico profesional. **Demo**: tarjeta de presentación con QR de vCard y QR de negocio. **Resultado**: percepción de marca más sólida frente al cliente. **CTA**: "Crea tus QR gratis en Herramio."

## Cómo priorizar

Empieza por las categorías de WhatsApp, WiFi y restaurantes (#1-15): son
las de mayor volumen de búsqueda y las más fáciles de demostrar en video
(resultado visual inmediato: el teléfono conectándose o el chat abriéndose).
Repite el formato que mejor funcione — no necesitas 50 ideas distintas de
producción, necesitas encontrar 3-4 hooks que funcionen y variar el caso de
uso.
