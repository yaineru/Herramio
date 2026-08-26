export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ({ items, title = "Preguntas frecuentes" }: { items: FAQItem[]; title?: string }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ayuda</p>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-900">{title}</h2>
      <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_24px_rgba(15,23,42,0.02)]">
        {items.map((item) => (
          <details key={item.question} className="group px-5 py-4 open:bg-slate-50/70">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900">
              {item.question}
              <span className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
