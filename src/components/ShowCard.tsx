import Link from "next/link";
import { posterUrl } from "@/lib/images";
import type { ShowSummary } from "@/lib/types";
import { fmtAirDate, fmtRating } from "@/lib/format";

export function ShowCard({ show }: { show: ShowSummary }) {
  const poster = posterUrl(show.posterPath, "w342");
  return (
    <Link
      href={`/show/${show.id}`}
      className="group block rounded-lg overflow-hidden border border-ink-800 bg-ink-900/50 hover:border-screen-gold transition"
    >
      <div className="aspect-[2/3] bg-ink-800 overflow-hidden">
        {poster ? (
          // Using a plain img keeps the bundle smaller than next/image and dodges
          // any TMDB caching corner cases on Vercel.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={show.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-ink-500 text-sm font-display">
            {show.name.slice(0, 2)}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-screen-gold transition">
          {show.name}
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-ink-400">
          <span>{fmtAirDate(show.firstAirDate).split(",").slice(-1)[0]?.trim()}</span>
          <span>★ {fmtRating(show.voteAverage)}</span>
        </div>
      </div>
    </Link>
  );
}
