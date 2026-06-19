import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/content";

const nav = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#4f46e5]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt={site.name}
            width={36}
            height={36}
            className="rounded-lg bg-white p-1"
          />
          <span className="text-lg font-bold text-white">{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/85 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#waitlist"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
        >
          Join waitlist
        </a>
      </div>
    </header>
  );
}
