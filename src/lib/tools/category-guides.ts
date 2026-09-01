import type { CategoryId } from "@/lib/tools/categories";

/**
 * Per-category guidance: what these tools are for, which one to pick, and
 * what they cannot do.
 *
 * This exists because the category pages were measurably near-duplicates
 * of /herramientas — 63% to 85% shingle overlap, the highest on the site.
 * Each one was a grid of tools that also appears on the index, one intro
 * paragraph, and two FAQ entries whose text was identical across all eight
 * categories with only the category name swapped. That is the definition
 * of a templated page, and no amount of layout work fixes it.
 *
 * The fix is not more words. `chooseByTask` is the part that earns its
 * place: someone who lands on /categoria/pdf usually knows their PROBLEM
 * ("this PDF is too big to email") and not which of 23 tools solves it.
 * Mapping tasks to tools answers that, and the internal links fall out of
 * genuinely useful navigation rather than being sprinkled in for crawlers.
 *
 * `limits` is deliberately blunt. Browser-side processing has real
 * trade-offs — no OCR, no server-grade recompression — and a category page
 * that only sells is less useful than one that tells you when to look
 * elsewhere.
 */

export interface CategoryGuide {
  /** "I want to do X" -> the specific tool. Real navigation, and where the internal links come from. */
  chooseByTask: { task: string; tool: string; href: string }[];
  /** What this family of tools genuinely cannot do. */
  limits: string[];
  /** Questions specific to this category — never the same text with a noun swapped. */
  faq: { question: string; answer: string }[];
}

