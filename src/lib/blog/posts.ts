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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
