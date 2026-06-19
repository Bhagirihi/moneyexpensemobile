import { faqs } from "@/lib/content";

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Common questions
          </h2>
        </div>
        <div className="mt-10 space-y-4">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 open:bg-white open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold text-foreground marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-primary transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
