"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTake } from "@/lib/store";
import type { Take } from "@/lib/types";
import { RatingStars } from "@/components/RatingStars";
import { timeAgo } from "@/lib/format";

export function ShareView({ takeId }: { takeId: string }) {
  const [take, setTake] = useState<Take | null | undefined>(undefined);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTake(getTake(takeId));
  }, [takeId]);

  function copy() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (take === undefined) return null;

  if (take === null) {
    return (
      <div className="rounded-lg border border-ink-800 bg-ink-900/40 p-8 text-center">
        <h1 className="font-display text-2xl">Take not found</h1>
        <p className="text-sm text-ink-400 mt-2">
          Take URLs are scoped to the device that wrote them in this version of the app. The author needs to open the same browser to surface it. Cross device share lands in v2.
        </p>
        <Link href="/" className="inline-block mt-4 text-sm text-screen-cyan">Back home</Link>
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950 p-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-screen-rose blur-3xl opacity-30" />
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-ink-400">A take by @{take.username}</div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mt-1">
          <Link href={`/show/${take.showId}`} className="hover:text-screen-cyan">{take.showName}</Link>
          <span className="text-ink-400"> · S{take.seasonNumber} · E{take.episodeNumber}</span>
        </h1>
        <div className="text-sm text-ink-300 mt-1">{take.episodeName}</div>
        <div className="flex items-center gap-3 mt-3">
          <RatingStars value={take.rating} readOnly size="md" />
          <span className="text-xs text-ink-400">{timeAgo(take.createdAt)}</span>
        </div>
        <div className="mt-6">
          {take.spoiler && !reveal ? (
            <button
              onClick={() => setReveal(true)}
              className="px-4 py-2 rounded border border-screen-rose/60 text-screen-rose hover:bg-screen-rose/10 text-sm"
            >
              Spoiler. Click to reveal.
            </button>
          ) : (
            <p className="text-base leading-relaxed text-ink-100 whitespace-pre-wrap">{take.body}</p>
          )}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={copy}
            className="text-xs px-3 py-1.5 rounded border border-ink-700 hover:border-screen-cyan"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link
            href={`/episode/${take.showId}-${take.seasonNumber}-${take.episodeNumber}`}
            className="text-xs px-3 py-1.5 rounded border border-ink-700 hover:border-screen-gold"
          >
            Read more takes
          </Link>
        </div>
      </div>
    </article>
  );
}
