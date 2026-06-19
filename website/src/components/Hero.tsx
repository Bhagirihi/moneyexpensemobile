import Image from "next/image";
import { site } from "@/lib/content";

export function Hero() {
  return (
    <section className="gradient-hero relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            Expense tracking for travelers
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#waitlist"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Join the waitlist
            </a>
            <a
              href="#features"
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See features
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/75">
            <span>✓ Real-time sync</span>
            <span>✓ Group boards</span>
            <span>✓ INR & multi-currency</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="glass-card rounded-[2rem] p-4 shadow-2xl">
            <div className="overflow-hidden rounded-[1.5rem] bg-slate-50">
              <div className="gradient-hero px-5 pb-6 pt-8">
                <p className="text-xs font-semibold text-white/70">Total budget left</p>
                <p className="mt-1 text-3xl font-bold text-white">₹42,350</p>
                <p className="mt-1 text-sm text-white/75">Europe Trip 2025</p>
              </div>
              <div className="space-y-3 p-4">
                {[
                  { label: "Hotel stay", amount: "₹6,000", cat: "Travel" },
                  { label: "Restaurant dinner", amount: "₹1,826", cat: "Food" },
                  { label: "Local tour", amount: "₹2,449", cat: "Travel" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{row.label}</p>
                      <p className="text-xs text-muted">{row.cat}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{row.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            className="absolute -bottom-4 -left-4 rounded-xl bg-white p-2 shadow-lg"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
