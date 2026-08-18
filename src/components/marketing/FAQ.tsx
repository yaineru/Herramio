export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ({ items, title = "Preguntas frecuentes" }: { items: FAQItem[]; title?: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {items.map((item) => (
          <details key={item.question} className="group px-5 py-4 open:bg-slate-50/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900">
              {item.question}
              <span className="shrink-0 text-slate-400 transition-transform group-open:rotate-45">
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
