"use client";

import { useState } from "react";
import type { Take } from "@/lib/types";
import { RatingStars } from "./RatingStars";
import { upvoteTake } from "@/lib/store";
import { timeAgo } from "@/lib/format";
import Link from "next/link";

export function TakeList({ takes }: { takes: Take[] }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [bumps, setBumps] = useState<Record<string, number>>({});

  function toggle(id: string) {
    const next = new Set(revealed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setRevealed(next);
  }

  function bump(id: string) {
    upvoteTake(id);
    setBumps({ ...bumps, [id]: (bumps[id] ?? 0) + 1 });
  }

  if (!takes.length) {
    return (
      <div className="rounded-lg border border-ink-800 bg-ink-900/30 p-6 text-center text-sm text-ink-400">
        No takes yet. Be the first.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {takes.map((t) => {
        const hide = t.spoiler && !revealed.has(t.id);
        const upvotes = t.upvotes + (bumps[t.id] ?? 0);
        return (
          <li key={t.id} className="rounded-lg border border-ink-800 bg-ink-900/40 p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="text-sm font-medium">@{t.username}</div>
              <div className="flex items-center gap-3">
                <RatingStars value={t.rating} readOnly size="sm" />
                <span className="text-[11px] text-ink-400">{timeAgo(t.createdAt)}</span>
              </div>
            </div>
            {hide ? (
              <button
                onClick={() => toggle(t.id)}
                className="text-xs px-3 py-1.5 rounded border border-screen-rose/60 text-screen-rose hover:bg-screen-rose/10"
              >
                Spoiler hidden. Click to reveal.
              </button>
            ) : (
              <p className="text-sm text-ink-200 leading-relaxed whitespace-pre-wrap">{t.body}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => bump(t.id)}
                className="text-xs text-ink-400 hover:text-screen-gold"
                aria-label="Upvote"
              >
                ▲ {upvotes} helpful
              </button>
              <Link
                href={`/share/${t.id}`}
                className="text-xs text-ink-400 hover:text-screen-cyan"
              >
                Share
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
