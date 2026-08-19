import type { BlogPost } from "@/lib/blog/types";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-crear-un-codigo-qr-gratis",
    title: "Cómo crear un código QR gratis: guía completa 2026",
    excerpt:
      "Todo lo que necesitas saber para generar tu primer código QR: qué tipos existen, qué configuración elegir y errores comunes que debes evitar.",
    description:
      "Guía paso a paso para crear un código QR gratis: tipos de QR, configuración recomendada, tamaño de impresión y errores comunes a evitar.",
    datePublished: "2026-01-12",
    readingTime: "6 min",
    relatedTool: "generador-qr",
    content: [
      {
        type: "p",
        text: "Un código QR (Quick Response) es una imagen cuadrada formada por puntos negros y blancos que almacena información — un enlace, un texto, datos de contacto — y que cualquier cámara de celular puede leer en menos de un segundo. Crear uno gratis es más sencillo de lo que parece, pero hay decisiones que marcan la diferencia entre un QR que funciona perfecto y uno que da problemas al escanear.",
      },
      {
        type: "h2",
        text: "Paso 1: elige qué tipo de información vas a codificar",
      },
      {
        type: "p",
        text: "No todos los QR son iguales por dentro. Un QR de enlace web codifica una URL; un QR de WiFi codifica el nombre de red, la contraseña y el tipo de seguridad en un formato especial; un QR de contacto (vCard) codifica un archivo de tarjeta de presentación completo. Elegir la herramienta correcta importa porque cada una da formato a los datos exactamente como lo esperan los lectores de cámara de iOS y Android.",
      },
      {
        type: "ul",
        items: [
          "Enlaces y páginas web → usa un generador de QR de URL",
          "Número de WhatsApp → usa un generador de QR de WhatsApp",
          "Red inalámbrica → usa un generador de QR de WiFi",
          "Datos de contacto → usa un generador de QR vCard",
        ],
      },
      {
        type: "h2",
        text: "Paso 2: configura el nivel de corrección de errores",
      },
      {
        type: "p",
        text: "Todos los códigos QR incluyen redundancia matemática para poder leerse aunque estén parcialmente dañados o cubiertos (por ejemplo, por un logo en el centro). Existen cuatro niveles: L (7% de tolerancia), M (15%), Q (25%) y H (30%). Si vas a imprimir el QR en un material que se puede ensuciar o rayar, o si vas a añadir un logo, usa nivel Q o H. Si el QR es solo para pantalla y no llevará logo, L o M son suficientes y generan un patrón ligeramente más simple.",
      },
      {
        type: "h2",
        text: "Paso 3: elige colores con buen contraste",
      },
      {
        type: "p",
        text: "El contraste entre el color del QR y el fondo determina si la cámara puede distinguir los módulos oscuros de los claros. Como regla práctica, un color oscuro (o negro) sobre un fondo claro (o blanco) siempre funciona. Combinaciones de colores similares en luminosidad — por ejemplo, un QR gris claro sobre fondo blanco — suelen fallar al escanear, incluso si visualmente se ven bien en pantalla.",
      },
      {
        type: "h2",
        text: "Paso 4: descarga en el formato correcto",
      },
      {
        type: "p",
        text: "Usa PNG cuando el QR se vaya a usar en digital (redes sociales, presentaciones, sitios web): es un formato de imagen rasterizada ligero y compatible con todo. Usa SVG cuando el QR se vaya a imprimir en gran formato — carteles, vallas, empaques — porque es un formato vectorial que escala a cualquier tamaño sin perder nitidez.",
      },
      {
        type: "h2",
        text: "Errores comunes al crear un código QR",
      },
      {
        type: "ul",
        items: [
          "Hacer el QR demasiado pequeño para el contexto de escaneo (una valla necesita un QR mucho más grande que un volante de mano)",
          "Usar colores de bajo contraste que la cámara no distingue",
          "No dejar margen (zona de silencio) alrededor del QR",
          "Colocar un logo muy grande sin subir el nivel de corrección de errores",
          "No probar el QR con un celular real antes de imprimirlo en masa",
        ],
      },
      {
        type: "p",
        text: "Antes de imprimir cientos de copias, escanea el QR con al menos dos celulares distintos (uno Android y uno iPhone) desde la distancia real a la que lo verán tus usuarios. Es la única forma de confirmar que todo — tamaño, contraste, contenido — funciona como esperas.",
      },
    ],
  },
  {
    slug: "como-crear-qr-whatsapp",
    title: "Cómo crear un QR de WhatsApp con mensaje predefinido",
    excerpt:
      "Aprende a generar un código QR que abre un chat de WhatsApp directamente, con un mensaje ya escrito para que tus clientes solo tengan que enviarlo.",
    description:
      "Cómo crear un código QR de WhatsApp con número y mensaje predefinido para atención al cliente, ventas o eventos.",
    datePublished: "2026-01-15",
    readingTime: "4 min",
    relatedTool: "qr-whatsapp",
    content: [
      {
        type: "p",
        text: "Un QR de WhatsApp elimina la fricción más grande de la atención por chat: que el cliente tenga que guardar tu número antes de poder escribirte. Al escanear el código, WhatsApp se abre directo en la conversación contigo, con un mensaje ya redactado si así lo configuras.",
      },
      {
        type: "h2",
        text: "Cómo funciona por dentro",
      },
      {
        type: "p",
        text: "El QR codifica un enlace del tipo wa.me/[número] seguido, opcionalmente, de un parámetro de texto con el mensaje predefinido. Cuando alguien escanea el código, su teléfono abre ese enlace, WhatsApp lo intercepta y lleva al usuario directo al chat, con el mensaje ya escrito en el campo de texto — el cliente solo necesita presionar enviar.",
      },
      {
        type: "steps",
        items: [
          {
            title: "Escribe tu número con código de país",
            text: "Usa el formato internacional completo, por ejemplo +52 55 1234 5678. No incluyas espacios ni el símbolo + al generar: la herramienta lo normaliza automáticamente.",
          },
          {
            title: "Redacta un mensaje predefinido (opcional)",
            text: "Algo breve y claro: 'Hola, vi su QR y quiero más información sobre...'. Esto reduce la fricción y aumenta la tasa de respuesta.",
          },
          {
            title: "Personaliza el diseño",
            text: "Usa el color verde de WhatsApp o los colores de tu marca, siempre que mantengan buen contraste.",
          },
          {
            title: "Descarga y coloca el QR donde tus clientes lo vean",
            text: "Mostrador, empaque, tarjetas de presentación, historias de Instagram o el pie de tus correos.",
          },
        ],
      },
      {
        type: "h2",
        text: "Casos de uso reales",
      },
      {
        type: "ul",
        items: [
          "Restaurantes: reservas o pedidos directos por WhatsApp",
          "Tiendas físicas: soporte postventa sin que el cliente tenga que llamar",
          "Eventos y ferias: captar leads sin formularios largos",
          "Freelancers y profesionales: cotizaciones rápidas desde una tarjeta de presentación",
        ],
      },
      {
        type: "h2",
        text: "Buenas prácticas",
      },
      {
        type: "p",
        text: "Evita mensajes predefinidos demasiado largos: WhatsApp los muestra completos en el campo de texto y pueden intimidar al usuario. Una frase corta funciona mejor que un párrafo. Además, si tu negocio usa WhatsApp Business, verifica que el número del QR coincida exactamente con el registrado en la app para evitar confusiones.",
      },
    ],
  },
  {
    slug: "como-compartir-wifi-con-codigo-qr",
    title: "Cómo compartir WiFi con un código QR (sin decir la contraseña)",
    excerpt:
      "Genera un QR de WiFi que conecta automáticamente a tus invitados a la red, sin tener que dictar ni escribir la contraseña.",
    description:
      "Guía para crear un código QR de WiFi compatible con Android e iPhone: formato correcto, seguridad y buenas prácticas.",
    datePublished: "2026-01-18",
    readingTime: "4 min",
    relatedTool: "qr-wifi",
    content: [
      {
        type: "p",
        text: "Desde iOS 11 y Android 10, la cámara nativa del teléfono puede leer un formato especial de QR que contiene las credenciales de una red WiFi y conectarse automáticamente, sin necesidad de ninguna app adicional. Esto es especialmente útil para negocios (cafeterías, hoteles, Airbnbs) y para el hogar cuando llegan visitas.",
      },
      {
        type: "h2",
        text: "El formato técnico detrás del QR de WiFi",
      },
      {
        type: "p",
        text: "El estándar codifica el nombre de la red (SSID), la contraseña y el tipo de seguridad en una cadena de texto con el prefijo WIFI:. Por ejemplo: WIFI:T:WPA;S:MiRed;P:MiContraseña;;. El parámetro T indica el tipo de seguridad (WPA, WEP o sin contraseña), S es el nombre de la red y P es la contraseña. Nuestra herramienta arma este formato automáticamente a partir de un formulario simple, incluyendo el escape correcto de caracteres especiales si tu contraseña los contiene.",
      },
      {
        type: "h2",
        text: "¿Es seguro compartir el WiFi por QR?",
      },
      {
        type: "p",
        text: "Es tan seguro como decir la contraseña en voz alta o escribirla en un papel: cualquiera que tenga acceso al QR puede conectarse. La diferencia es la comodidad y que evitas errores de tipeo. Si compartes el QR impreso en un espacio público, considera usar una red de invitados separada de tu red principal, para que las visitas no tengan acceso a tus dispositivos internos.",
      },
      {
        type: "h2",
        text: "Dónde colocar tu QR de WiFi",
      },
      {
        type: "ul",
        items: [
          "Un marco pequeño sobre la mesa en cafeterías y restaurantes",
          "Pegado junto al router en casa, para visitas frecuentes",
          "En la carpeta de bienvenida de un Airbnb o habitación de hotel",
          "En la sala de espera de una oficina o consultorio",
        ],
      },
      {
        type: "h2",
        text: "Red oculta: qué cambia",
      },
      {
        type: "p",
        text: "Si tu red no transmite su nombre (SSID oculto), marca la opción de 'red oculta' al generar el QR. Esto añade el parámetro H:true, indicando al teléfono que debe buscar la red activamente en lugar de esperar a verla en la lista de redes disponibles.",
      },
    ],
  },
  {
    slug: "qr-para-restaurantes-menu-digital",
    title: "Cómo poner un QR en tu restaurante para el menú digital",
    excerpt:
      "El menú QR se volvió estándar en restaurantes. Te contamos cómo implementarlo bien: tamaño de impresión, ubicación en la mesa y errores a evitar.",
    description:
      "Guía práctica para implementar un menú digital con código QR en restaurantes, cafeterías y bares.",
    datePublished: "2026-01-22",
    readingTime: "5 min",
    relatedTool: "qr-menu",
    content: [
      {
        type: "p",
        text: "El menú por código QR pasó de ser una solución de emergencia a una herramienta permanente en miles de restaurantes: reduce costos de impresión, permite actualizar precios al instante y da información nutricional o de alérgenos sin rediseñar nada físico.",
      },
      {
        type: "h2",
        text: "Qué necesitas antes de generar el QR",
      },
      {
        type: "p",
        text: "Lo primero es tener el menú en una URL estable — una página web, un PDF alojado en tu sitio, o un documento de Google compartido públicamente. El código QR simplemente apunta a esa dirección, así que la calidad de la experiencia depende de que esa página cargue rápido y se vea bien en un celular.",
      },
      {
        type: "steps",
        items: [
          {
            title: "Sube tu menú a una URL pública",
            text: "Puede ser una página de tu sitio web o un PDF; evita documentos que pidan iniciar sesión para verse.",
          },
          {
            title: "Genera el QR con esa URL",
            text: "Usa un nivel de corrección de errores Q o H si vas a plastificar el QR o ponerle el logo del restaurante.",
          },
          {
            title: "Imprime en un tamaño legible",
            text: "Para una mesa a 40-60 cm de distancia, un QR de al menos 3x3 cm impreso funciona bien; para pie de menú o cartel de entrada, usa 5x5 cm o más.",
          },
          {
            title: "Prueba antes de imprimir en volumen",
            text: "Escanea el QR impreso (no solo en pantalla) con distintos celulares para confirmar que el tamaño y contraste funcionan en papel.",
          },
        ],
      },
      {
        type: "h2",
        text: "Ubicación recomendada en la mesa",
      },
      {
        type: "p",
        text: "Un atril pequeño o una base acrílica en el centro de la mesa funciona mejor que pegar el QR directamente al mantel, donde se ensucia y arruga. Si usas manteles individuales de papel, imprime el QR en una esquina reforzada, no en el centro donde se apoyan los platos.",
      },
      {
        type: "h2",
        text: "Menú QR vs. menú físico: lo que dicen los clientes",
      },
      {
        type: "p",
        text: "La recomendación más consistente en la industria es ofrecer ambas opciones cuando sea posible: el QR agiliza y reduce costos, pero algunos comensales (personas mayores, quienes prefieren no depender del celular) valoran tener también una carta física disponible al pedirla.",
      },
    ],
  },
  {
    slug: "qr-para-google-maps-ubicacion",
    title: "Cómo crear un QR para Google Maps y compartir tu ubicación",
    excerpt:
      "Genera un código QR que lleva directo a tu negocio o punto de encuentro en Google Maps, ideal para invitaciones, fachadas y material impreso.",
    description:
      "Cómo generar un código QR que abre una ubicación exacta en Google Maps al escanearlo.",
    datePublished: "2026-01-25",
    readingTime: "3 min",
    relatedTool: "qr-google-maps",
    content: [
      {
        type: "p",
        text: "Explicar una dirección por texto siempre deja espacio para confusión. Un QR que abre Google Maps directamente en tu ubicación elimina ese problema: el cliente escanea y su app de mapas ya sabe exactamente a dónde ir, con la ruta calculada desde su posición actual.",
      },
      {
        type: "h2",
        text: "Dos formas de generar este QR",
      },
      {
        type: "p",
        text: "La primera y más precisa es copiar el enlace de 'Compartir' directamente desde la ficha de tu negocio en Google Maps (botón Compartir → Copiar enlace) y pegarlo en el generador. La segunda es escribir la dirección completa en texto; en ese caso, el QR codifica una búsqueda de esa dirección en Maps, lo cual funciona bien pero es ligeramente menos preciso que un enlace de ubicación exacta con coordenadas.",
      },
      {
        type: "h2",
        text: "Dónde usar este código QR",
      },
      {
        type: "ul",
        items: [
          "Fachada del negocio, junto al horario de atención",
          "Invitaciones impresas a eventos o bodas",
          "Tarjetas de presentación, en el reverso",
          "Anuncios impresos en revistas o volantes de zona",
          "Empaques de delivery, para que el cliente ubique la tienda física",
        ],
      },
      {
        type: "h2",
        text: "Consejo para negocios con ficha en Google Business Profile",
      },
      {
        type: "p",
        text: "Si tu negocio tiene perfil verificado en Google, usa siempre el enlace de esa ficha (y no una búsqueda genérica): así el QR también dirige tráfico hacia tus reseñas y fotos, reforzando tu presencia en el mapa.",
      },
    ],
  },
  {
    slug: "que-informacion-puede-contener-un-codigo-qr",
    title: "Qué información puede contener un código QR: guía de formatos",
    excerpt:
      "Un QR puede guardar mucho más que un enlace. Repasamos todos los tipos de datos que puedes codificar y cuándo usar cada uno.",
    description:
      "Lista completa de los tipos de datos que puede contener un código QR: URL, texto, WiFi, contacto, WhatsApp, ubicación y más.",
    datePublished: "2026-01-29",
    readingTime: "5 min",
    content: [
      {
        type: "p",
        text: "Un código QR no es más que un contenedor de texto: la 'magia' está en el formato específico de ese texto, que le indica al sistema operativo del teléfono qué aplicación abrir y con qué datos. Esto es lo que puedes codificar y cómo lo interpreta cada celular.",
      },
      {
        type: "h2",
        text: "Enlaces web (URL)",
      },
      {
        type: "p",
        text: "El uso más común. Codifica una dirección completa (https://tusitio.com) y el teléfono la abre en el navegador predeterminado.",
      },
      {
        type: "h2",
        text: "Texto plano",
      },
      {
        type: "p",
        text: "Cualquier texto libre: instrucciones, un código de cupón, una nota. El teléfono simplemente muestra el texto, sin abrir ninguna app externa.",
      },
      {
        type: "h2",
        text: "WhatsApp y SMS",
      },
      {
        type: "p",
        text: "Un enlace especial (wa.me/numero) abre un chat de WhatsApp; el formato sms: abre la app de mensajes con un número y texto predefinidos.",
      },
      {
        type: "h2",
        text: "Redes WiFi",
      },
      {
        type: "p",
        text: "El formato WIFI:T:...;S:...;P:...;; permite que el teléfono se conecte automáticamente a una red, sin escribir la contraseña manualmente.",
      },
      {
        type: "h2",
        text: "Contactos (vCard)",
      },
      {
        type: "p",
        text: "El estándar vCard empaqueta nombre, teléfono, correo, empresa y dirección en un solo bloque de texto que el teléfono reconoce como una tarjeta de contacto e importa directo a la agenda.",
      },
      {
        type: "h2",
        text: "Correo electrónico y llamadas",
      },
      {
        type: "p",
        text: "mailto: abre un correo nuevo con destinatario, asunto y cuerpo predefinidos; tel: inicia una llamada telefónica directa al número indicado.",
      },
      {
        type: "h2",
        text: "Ubicación geográfica",
      },
      {
        type: "p",
        text: "Un enlace de Google Maps o el formato geo:latitud,longitud abre la app de mapas justo en el punto indicado.",
      },
      {
        type: "h2",
        text: "¿Cuánta información cabe en un QR?",
      },
      {
        type: "p",
        text: "Depende de la versión y el nivel de corrección de errores del QR, pero en la práctica un código QR puede almacenar hasta unos 4.000 caracteres alfanuméricos. Mientras más información codifiques, más denso y complejo se vuelve el patrón visual, lo que puede dificultar el escaneo a distancia — por eso, para textos largos, siempre es mejor codificar un enlace a una página en lugar del texto completo.",
      },
    ],
  },
  {
    slug: "como-imprimir-un-codigo-qr-correctamente",
    title: "Cómo imprimir un código QR sin que falle al escanear",
    excerpt:
      "El tamaño, la resolución y el material importan más de lo que crees. Estas son las reglas prácticas para imprimir códigos QR sin errores.",
    description:
      "Guía práctica de tamaño, resolución y formato para imprimir un código QR que se escanee sin problemas.",
    datePublished: "2026-02-02",
    readingTime: "4 min",
    content: [
      {
        type: "p",
        text: "Un QR que se ve perfecto en pantalla puede fallar por completo al imprimirse si no se respetan algunas reglas básicas de tamaño y resolución. Estas son las que más impactan en la tasa de escaneo exitoso.",
      },
      {
        type: "h2",
        text: "Regla del tamaño según la distancia de escaneo",
      },
      {
        type: "p",
        text: "Una gula práctica usada en señalética es dividir la distancia de escaneo esperada entre 10 para obtener el tamaño mínimo del QR. Por ejemplo, si esperas que la gente escanee desde 3 metros (300 cm), el QR debería medir al menos 30 cm de lado. Para un volante de mano, a 20-30 cm de distancia, 2.5-3 cm suele ser suficiente.",
      },
      {
        type: "h2",
        text: "Usa SVG para cualquier impresión mediana o grande",
      },
      {
        type: "p",
        text: "El formato PNG tiene una resolución fija en píxeles: si lo agrandas más allá de su tamaño original, se pixela y pierde nitidez, lo cual puede volver el QR ilegible para la cámara. El SVG es vectorial: se puede escalar a cualquier tamaño de impresión sin perder calidad, así que es la opción correcta para carteles, vallas o empaques grandes.",
      },
      {
        type: "h2",
        text: "Deja margen alrededor (zona de silencio)",
      },
      {
        type: "p",
        text: "Los lectores de QR necesitan un área en blanco alrededor del código para identificar dónde empieza y termina el patrón. Un margen de al menos 4 módulos (equivalente a un pequeño borde blanco alrededor del QR) evita que otros elementos gráficos cercanos interfieran con la lectura.",
      },
      {
        type: "h2",
        text: "Cuidado con materiales brillantes o reflectantes",
      },
      {
        type: "p",
        text: "El papel brillante o el acabado laminado pueden generar reflejos que dificultan que la cámara enfoque el QR, especialmente bajo luz directa. Si tienes esa opción, un acabado mate mejora significativamente la tasa de escaneo en exteriores.",
      },
      {
        type: "h2",
        text: "Prueba siempre con la impresión final",
      },
      {
        type: "p",
        text: "Antes de imprimir en volumen, haz una prueba de impresión y escanéala con al menos dos modelos de celular distintos, en las condiciones de luz reales donde estará el material (interior, exterior, con o sin luz directa).",
      },
    ],
  },
  {
    slug: "qr-tarjeta-de-presentacion-digital",
    title: "QR para tarjeta de presentación: comparte tu contacto al instante",
    excerpt:
      "Un código QR con tu vCard reemplaza la tarjeta de papel: tus contactos escanean y guardan tu nombre, teléfono y correo directo en su celular.",
    description:
      "Cómo crear un código QR de tarjeta de presentación (vCard) para compartir tus datos de contacto profesionales.",
    datePublished: "2026-02-05",
    readingTime: "4 min",
    relatedTool: "qr-vcard",
    content: [
      {
        type: "p",
        text: "Una tarjeta de presentación tradicional termina, en el mejor de los casos, tecleada manualmente en la agenda del contacto — y en el peor, perdida en un cajón. Un QR de tarjeta de contacto (formato vCard) resuelve esto: al escanearlo, el celular ofrece guardar directamente un nuevo contacto con todos tus datos ya completos.",
      },
      {
        type: "h2",
        text: "Qué datos incluir (y cuáles omitir)",
      },
      {
        type: "p",
        text: "Los campos más útiles son nombre completo, teléfono, correo, empresa y cargo. El sitio web es opcional pero recomendable si tienes portafolio o LinkedIn. Evita incluir una dirección física a menos que realmente sea relevante para quien recibe la tarjeta (por ejemplo, un consultorio o tienda), ya que puede saturar innecesariamente el contacto guardado.",
      },
      {
        type: "h2",
        text: "Dónde usar el QR de vCard",
      },
      {
        type: "ul",
        items: [
          "Impreso en tu tarjeta de presentación física, como complemento",
          "En la firma de tu correo electrónico",
          "En tu perfil de LinkedIn o portafolio, como imagen destacada",
          "En un gafete o credencial durante ferias y congresos",
        ],
      },
      {
        type: "h2",
        text: "Ventaja frente a compartir por WhatsApp o AirDrop",
      },
      {
        type: "p",
        text: "A diferencia de enviar tu contacto por una app específica, el QR funciona sin importar el sistema operativo de quien lo escanea ni si ambos tienen la misma aplicación instalada: cualquier cámara nativa moderna (iOS o Android) reconoce el formato vCard y ofrece guardarlo como contacto nuevo.",
      },
      {
        type: "h2",
        text: "Un detalle que mejora la conversión",
      },
      {
        type: "p",
        text: "Agrega un pequeño texto junto al QR indicando qué hace ('Escanea para guardar mi contacto'). Aunque los QR son cada vez más comunes, esa instrucción explícita reduce la duda de quien no está seguro de qué encontrará al escanear.",
      },
    ],
  },
  {
    slug: "como-calcular-un-porcentaje-facilmente",
    title: "Cómo calcular un porcentaje fácilmente (con ejemplos)",
    excerpt:
      "Las tres fórmulas de porcentaje que realmente necesitas en el día a día, explicadas con ejemplos simples: de descuentos a aumentos de sueldo.",
    description:
      "Guía práctica para calcular porcentajes: qué es X% de Y, qué porcentaje representa un número, y cómo aumentar o disminuir una cantidad.",
    datePublished: "2026-08-10",
    readingTime: "4 min",
    relatedTool: "calc-porcentaje",
    content: [
      {
        type: "p",
        text: "Calcular un porcentaje se reduce a tres operaciones distintas, y la confusión casi siempre viene de no saber cuál de las tres necesitas en cada momento. Aquí están las tres, con ejemplos reales.",
      },
      { type: "h2", text: "1. Sacar el X% de una cantidad" },
      {
        type: "p",
        text: "Es la más común: cuánto es el 20% de 500. La fórmula es (porcentaje × cantidad) ÷ 100. En este caso: (20 × 500) ÷ 100 = 100. Se usa constantemente para calcular descuentos, propinas o comisiones.",
      },
      { type: "h2", text: "2. Saber qué porcentaje representa un número" },
      {
        type: "p",
        text: "Aquí la pregunta es al revés: 50 es qué porcentaje de 200. La fórmula es (parte ÷ total) × 100. En este caso: (50 ÷ 200) × 100 = 25%. Útil para saber, por ejemplo, qué porcentaje de tu sueldo representa un gasto fijo.",
      },
      { type: "h2", text: "3. Aumentar o disminuir una cantidad en un porcentaje" },
      {
        type: "p",
        text: "Para aumentar: cantidad × (1 + porcentaje ÷ 100). Para disminuir: cantidad × (1 − porcentaje ÷ 100). Por ejemplo, un sueldo de 500 con un aumento del 20% queda en 500 × 1.20 = 600. El mismo sueldo con un descuento del 20% queda en 500 × 0.80 = 400.",
      },
      { type: "h2", text: "Ejemplos rápidos del día a día" },
      {
        type: "ul",
        items: [
          "Una prenda de $80 con 30% de descuento: 80 × 0.70 = $56",
          "Una propina del 15% sobre una cuenta de $40: (15 × 40) ÷ 100 = $6",
          "Un ahorro de $150 sobre un ingreso de $1,200: (150 ÷ 1200) × 100 = 12.5%",
        ],
      },
      {
        type: "p",
        text: "Si prefieres no hacer la cuenta a mano, nuestra calculadora de porcentaje resuelve estos tres casos al instante, sin necesidad de recordar ninguna fórmula.",
      },
    ],
  },
  {
    slug: "como-reducir-tamano-de-imagen-sin-perder-calidad",
    title: "Cómo reducir el tamaño de una imagen sin perder demasiada calidad",
    excerpt:
      "La diferencia entre comprimir bien y arruinar una foto está en el formato y el nivel de calidad que elijas. Aquí está cómo hacerlo bien.",
    description:
      "Guía práctica para comprimir imágenes JPG, PNG o WebP reduciendo el peso del archivo sin perder calidad visual notable.",
    datePublished: "2026-08-12",
    readingTime: "4 min",
    relatedTool: "imagen-comprimir",
    content: [
      {
        type: "p",
        text: "Una foto pesada carga lento, ocupa espacio y en muchos formularios web directamente no se puede subir. La buena noticia es que casi siempre se puede reducir el peso de una imagen entre 60% y 80% sin que el ojo humano note la diferencia — si eliges bien el formato y el nivel de calidad.",
      },
      { type: "h2", text: "Elige el formato correcto" },
      {
        type: "p",
        text: "JPEG y WebP tienen compresión con pérdida ajustable: puedes elegir cuánto peso sacrificar a cambio de calidad. PNG es sin pérdida — ideal para logos o capturas con texto nítido, pero casi no reduce su tamaño al \"comprimirse\". Si tu imagen es una fotografía y no necesita transparencia, conviértela a JPEG o WebP antes de comprimir.",
      },
      { type: "h2", text: "El punto dulce de calidad: 70-85%" },
      {
        type: "p",
        text: "Por debajo de 70% de calidad empiezan a notarse artefactos de compresión (bloques, borrosidad) en fotografías con detalle. Por encima de 85%, el ahorro de peso adicional es mínimo. El rango 70-85% suele dar la mejor relación entre tamaño de archivo y calidad visual.",
      },
      { type: "h2", text: "Ejemplo real" },
      {
        type: "p",
        text: "Una fotografía de 2.4 MB en JPEG con calidad 100% puede bajar a unos 780 KB con calidad 80% — una reducción aproximada del 67%, prácticamente indistinguible a simple vista en la mayoría de pantallas.",
      },
      { type: "h2", text: "Cuándo NO comprimir tanto" },
      {
        type: "ul",
        items: [
          "Material para impresión de alta calidad (usa calidad 90%+ o formatos sin pérdida)",
          "Imágenes con texto pequeño o líneas finas, donde los artefactos son más visibles",
          "Archivos que ya pasaron por varias compresiones previas (cada recompresión pierde más calidad)",
        ],
      },
      {
        type: "p",
        text: "Nuestro compresor de imágenes hace este ajuste de formato y calidad en tiempo real, mostrándote el tamaño resultante antes de descargar, directamente en tu navegador.",
      },
    ],
  },
  {
    slug: "como-convertir-jpg-a-pdf",
    title: "Cómo convertir JPG a PDF gratis",
    excerpt:
      "Convertir una o varias fotos a un solo PDF es útil para enviar documentos escaneados, comprobantes o portafolios. Así se hace en segundos.",
    description:
      "Guía para convertir imágenes JPG o PNG a un archivo PDF, incluyendo cómo unir varias imágenes en un solo documento.",
    datePublished: "2026-08-14",
    readingTime: "3 min",
    relatedTool: "jpg-a-pdf",
    content: [
      {
        type: "p",
        text: "Convertir una imagen a PDF es útil cuando necesitas enviar un documento escaneado con el celular, armar un portafolio de fotos, o simplemente entregar algo en un formato que se vea igual en cualquier dispositivo.",
      },
      { type: "h2", text: "Cuándo conviene usar PDF en vez de JPG" },
      {
        type: "ul",
        items: [
          "Cuando necesitas enviar varias páginas o fotos como un solo archivo",
          "Cuando el destinatario espera un documento formal, no una imagen suelta",
          "Cuando quieres asegurar que se vea igual sin importar el dispositivo o programa que lo abra",
        ],
      },
      { type: "h2", text: "Cómo convertir varias imágenes en un solo PDF" },
      {
        type: "steps",
        items: [
          { title: "Sube tus imágenes", text: "JPG o PNG, una o varias a la vez." },
          { title: "Ordénalas", text: "Cada imagen se convierte en una página, en el orden que definas." },
          { title: "Descarga el PDF", text: "Obtienes un solo archivo listo para enviar o imprimir." },
        ],
      },
      {
        type: "p",
        text: "Esto es especialmente útil para escanear varias páginas de un mismo documento con la cámara del celular (una foto por página) y entregarlas como un solo PDF ordenado, en vez de mandar varias fotos sueltas.",
      },
    ],
  },
  {
    slug: "como-crear-una-contrasena-segura",
    title: "Cómo crear una contraseña segura (y por qué la mayoría no lo son)",
    excerpt:
      "La longitud importa más que la complejidad, reutilizar contraseñas es el error más costoso, y un generador aleatorio resuelve ambos problemas en segundos.",
    description:
      "Guía práctica sobre qué hace segura a una contraseña, por qué la longitud pesa más que los símbolos, y cómo generar una con Web Crypto API.",
    datePublished: "2026-08-18",
    readingTime: "5 min",
    relatedTool: "texto-generador-contrasenas",
    content: [
      {
        type: "p",
        text: "La mayoría de las filtraciones de cuentas no ocurren porque alguien 'hackeó' nada: ocurren porque la misma contraseña débil se reutilizó en varios sitios, y cuando uno de ellos sufre una filtración, los atacantes la prueban automáticamente en el resto. Crear contraseñas seguras y distintas para cada servicio sigue siendo, hoy, la defensa más efectiva y más ignorada.",
      },
      { type: "h2", text: "Lo que realmente hace fuerte a una contraseña" },
      {
        type: "p",
        text: "La longitud pesa más que la complejidad. Una contraseña de 16 caracteres aleatorios con solo minúsculas es, en la práctica, más difícil de forzar por fuerza bruta que una de 8 caracteres con mayúsculas, números y símbolos mezclados. Esto se debe a que cada carácter adicional multiplica exponencialmente el número de combinaciones posibles, mientras que añadir tipos de carácter solo lo hace de forma lineal.",
      },
      {
        type: "ul",
        items: [
          "Prioriza la longitud: al menos 12-16 caracteres para cuentas normales",
          "Combina tipos de carácter cuando el sitio lo permita, pero no a costa de longitud",
          "Nunca reutilices la misma contraseña en dos sitios distintos",
          "Usa un gestor de contraseñas para no depender de la memoria",
        ],
      },
      { type: "h2", text: "Por qué Math.random() no sirve para esto" },
      {
        type: "p",
        text: "Muchos generadores de contraseñas 'caseros' en JavaScript usan Math.random(), que es un generador de números pseudoaleatorios diseñado para animaciones y juegos, no para seguridad — su secuencia es predecible si se conoce el estado interno. Un generador de contraseñas serio debe usar un CSPRNG (generador criptográficamente seguro), como crypto.getRandomValues(), disponible de forma nativa en cualquier navegador moderno.",
      },
      { type: "h2", text: "Cómo generar una contraseña fuerte en segundos" },
      {
        type: "steps",
        items: [
          { title: "Elige una longitud de al menos 16 caracteres", text: "Cuanto más larga, mejor — dentro de lo que el sitio permita." },
          { title: "Activa varios tipos de carácter", text: "Mayúsculas, minúsculas, números y símbolos, si el servicio los acepta." },
          { title: "Genera y copia", text: "La contraseña se crea con crypto.getRandomValues() directamente en tu navegador." },
          { title: "Guárdala en un gestor de contraseñas", text: "Así no necesitas memorizarla ni anotarla en texto plano." },
        ],
      },
      {
        type: "p",
        text: "El generador de contraseñas de Herramio hace exactamente esto: usa la API criptográfica nativa del navegador, nunca envía la contraseña generada a ningún servidor, y muestra un indicador de fortaleza para que sepas de un vistazo si vale la pena regenerar.",
      },
    ],
  },
  {
    slug: "como-hacer-un-sorteo-justo-en-redes-sociales",
    title: "Cómo hacer un sorteo justo y transparente en redes sociales",
    excerpt:
      "Elegir un ganador 'a ojo' entre los comentarios genera desconfianza. Así es como un sorteo aleatorio y verificable evita reclamos y mejora tu credibilidad.",
    description:
      "Cómo organizar un sorteo o giveaway justo en redes sociales usando un selector aleatorio, evitando reclamos de favoritismo.",
    datePublished: "2026-08-20",
    readingTime: "4 min",
    relatedTool: "productividad-sorteador",
    content: [
      {
        type: "p",
        text: "Un sorteo mal gestionado — donde el ganador se elige 'mirando la lista' o con un método poco claro — genera desconfianza incluso cuando fue completamente honesto. La forma más simple de evitarlo es usar un método de selección visiblemente aleatorio, que cualquiera pueda entender y que no dependa de tu criterio personal.",
      },
      { type: "h2", text: "Por qué importa el método, no solo el resultado" },
      {
        type: "p",
        text: "Cuando anuncias que el ganador se eligió 'al azar', pero el proceso no es visible ni verificable, los participantes solo tienen tu palabra. Usar una herramienta pública de sorteo, y mostrar cómo se armó la lista de participantes, convierte una afirmación de confianza en algo que cualquiera puede entender y aceptar.",
      },
      { type: "h2", text: "Cómo organizar el sorteo paso a paso" },
      {
        type: "steps",
        items: [
          { title: "Define las reglas de participación con claridad", text: "Qué acción cuenta como entrada (comentar, seguir, compartir) y hasta cuándo." },
          { title: "Arma la lista completa de participantes", text: "Copia los nombres o usuarios que cumplieron las reglas, uno por línea." },
          { title: "Sortea con una herramienta aleatoria", text: "Pega la lista y deja que el generador elija al ganador, sin intervención manual." },
          { title: "Comparte el resultado con la lista visible", text: "Así cualquiera puede verificar que el ganador estaba realmente en la lista." },
        ],
      },
      { type: "h2", text: "Sorteos con varios ganadores" },
      {
        type: "p",
        text: "Si vas a repartir varios premios, sortea uno a la vez y retira al ganador de la lista antes del siguiente sorteo — así evitas que la misma persona gane dos veces y mantienes el proceso transparente en cada ronda.",
      },
    ],
  },
  {
    slug: "que-es-json-y-como-formatearlo",
    title: "Qué es JSON y cómo formatearlo para que sea legible",
    excerpt:
      "JSON es el formato que usan casi todas las APIs modernas para intercambiar datos. Cuando llega comprimido en una sola línea, formatearlo es el primer paso para entenderlo.",
    description:
      "Qué es JSON, cómo está estructurado y cómo formatearlo o validarlo cuando llega minificado desde una API.",
    datePublished: "2026-08-22",
    readingTime: "5 min",
    relatedTool: "dev-json-formatter",
    content: [
      {
        type: "p",
        text: "JSON (JavaScript Object Notation) es un formato de texto para representar datos estructurados — objetos, listas, números, texto — que se convirtió en el estándar de facto para el intercambio de información entre aplicaciones web y APIs. Casi cualquier API que consultes hoy responde en este formato.",
      },
      { type: "h2", text: "Estructura básica de JSON" },
      {
        type: "ul",
        items: [
          "Los objetos van entre llaves { } con pares clave-valor",
          "Las listas van entre corchetes [ ] con elementos separados por comas",
          "Los valores pueden ser texto (entre comillas), números, booleanos, null, otros objetos u otras listas",
          "Las claves siempre van entre comillas dobles",
        ],
      },
      { type: "h2", text: "Por qué llega minificado" },
      {
        type: "p",
        text: "Para ahorrar ancho de banda, la mayoría de las APIs devuelven el JSON sin espacios ni saltos de línea — todo en una sola línea compacta. Esto es eficiente para que lo procese una máquina, pero prácticamente ilegible para una persona que necesita depurar o entender la respuesta.",
      },
      { type: "h2", text: "Cómo formatear JSON para leerlo" },
      {
        type: "steps",
        items: [
          { title: "Copia el JSON minificado", text: "Desde la respuesta de la API, la consola del navegador o un archivo de configuración." },
          { title: "Pégalo en un formateador", text: "La herramienta detecta la estructura y valida que sea JSON correcto." },
          { title: "Revisa la indentación resultante", text: "Cada nivel de anidación queda visualmente claro, con saltos de línea y sangría." },
          { title: "Si hay un error de sintaxis, corrígelo", text: "El formateador señala exactamente qué parte del texto no es JSON válido." },
        ],
      },
      {
        type: "p",
        text: "El proceso inverso — minificar — es útil cuando necesitas incluir el JSON en código o un archivo de configuración donde el tamaño importa más que la legibilidad para humanos.",
      },
    ],
  },
  {
    slug: "tecnica-pomodoro-como-funciona",
    title: "Qué es la técnica Pomodoro y cómo aplicarla sin complicarte",
    excerpt:
      "Dividir el trabajo en bloques cortos de enfoque, con descansos programados, es una de las formas más simples de mejorar la concentración sin fuerza de voluntad extra.",
    description:
      "Qué es la técnica Pomodoro, cómo estructurar los bloques de trabajo y descanso, y cómo aplicarla con un temporizador simple.",
    datePublished: "2026-08-24",
    readingTime: "4 min",
    relatedTool: "productividad-temporizador",
    content: [
      {
        type: "p",
        text: "La técnica Pomodoro, creada por Francesco Cirillo a finales de los 80, propone algo simple: trabajar en bloques cortos y delimitados de tiempo, con descansos programados entre ellos, en vez de intentar mantener la concentración indefinidamente hasta agotarse.",
      },
      { type: "h2", text: "La estructura básica" },
      {
        type: "ul",
        items: [
          "25 minutos de trabajo enfocado en una sola tarea",
          "5 minutos de descanso corto",
          "Repetir el ciclo 4 veces",
          "Cada 4 bloques, un descanso largo de 15-30 minutos",
        ],
      },
      { type: "h2", text: "Por qué funciona" },
      {
        type: "p",
        text: "El límite de tiempo reduce la procrastinación: 25 minutos es un compromiso pequeño y concreto, mucho menos intimidante que 'trabajar en esto toda la tarde'. Al mismo tiempo, saber que viene un descanso programado ayuda a mantener el enfoque durante el bloque, en vez de distraerte revisando el teléfono cada pocos minutos.",
      },
      { type: "h2", text: "Cómo aplicarla con un temporizador" },
      {
        type: "steps",
        items: [
          { title: "Elige una sola tarea", text: "No varias a la vez — el objetivo es enfoque, no multitarea." },
          { title: "Inicia un bloque de 25 minutos", text: "Trabaja solo en esa tarea hasta que suene el aviso." },
          { title: "Toma un descanso real de 5 minutos", text: "Levántate, estira, evita revisar redes sociales." },
          { title: "Cada 4 bloques, toma un descanso largo", text: "15 a 30 minutos antes de empezar el siguiente ciclo." },
        ],
      },
      {
        type: "p",
        text: "No es necesario seguir los 25 minutos al pie de la letra: algunas personas prefieren bloques de 45-50 minutos con descansos de 10. Lo esencial es la estructura — trabajo delimitado seguido de descanso delimitado — no el número exacto.",
      },
    ],
  },
  {
    slug: "que-es-un-hash-y-para-que-sirve",
    title: "Qué es un hash (SHA-256) y para qué se usa en la práctica",
    excerpt:
      "Un hash convierte cualquier texto en una huella digital de longitud fija, irreversible. Así es como se usa para verificar integridad sin necesidad de guardar el original.",
    description:
      "Qué es una función hash como SHA-256, en qué se diferencia de cifrar, y casos prácticos de uso como verificación de integridad.",
    datePublished: "2026-08-26",
    readingTime: "4 min",
    relatedTool: "dev-hash-generator",
    content: [
      {
        type: "p",
        text: "Un hash es el resultado de aplicar una función matemática a un texto o archivo, que produce siempre una cadena de longitud fija — por ejemplo, 64 caracteres hexadecimales para SHA-256. La misma entrada siempre produce exactamente el mismo hash, pero es prácticamente imposible reconstruir la entrada original a partir del hash.",
      },
      { type: "h2", text: "Hash no es lo mismo que cifrado" },
      {
        type: "p",
        text: "El cifrado es reversible: con la clave correcta, puedes recuperar el texto original a partir del texto cifrado. Un hash no es reversible por diseño — su propósito no es ocultar información para recuperarla después, sino crear una huella digital verificable. No existe una función 'deshacer hash'.",
      },
      { type: "h2", text: "Casos de uso comunes" },
      {
        type: "ul",
        items: [
          "Verificar que un archivo descargado no fue alterado, comparando su hash publicado contra el hash calculado localmente",
          "Detectar cambios en un texto o configuración sin comparar carácter por carácter",
          "Crear identificadores reproducibles a partir de contenido, sin guardar el contenido completo",
          "Como parte (nunca como único paso) de sistemas de verificación de contraseñas",
        ],
      },
      { type: "h2", text: "Cómo calcular un hash" },
      {
        type: "steps",
        items: [
          { title: "Elige el algoritmo", text: "SHA-256 es el estándar general recomendado hoy en día." },
          { title: "Pega el texto o contenido", text: "Se procesa directamente en tu navegador, sin enviarlo a ningún servidor." },
          { title: "Copia el hash resultante", text: "Una cadena hexadecimal de longitud fija según el algoritmo elegido." },
          { title: "Compáralo con el hash de referencia", text: "Si coinciden exactamente, el contenido no fue alterado." },
        ],
      },
      {
        type: "p",
        text: "Un detalle importante: cambiar un solo carácter en la entrada produce un hash completamente distinto — no un hash 'parecido'. Esto es lo que hace útil a un hash para detectar hasta la alteración más mínima.",
      },
    ],
  },
  {
    slug: "como-unir-archivos-pdf-online",
    title: "Cómo unir archivos PDF online, gratis y sin subir tus documentos",
    excerpt:
      "Combinar varios PDF en uno solo no debería requerir instalar un programa ni subir contratos o identificaciones a un servidor desconocido. Así se hace bien, en menos de un minuto.",
    description:
      "Guía práctica para unir varios PDF en un solo archivo, en el orden correcto, sin instalar programas ni subir tus documentos a un servidor.",
    datePublished: "2026-08-19",
    readingTime: "4 min",
    relatedTool: "pdf-unir",
    content: [
      {
        type: "p",
        text: "Tienes tres archivos distintos — un contrato, un anexo y una identificación escaneada — y necesitas enviarlos como un solo PDF. Hacerlo bien, en el orden correcto y sin perder calidad, toma menos de un minuto si usas la herramienta correcta.",
      },
      { type: "h2", text: "Cuándo tiene sentido unir varios PDF" },
      {
        type: "ul",
        items: [
          "Combinar varios contratos o formularios firmados en un solo documento antes de enviarlos",
          "Juntar capítulos o secciones de un informe que llegaron por separado",
          "Unir comprobantes o facturas escaneadas antes de mandarlas a contabilidad",
          "Armar un solo PDF con tu CV, portafolio y cartas de recomendación para una postulación",
        ],
      },
      { type: "h2", text: "Cómo unir tus PDF paso a paso" },
      {
        type: "steps",
        items: [
          { title: "Sube tus archivos", text: "Arrastra dos o más PDF, o selecciónalos desde tu computadora." },
          { title: "Ordénalos", text: "Usa las flechas para definir en qué orden quedará cada documento en el archivo final." },
          { title: "Descarga el resultado", text: "Obtienes un solo PDF con todas las páginas, en el orden que definiste." },
        ],
      },
      { type: "h2", text: "Qué pasa con tus archivos" },
      {
        type: "p",
        text: "A diferencia de la mayoría de herramientas online de PDF, unir tus archivos en Herramio ocurre completamente en tu navegador — nunca se suben a un servidor. Esto importa especialmente cuando los documentos contienen información sensible: contratos, identificaciones o datos financieros nunca salen de tu computadora.",
      },
      { type: "h2", text: "Errores comunes al unir PDF" },
      {
        type: "ul",
        items: [
          "Subir los archivos y olvidar reordenarlos antes de descargar el resultado",
          "Intentar unir un PDF protegido con contraseña sin quitarle la protección primero",
          "No abrir el PDF combinado para confirmar que el orden y el contenido son correctos antes de enviarlo",
        ],
      },
    ],
  },
  {
    slug: "como-convertir-imagenes-jpg-png-webp",
    title: "JPG, PNG o WebP: cómo convertir tus imágenes y cuál formato elegir",
    excerpt:
      "Cada formato de imagen sirve para algo distinto — elegir mal significa perder transparencia, cargar peso de más o toparte con un archivo que un programa viejo no puede abrir.",
    description:
      "Guía para convertir imágenes entre JPG, PNG y WebP, con criterios claros sobre cuándo conviene cada formato.",
    datePublished: "2026-08-19",
    readingTime: "4 min",
    relatedTool: "imagen-convertir",
    content: [
      {
        type: "p",
        text: "Tienes una imagen en PNG que pesa demasiado, o un WebP que un programa viejo no abre, o necesitas transparencia y solo tienes un JPG. Cada uno de estos problemas se resuelve convirtiendo al formato correcto — el truco está en saber cuál.",
      },
      { type: "h2", text: "Qué formato usar según lo que necesitas" },
      {
        type: "ul",
        items: [
          "JPG: la mejor opción para fotografías — buena compresión y tamaño de archivo pequeño, sin soporte de transparencia",
          "PNG: necesario cuando la imagen requiere fondo transparente (logos, iconos) o cuando el detalle nítido pesa más que el ahorro de espacio",
          "WebP: suele dar el mejor balance entre calidad y peso para web, aunque algunos programas o sistemas antiguos todavía no lo abren sin problema",
        ],
      },
      { type: "h2", text: "Cómo convertir una imagen paso a paso" },
      {
        type: "steps",
        items: [
          { title: "Sube tu imagen", text: "JPG, PNG o WebP, la que necesites convertir." },
          { title: "Elige el formato de salida", text: "El que necesites según el uso que le vas a dar." },
          { title: "Descarga el resultado", text: "La conversión ocurre al instante, sin esperar." },
        ],
      },
      { type: "h2", text: "Qué pasa con la transparencia al convertir" },
      {
        type: "p",
        text: "Si conviertes una imagen PNG o WebP con transparencia a JPG, el área transparente se rellena automáticamente con fondo blanco — JPG no tiene forma de representar transparencia. Si necesitas conservarla, convierte a PNG o WebP en su lugar.",
      },
      { type: "h2", text: "Errores comunes al convertir imágenes" },
      {
        type: "ul",
        items: [
          "Convertir un logo con transparencia a JPG y descubrir que el fondo ahora es blanco sólido",
          "Elegir WebP para un archivo que necesitas abrir en un programa de diseño antiguo que no lo soporta",
          "Convertir varias veces entre formatos con pérdida (JPG → PNG → JPG de nuevo), acumulando pérdida de calidad innecesaria",
        ],
      },
      { type: "h2", text: "Privacidad" },
      {
        type: "p",
        text: "Al igual que el resto de herramientas de imagen de Herramio, esta conversión ocurre completamente en tu navegador usando la API Canvas nativa — tu imagen nunca se sube a un servidor.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/** Reverse lookup of getBlogPost's relatedTool field, for tool pages to link back to their article. */
export function getBlogPostByTool(toolId: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.relatedTool === toolId);
}
