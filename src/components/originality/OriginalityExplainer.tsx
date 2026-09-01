import Link from "next/link";
import { FileText, Quote, BookOpen, Lock } from "lucide-react";

/**
 * What Originalidad does, in the words someone deciding whether to use it
 * actually needs.
 *
 * Written for the signed-out visitor, because that is who arrives from a
 * search result and who a reviewer sees. Everything behind the login was
 * invisible to them, which left the flagship page thinner than a tool page
 * for a unit converter.
 *
 * The tone is deliberately unsalesy. This category is full of products
 * promising to "detect plagiarism with 100% accuracy", which is not a
 * claim anyone can support — similarity is measurable, plagiarism is a
 * judgement about intent and attribution that only a person can make. Being
 * the page that says so plainly is worth more than matching the competition
 * on adjectives.
 */

const WHAT_IT_ANALYSES = [
  {
    icon: FileText,
    title: "Coincidencias textuales",
    body: "El documento se divide en fragmentos y cada uno se compara contra el corpus disponible. El informe marca coincidencias exactas y casi exactas, y muestra el pasaje de tu documento junto al de la fuente para que puedas leerlos uno al lado del otro.",
  },
  {
    icon: Quote,
    title: "Citas en el texto",
    body: "Detecta citas en formato autor-año (APA) y numérico (IEEE, Vancouver), y las relaciona con la bibliografía. Así se ve qué citas no tienen una referencia que las respalde y qué referencias nunca se citan en el cuerpo.",
  },
  {
    icon: BookOpen,
    title: "Referencias bibliográficas",
    body: "Cada referencia se contrasta contra Crossref, el índice público de metadatos académicos. Una referencia verificada aparece con su DOI; una que no se encuentra se marca como no encontrada, que no es lo mismo que falsa.",
  },
];

export function OriginalityExplainer() {
  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <section aria-labelledby="que-analiza-heading">
        <h2 id="que-analiza-heading" className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
          Qué analiza exactamente
        </h2>
        <div className="mt-6 space-y-4">
          {WHAT_IT_ANALYSES.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="similitud-heading">
        <h2 id="similitud-heading" className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
          Qué significa el índice de similitud
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
          Es el porcentaje del documento que coincide con algo del corpus comparado. Es una medida, no una
          conclusión, y por sí solo dice poco:
        </p>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-700">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>
              Un <strong className="font-semibold text-slate-900">30 % puede ser correcto</strong> en una tesis con
              muchas citas textuales bien atribuidas y una bibliografía extensa.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>
              Un <strong className="font-semibold text-slate-900">5 % puede ser un problema</strong> si ese 5 % es un
              párrafo copiado literalmente y sin comillas.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>
              Un <strong className="font-semibold text-slate-900">0 % no significa original</strong>: significa que no
              coincide con lo que se pudo comparar.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
          Por eso el informe no se queda en el número: muestra cada coincidencia con su contexto, para que quien
          revisa pueda decidir con la evidencia delante.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="fuentes-heading">
        <h2 id="fuentes-heading" className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
          Contra qué se compara
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
          Contra tus propios documentos anteriores y los de tu equipo, si trabajas en uno. Las referencias
          bibliográficas se verifican además contra Crossref.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
          <strong className="font-semibold text-slate-900">No se compara contra internet ni contra bases de datos
          académicas de pago.</strong>{" "}
          Es la limitación más importante y la decimos aquí en vez de dejar que la descubras al leer un informe: es
          útil para revisar tu propio trabajo, comprobar tus citas y detectar reutilización entre tus documentos, no
          para auditar un texto de origen desconocido.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="no-afirma-heading">
        <h2 id="no-afirma-heading" className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
          Lo que este análisis no afirma
        </h2>
        <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-slate-700">
          {[
            "Que un documento sea plagio. Eso depende de la atribución y del contexto, y lo decide una persona.",
            "Que un texto haya sido escrito por una inteligencia artificial. No hay detección de texto generado por IA, porque no es una afirmación que se pueda sostener con evidencia.",
            "Que una referencia sea falsa. Crossref indexa bien los artículos de revista y mal los libros, las tesis y la literatura gris, así que «no encontrada» significa exactamente eso.",
            "Que el documento sea original. Solo puede decir con qué no coincide dentro de lo comparado.",
          ].map((text) => (
            <li key={text} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="formatos-heading">
        <h2 id="formatos-heading" className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
          Formatos y privacidad
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Formatos admitidos</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              PDF, DOCX y TXT. Un PDF escaneado (una imagen de un papel) no se puede analizar porque no contiene
              texto; el sistema lo detecta y te lo dice en vez de devolver un informe vacío.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />
              Privacidad
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              A diferencia del resto de herramientas, Originalidad necesita una cuenta y guarda tus documentos para
              poder compararlos. Solo tú — y tu equipo, si lo subiste ahí — podéis verlos. Puedes eliminarlos cuando
              quieras. El detalle está en{" "}
              <Link href="/privacidad" className="font-medium text-emerald-700 hover:underline">
                la política de privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
