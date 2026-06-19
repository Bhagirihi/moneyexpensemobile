import { plans } from "@/lib/content";

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Simple plans, no surprises
          </h2>
          <p className="mt-4 text-muted">
            Start free. Upgrade when you need sharing, analytics, and unlimited boards.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-white shadow-xl ring-2 ring-primary/20"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              {plan.highlighted ? (
                <span className="mb-4 inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-primary">
                  Most popular
                </span>
              ) : (
                <span className="mb-4 h-6" />
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-0.5 text-accent">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-bold transition ${
                  plan.highlighted
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "border border-slate-200 text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
