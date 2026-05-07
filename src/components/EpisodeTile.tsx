import Link from "next/link";
import type { Episode } from "@/lib/types";
import { stillUrl } from "@/lib/images";
import { fmtAirDate, fmtRating } from "@/lib/format";

export function EpisodeTile({ ep }: { ep: Episode }) {
  const still = stillUrl(ep.stillPath, "w300");
  return (
    <Link
      href={`/episode/${ep.showId}-${ep.seasonNumber}-${ep.episodeNumber}`}
      className="group block rounded-lg overflow-hidden border border-ink-800 bg-ink-900/40 hover:border-screen-cyan transition"
    >
      <div className="aspect-video bg-ink-800 overflow-hidden">
        {still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={still} alt={ep.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full grid place-items-center text-ink-500 text-xs">
            S{ep.seasonNumber} · E{ep.episodeNumber}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <div className="text-[11px] text-ink-400 tabular-nums">
          S{ep.seasonNumber} · E{ep.episodeNumber}
        </div>
        <div className="text-sm font-medium leading-tight line-clamp-2 mt-0.5 group-hover:text-screen-cyan transition">
          {ep.name}
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px] text-ink-400">
          <span>{fmtAirDate(ep.airDate)}</span>
          <span>★ {fmtRating(ep.voteAverage)}</span>
        </div>
      </div>
    </Link>
  );
}
