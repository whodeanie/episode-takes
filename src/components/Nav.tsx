"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Nav() {
  const [q, setQ] = useState("");
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("et.profile");
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.username) setUsername(p.username);
      }
    } catch {}
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    window.location.href = `/?q=${encodeURIComponent(trimmed)}`;
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-ink-950/80 border-b border-ink-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-block w-7 h-7 rounded bg-gradient-to-br from-screen-gold via-screen-rose to-screen-cyan" />
          <span className="font-display text-xl font-semibold tracking-tight group-hover:text-screen-gold transition">
            Episode Takes
          </span>
        </Link>

        <form onSubmit={onSubmit} className="flex-1 max-w-md mx-auto hidden md:block">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shows"
            className="w-full bg-ink-800/70 border border-ink-700 rounded px-3 py-1.5 text-sm placeholder:text-ink-400 focus:outline-none focus:border-screen-gold"
          />
        </form>

        <Link href="/me" className="text-sm text-ink-300 hover:text-ink-50 transition">
          {username ? `@${username}` : "Profile"}
        </Link>
      </div>
    </header>
  );
}
