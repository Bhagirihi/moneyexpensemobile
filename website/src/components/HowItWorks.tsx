import { steps } from "@/lib/content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Up and running in minutes
          </h2>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <span className="text-4xl font-black text-indigo-100">{item.step}</span>
              <h3 className="mt-2 text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