export const CATEGORY_GUIDES: Record<CategoryId, CategoryGuide> = {
  qr: {
    chooseByTask: [
      { task: "Llevar a alguien a una página web", tool: "QR para enlaces", href: "/qr-url" },
      { task: "Que te escriban por WhatsApp sin guardar tu número", tool: "QR de WhatsApp", href: "/qr-whatsapp" },
      { task: "Dar acceso a tu WiFi sin dictar la contraseña", tool: "QR de WiFi", href: "/qr-wifi" },
      { task: "Poner la carta de un restaurante en la mesa", tool: "QR para menú", href: "/qr-menu" },
      { task: "Compartir tus datos de contacto en una tarjeta impresa", tool: "QR de vCard", href: "/qr-vcard" },
      { task: "Saber qué contiene un QR que te dieron", tool: "Lector de QR", href: "/qr-lector" },
    ],
    limits: [
      "Un código QR es estático: apunta siempre al mismo destino. Si cambias la URL, hay que generar e imprimir uno nuevo.",
      "Cuanta más información metas (una vCard larga, por ejemplo), más denso sale el código y peor se lee impreso en tamaño pequeño.",
      "No hay estadísticas de escaneo. Para saber cuánta gente lo usa, apunta el QR a una URL con parámetros de seguimiento propios.",
    ],
    faq: [
      {
        question: "¿Caduca un código QR generado aquí?",
        answer:
          "No. El código no depende de Herramio: el destino va codificado dentro de la propia imagen, así que sigue funcionando aunque este sitio deje de existir. Por eso tampoco podemos cambiarlo después.",
      },
      {
        question: "¿De qué tamaño debo imprimirlo?",
        answer:
          "La regla práctica es 1 cm de lado por cada 10 cm de distancia de lectura. Para una mesa (unos 30 cm) bastan 3 cm; para un cartel a 2 metros, unos 20 cm. Descarga el SVG si vas a imprimir grande: no se pixela al ampliar.",
      },
      {
        question: "¿Por qué mi QR de WiFi no funciona en algunos teléfonos?",
        answer:
          "El formato estándar de WiFi lo leen de forma nativa Android y iOS desde la cámara, pero algunas apps de lectura genéricas solo muestran el texto en crudo. También hay que elegir bien el tipo de cifrado (WPA/WPA2 frente a red abierta).",
      },
    ],
  },

  pdf: {
    chooseByTask: [
      { task: "Juntar varios PDF en un solo archivo", tool: "Unir PDF", href: "/pdf-unir" },
      { task: "Sacar solo algunas páginas de un documento", tool: "Dividir PDF", href: "/pdf-dividir" },
      { task: "Un PDF pesa demasiado para enviarlo por correo", tool: "Comprimir PDF", href: "/pdf-comprimir" },
      { task: "Convertir fotos o escaneos en un PDF", tool: "JPG a PDF", href: "/jpg-a-pdf" },
      { task: "Copiar el texto de un PDF", tool: "Extraer texto de PDF", href: "/pdf-extraer-texto" },
      { task: "Firmar un documento sin imprimirlo", tool: "Firmar PDF", href: "/pdf-firmar" },
      { task: "Ver qué cambió entre dos versiones", tool: "Comparar texto de dos PDF", href: "/pdf-comparar-texto" },
      { task: "Quitar datos ocultos antes de enviarlo", tool: "Eliminar metadata de PDF", href: "/pdf-eliminar-metadata" },
    ],
    limits: [
      "No hay OCR: si el PDF es un escaneo (una imagen de un papel), no se puede extraer su texto ni compararlo. Herramio te lo dirá en vez de devolver un resultado vacío.",
      "La compresión trabaja sobre las imágenes incrustadas. Un PDF que ya es solo texto apenas bajará de tamaño, porque no hay nada que comprimir.",
      "Los PDF protegidos con contraseña hay que desbloquearlos antes en el programa que los creó.",
    ],
    faq: [
      {
        question: "¿Se suben mis documentos a un servidor?",
        answer:
          "No. Todas las herramientas de PDF trabajan dentro de tu navegador con la librería pdf-lib; el archivo nunca sale de tu equipo. Puedes comprobarlo desconectando internet después de cargar la página: seguirán funcionando.",
      },
      {
        question: "¿Por qué mi PDF comprimido casi no bajó de peso?",
        answer:
          "Porque el peso no estaba en las imágenes. Si el documento son páginas de texto con fuentes incrustadas, ya está cerca de su mínimo. La compresión da resultados grandes en documentos con fotos o escaneos a alta resolución.",
      },
      {
        question: "¿Una firma hecha aquí tiene validez legal?",
        answer:
          "Es una firma visual: dibuja tu rúbrica sobre el documento. No es una firma digital certificada con criptografía, que es lo que exigen algunos trámites oficiales. Para contratos que requieran firma electrónica avanzada, necesitas un prestador acreditado.",
      },
    ],
  },

  imagenes: {
    chooseByTask: [
      { task: "Una foto pesa demasiado para subirla", tool: "Comprimir imagen", href: "/imagen-comprimir" },
      { task: "Necesitas exactamente 2 MB o menos", tool: "Comprimir a un tamaño exacto", href: "/imagen-comprimir-a-tamano" },
      { task: "Pasar de PNG a JPG o a WebP", tool: "Convertidor de imágenes", href: "/imagen-convertir" },
      { task: "Ajustar una imagen a medidas concretas", tool: "Redimensionar imagen", href: "/imagen-redimensionar" },
      { task: "Preparar una foto para Instagram o LinkedIn", tool: "Recortar para redes sociales", href: "/imagen-recortar-redes-sociales" },
      { task: "Tapar una cara, una matrícula o un dato", tool: "Desenfocar zona", href: "/imagen-desenfocar" },
      { task: "Borrar la ubicación GPS de una foto", tool: "Eliminar metadata", href: "/imagen-eliminar-metadata" },
      { task: "Sacar los colores exactos de un diseño", tool: "Extractor de paleta", href: "/imagen-paleta-colores" },
    ],
    limits: [
      "No se puede recuperar calidad perdida. Ampliar una imagen pequeña la hace más grande, no más nítida.",
      "El recorte de fondo funciona con fondos de color sólido y uniforme. Para recortes complejos (pelo, bordes difusos) hace falta una herramienta con modelo de segmentación.",
      "Los archivos muy grandes (por encima de unos 30 MP) pueden agotar la memoria del navegador en móviles antiguos, porque todo el procesamiento ocurre en tu dispositivo.",
    ],
    faq: [
      {
        question: "¿Qué formato me conviene: JPG, PNG o WebP?",
        answer:
          "JPG para fotografías, donde la compresión con pérdida apenas se nota y ahorra mucho. PNG cuando necesitas transparencia o bordes nítidos, como logotipos y capturas de pantalla. WebP pesa menos que ambos con calidad similar y lo admiten todos los navegadores actuales, aunque algunos programas de escritorio antiguos aún no lo abren.",
      },
      {
        question: "¿Eliminar la metadata cambia la imagen?",
        answer:
          "No cambia un solo píxel visible. Lo que se borra son los datos EXIF: coordenadas GPS, modelo de cámara, fecha y a veces el nombre del propietario. Es lo que conviene quitar antes de publicar una foto tomada con el móvil.",
      },
      {
        question: "¿Por qué la imagen comprimida se ve con manchas?",
        answer:
          "Es el artefacto típico de la compresión JPG en zonas de color plano o degradados suaves. Sube el nivel de calidad, o usa PNG si la imagen tiene grandes áreas de un solo color.",
      },
    ],
  },

  calculadoras: {
    chooseByTask: [
      { task: "Cuánto es un porcentaje de algo, o qué porcentaje representa", tool: "Calculadora de porcentaje", href: "/calc-porcentaje" },
      { task: "Cuánto pagas con un descuento aplicado", tool: "Calculadora de descuento", href: "/calc-descuento" },
      { task: "Separar el IVA de un precio final", tool: "Calculadora de IVA", href: "/calc-iva" },
      { task: "Repartir una cuenta entre varias personas", tool: "Dividir cuenta", href: "/finanzas-dividir-cuenta" },
      { task: "Cuánto pagarías de cuota por un préstamo", tool: "Calculadora de préstamo", href: "/finanzas-prestamo" },
      { task: "Cuánto crece un ahorro con el tiempo", tool: "Interés compuesto", href: "/finanzas-interes-compuesto" },
      { task: "Cuántos días faltan entre dos fechas", tool: "Diferencia entre fechas", href: "/calc-fecha" },
    ],
    limits: [
      "Son calculadoras, no asesoría financiera. La de préstamos usa el sistema de cuota fija y no incluye seguros, comisiones de apertura ni gastos que cada entidad añade por su cuenta.",
      "El IMC es un indicador poblacional, no un diagnóstico: no distingue masa muscular de grasa y no debe interpretarse sin criterio médico.",
      "Los cálculos de inflación dependen del índice que se use como referencia; sirven para comparar órdenes de magnitud, no para trámites oficiales.",
    ],
    faq: [
      {
        question: "¿Los resultados sirven para una declaración o un trámite?",
        answer:
          "Sirven para entender un número y comprobar una cuenta rápida. Para un trámite oficial usa siempre las cifras y los tipos que publique la entidad correspondiente, que pueden variar por país, por año y por tipo de producto.",
      },
      {
        question: "¿Cómo se calcula el IVA hacia atrás desde un precio final?",
        answer:
          "No se resta el porcentaje al precio final: se divide. Con un IVA del 19 %, la base es el precio final dividido entre 1,19, y el impuesto es la diferencia. Restar el 19 % directamente da un resultado más bajo del real, y es el error más común.",
      },
      {
        question: "¿Se guardan los datos que introduzco?",
        answer:
          "No. Los cálculos ocurren en tu navegador y nada se envía ni se almacena, lo que importa especialmente en las calculadoras de salario, préstamos y gastos.",
      },
    ],
  },

  convertidores: {
    chooseByTask: [
      { task: "Pasar metros a pies, kilos a libras y similares", tool: "Convertidor de unidades", href: "/conv-unidades" },
      { task: "Celsius a Fahrenheit o Kelvin", tool: "Convertidor de temperatura", href: "/conv-temperatura" },
      { task: "Cambiar entre monedas con tipo de cambio actual", tool: "Convertidor de moneda", href: "/conv-moneda" },
      { task: "Saber qué hora es en otra ciudad", tool: "Convertidor de zona horaria", href: "/conv-zona-horaria" },
      { task: "Escribir una cifra en letras para un documento", tool: "Número a letras", href: "/conv-numero-a-letras" },
      { task: "Convertir Markdown a HTML", tool: "Markdown a HTML", href: "/conv-markdown-html" },
      { task: "Pasar MB a GB o bytes", tool: "Tamaño de datos", href: "/conv-datos" },
    ],
    limits: [
      "El convertidor de moneda es el único de Herramio que consulta un servicio externo, porque un tipo de cambio necesita datos actualizados. Los demás calculan en tu navegador.",
      "Los tipos de cambio son de referencia: tu banco o tu tarjeta aplicará el suyo, normalmente con un diferencial.",
      "Las conversiones de zona horaria tienen en cuenta el horario de verano vigente, que algunos países cambian de un año a otro por decisión política.",
    ],
    faq: [
      {
        question: "¿Cada cuánto se actualizan los tipos de cambio?",
        answer:
          "A diario, desde una fuente pública de referencia. Sirven para estimar y comparar, no para cerrar una operación: para eso vale el tipo que te aplique tu entidad en el momento exacto de la transacción.",
      },
      {
        question: "¿Por qué convertir MB a GB da 1000 en un sitio y 1024 en otro?",
        answer:
          "Porque son dos sistemas distintos. Los fabricantes de discos usan el decimal (1 GB = 1000 MB) y los sistemas operativos suelen usar el binario (1 GiB = 1024 MiB). De ahí que un disco de 1 TB aparezca como 931 GB en tu ordenador: no falta espacio, se está midiendo de otra forma.",
      },
      {
        question: "¿El convertidor de número a letras sirve para cheques y facturas?",
        answer:
          "Sí, es su uso habitual. Ten en cuenta que la forma de escribir los céntimos y la moneda varía según el país y el formato del documento, así que revisa el resultado antes de copiarlo a un impreso oficial.",
      },
    ],
  },

  texto: {
    chooseByTask: [
      { task: "Saber cuántas palabras tiene un escrito", tool: "Contador de palabras", href: "/texto-contador-palabras" },
      { task: "Crear una contraseña difícil de adivinar", tool: "Generador de contraseñas", href: "/texto-generador-contrasenas" },
      { task: "Comprobar si tu contraseña actual es débil", tool: "Verificar fuerza", href: "/texto-verificar-contrasena" },
      { task: "Ver qué cambió entre dos versiones de un texto", tool: "Comparar dos textos", href: "/texto-comparar" },
      { task: "Quitar saltos de línea y espacios de un texto pegado", tool: "Limpiador de texto", href: "/texto-limpiar" },
      { task: "Convertir un título en URL amigable", tool: "Generador de slugs", href: "/texto-slug" },
      { task: "Dar formato a una cita bibliográfica", tool: "Generador de citas APA", href: "/texto-citas-apa" },
    ],
    limits: [
      "El contador de palabras cuenta separaciones por espacios, que es el criterio habitual, pero un corrector académico puede contar de otra forma (con o sin notas al pie, títulos o bibliografía).",
      "El generador de citas da formato a los datos que introduces; no verifica que la fuente exista ni que los datos sean correctos.",
      "La comparación de textos señala diferencias literales, no equivalencias de significado: dos frases que dicen lo mismo con otras palabras aparecerán como distintas.",
    ],
    faq: [
      {
        question: "¿Es seguro generar una contraseña en una página web?",
        answer:
          "Depende de dónde se genere. Aquí se crea en tu navegador con la API Web Crypto del propio sistema, no en un servidor, y nunca se transmite ni se guarda. Aun así, la práctica recomendada es generarla dentro de tu gestor de contraseñas, que además la almacena cifrada.",
      },
      {
        question: "¿Qué hace fuerte a una contraseña?",
        answer:
          "La longitud, mucho más que los símbolos raros. Una frase de cuatro palabras poco relacionadas resiste mejor un ataque por fuerza bruta que ocho caracteres con signos, y se recuerda sin apuntarla. Lo decisivo es que sea distinta en cada servicio.",
      },
      {
        question: "¿El comparador de textos detecta plagio?",
        answer:
          "No. Compara dos textos que tú aportas y marca las diferencias. Para analizar un documento frente a un conjunto de fuentes está Originalidad, que mide similitud y presenta evidencia para que una persona la revise.",
      },
    ],
  },

  desarrolladores: {
    chooseByTask: [
      { task: "Ordenar y validar un JSON ilegible", tool: "Formateador de JSON", href: "/dev-json-formatter" },
      { task: "Ver qué contiene un token JWT", tool: "Decodificador de JWT", href: "/dev-jwt-decoder" },
      { task: "Probar una expresión regular sobre un texto", tool: "Probador de regex", href: "/dev-regex-tester" },
      { task: "Entender qué hace una regex que no escribiste tú", tool: "Explicador de regex", href: "/dev-regex-explicador" },
      { task: "Traducir una expresión cron a lenguaje natural", tool: "Traductor de cron", href: "/dev-cron" },
      { task: "Convertir un JSON de ejemplo en tipos TypeScript", tool: "JSON a TypeScript", href: "/dev-json-a-typescript" },
      { task: "Calcular el hash SHA-256 de un texto", tool: "Generador de hash", href: "/dev-hash-generator" },
      { task: "Pasar un CSV a JSON", tool: "CSV a JSON", href: "/dev-csv-json" },
    ],
    limits: [
      "El decodificador de JWT lee el contenido del token; no comprueba la firma, porque eso exigiría la clave secreta del emisor. Un token decodificado legible no es un token válido.",
      "Los tipos generados desde JSON se infieren del ejemplo que pegas: no puede adivinar campos opcionales que no aparezcan ni tipos que no estén representados.",
      "El generador de hash usa la API Web Crypto del navegador. SHA-1 y MD5 se incluyen por compatibilidad con sistemas antiguos, pero no deben usarse para nada relacionado con seguridad.",
    ],
    faq: [
      {
        question: "¿Puedo pegar aquí un token o una clave de producción?",
        answer:
          "Técnicamente el procesamiento es local y nada se envía a un servidor, pero la recomendación sigue siendo no pegar credenciales reales en ninguna web. Usa un token de prueba o uno ya caducado: para inspeccionar la estructura sirve igual.",
      },
      {
        question: "¿Por qué un hash MD5 o SHA-1 no vale para contraseñas?",
        answer:
          "Porque son rápidos por diseño, y esa velocidad es justo lo que ayuda a quien intenta romperlos por fuerza bruta. Para contraseñas se usan funciones deliberadamente lentas y con sal, como bcrypt, scrypt o Argon2. Los hashes de aquí sirven para verificar integridad de archivos, no para almacenar secretos.",
      },
      {
        question: "¿Estas herramientas funcionan sin conexión?",
        answer:
          "Sí, una vez cargada la página. Todo el cómputo ocurre en el navegador, así que puedes desconectarte y seguir formateando JSON o probando expresiones regulares.",
      },
    ],
  },

  productividad: {
    chooseByTask: [
      { task: "Trabajar por bloques con descansos", tool: "Temporizador Pomodoro", href: "/productividad-temporizador" },
      { task: "Medir cuánto tardas en algo", tool: "Cronómetro", href: "/productividad-cronometro" },
      { task: "Elegir un ganador al azar de forma transparente", tool: "Sorteador de nombres", href: "/productividad-sorteador" },
      { task: "Repartir a un grupo en equipos equilibrados", tool: "Generador de equipos", href: "/productividad-generador-equipos" },
      { task: "Contar los días que faltan para una fecha", tool: "Cuenta regresiva", href: "/productividad-cuenta-regresiva" },
      { task: "Pasar horas y minutos a decimal para facturar", tool: "Horas a decimal", href: "/productividad-horas-decimal" },
      { task: "Apuntar tareas o notas sueltas", tool: "Lista de tareas", href: "/productividad-lista-tareas" },
    ],
    limits: [
      "Las notas y las listas se guardan en el almacenamiento local de tu navegador, no en una cuenta. Si borras los datos del navegador o cambias de dispositivo, no estarán allí.",
      "El temporizador necesita la pestaña abierta. Algunos navegadores en móvil ralentizan las pestañas en segundo plano para ahorrar batería.",
      "El sorteador usa el generador aleatorio del navegador: es suficiente para un sorteo entre amigos, pero no sustituye a un sorteo con validez legal ante notario.",
    ],
    faq: [
      {
        question: "¿Qué es la técnica Pomodoro y por qué 25 minutos?",
        answer:
          "Consiste en trabajar en bloques con descansos cortos entre ellos. Los 25 minutos son la propuesta original de Francesco Cirillo, no una cifra óptima demostrada: lo útil es el compromiso de no interrumpirte durante el bloque. Si tu trabajo requiere concentración larga, bloques de 50 minutos suelen funcionar mejor.",
      },
      {
        question: "¿Se pierden mis notas si cierro la pestaña?",
        answer:
          "No. Se guardan en el almacenamiento local de tu navegador y siguen ahí al volver. Lo que sí las borra es limpiar los datos de navegación, usar modo incógnito o abrir el sitio en otro dispositivo.",
      },
      {
        question: "¿El sorteador es realmente aleatorio?",
        answer:
          "Usa el generador de números aleatorios del navegador, que es adecuado para sorteos informales. Para un sorteo con premios de valor o consecuencias legales, la transparencia importa más que el algoritmo: graba el proceso o usa un servicio con acta verificable.",
      },
    ],
  },
};
