"use client";

import { useEffect, useState } from "react";
import type { Episode, Show } from "@/lib/types";
import { EpisodeTile } from "./EpisodeTile";

type Props = {
  show: Show;
};

export function SeasonStrip({ show }: Props) {
  const seasons = show.seasons.length ? show.seasons : [];
  const [seasonNumber, setSeasonNumber] = useState<number>(seasons[0]?.seasonNumber ?? 1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/season?showId=${show.id}&seasonNumber=${seasonNumber}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setEpisodes(data.episodes ?? []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [show.id, seasonNumber]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {seasons.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeasonNumber(s.seasonNumber)}
            className={
              "shrink-0 px-3 py-1.5 rounded text-sm border transition " +
              (s.seasonNumber === seasonNumber
                ? "bg-screen-cyan/15 border-screen-cyan text-screen-cyan"
                : "bg-ink-900 border-ink-700 text-ink-300 hover:border-screen-cyan")
            }
          >
            {s.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video bg-ink-800 animate-pulseSoft rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {episodes.map((ep) => (
            <EpisodeTile key={ep.id} ep={{ ...ep, showName: show.name }} />
          ))}
        </div>
      )}
    </div>
  );
}
