"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Take } from "@/lib/types";
import { getTakes } from "@/lib/store";
import { RatingStars } from "./RatingStars";
import { timeAgo } from "@/lib/format";

export function RecentActivity() {
  const [takes, setTakes] = useState<Take[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTakes(getTakes().sort((a, b) => b.createdAt - a.createdAt).slice(0, 8));
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!takes.length) {
    return (
      <div className="rounded-lg border border-ink-800 bg-ink-900/30 p-6 text-sm text-ink-400 text-center">
        Your recent takes will appear here once you write one. Pick an episode and start.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {takes.map((t) => (
        <li key={t.id}>
          <Link
            href={`/episode/${t.showId}-${t.seasonNumber}-${t.episodeNumber}`}
            className="block rounded-lg border border-ink-800 bg-ink-900/40 p-3 hover:border-screen-cyan transition"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-sm font-medium">
                  {t.showName} <span className="text-ink-400">S{t.seasonNumber} · E{t.episodeNumber}</span>
                </div>
                <div className="text-xs text-ink-400">{t.episodeName}</div>
              </div>
              <div className="flex items-center gap-3">
                <RatingStars value={t.rating} readOnly size="sm" />
                <span className="text-[11px] text-ink-400">{timeAgo(t.createdAt)}</span>
              </div>
            </div>
            {t.body ? (
              <p className="text-xs text-ink-300 mt-2 line-clamp-2">
                {t.spoiler ? "Spoiler hidden. Open the episode to read." : t.body}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
