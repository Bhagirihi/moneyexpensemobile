"use client";

import { useState } from "react";

export function Waitlist() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setMessage("You're on the list! We'll email you when Trivense launches.");
      setName("");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to join waitlist");
    }
  }

  return (
    <section id="waitlist" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="gradient-hero overflow-hidden rounded-3xl px-6 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Get early access
            </h2>
            <p className="mt-3 text-white/85">
              Join the waitlist for launch updates, beta invites, and product news.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-3 text-left">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-0 px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-2 ring-transparent focus:ring-white/50"
              />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-0 px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-2 ring-transparent focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-white py-3 text-sm font-bold text-primary transition hover:bg-white/95 disabled:opacity-70"
              >
                {status === "loading" ? "Joining…" : "Join waitlist"}
              </button>
            </form>
            {message ? (
              <p
                className={`mt-4 text-sm ${
                  status === "error" ? "text-red-200" : "text-emerald-100"
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
