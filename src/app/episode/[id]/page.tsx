import { notFound } from "next/navigation";
import Link from "next/link";
import { getEpisode, stillUrl } from "@/lib/tmdb";
import { fmtAirDate, fmtRuntime, fmtRating } from "@/lib/format";
import { EpisodeView } from "./EpisodeView";

export const revalidate = 3600;

type Params = Promise<{ id: string }>;

// id is encoded as `${showId}-${seasonNumber}-${episodeNumber}` so links are
// stable across TMDB id schemes and survive caching layers.
function parseId(raw: string): { showId: number; seasonNumber: number; episodeNumber: number } | null {
  const parts = raw.split("-");
  if (parts.length !== 3) return null;
  const [s, se, ep] = parts.map((p) => Number(p));
  if ([s, se, ep].some((n) => !Number.isFinite(n))) return null;
  return { showId: s, seasonNumber: se, episodeNumber: ep };
}

export default async function EpisodePage({ params }: { params: Params }) {
  const { id } = await params;
  const parsed = parseId(id);
  if (!parsed) notFound();

  let episode;
  try {
    episode = await getEpisode(parsed.showId, parsed.seasonNumber, parsed.episodeNumber);
  } catch {
    notFound();
  }

  const still = stillUrl(episode.stillPath, "original");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-xs text-ink-400 mb-3">
        <Link href={`/show/${episode.showId}`} className="hover:text-screen-cyan">{episode.showName}</Link>
        <span className="px-2">/</span>
        <span>S{episode.seasonNumber} · E{episode.episodeNumber}</span>
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{episode.name}</h1>
      <div className="text-sm text-ink-400 mt-1">
        {fmtAirDate(episode.airDate)}
        {episode.runtime ? ` · ${fmtRuntime(episode.runtime)}` : ""}
        {episode.voteAverage ? ` · TMDB ★ ${fmtRating(episode.voteAverage)}` : ""}
      </div>

      {still ? (
        <div className="mt-5 rounded-xl overflow-hidden border border-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={still} alt={episode.name} className="w-full h-auto object-cover" />
        </div>
      ) : null}

      <p className="mt-5 text-ink-200 leading-relaxed">{episode.overview}</p>

      <EpisodeView episode={episode} />
    </div>
  );
}
