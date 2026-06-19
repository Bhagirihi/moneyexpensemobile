import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold text-foreground">{site.name}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted">
          <a href="#features" className="hover:text-primary">
            Features
          </a>
          <a href="#pricing" className="hover:text-primary">
            Pricing
          </a>
          <a href="#waitlist" className="hover:text-primary">
            Waitlist
          </a>
          <a href={`mailto:${site.supportEmail}`} className="hover:text-primary">
            Contact
          </a>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
