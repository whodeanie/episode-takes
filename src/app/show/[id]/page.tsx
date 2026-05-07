import { notFound } from "next/navigation";
import { getShow, posterUrl, tmdbReady } from "@/lib/tmdb";
import { SeasonStrip } from "@/components/SeasonStrip";
import { WatchButton } from "@/components/WatchButton";
import { fmtAirDate, fmtRating } from "@/lib/format";

export const revalidate = 3600;

type Params = Promise<{ id: string }>;

export default async function ShowPage({ params }: { params: Params }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  let show;
  try {
    show = await getShow(numericId);
  } catch {
    notFound();
  }

  const poster = posterUrl(show.posterPath, "w500");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="grid md:grid-cols-[260px,1fr] gap-6">
        <div className="rounded-lg overflow-hidden border border-ink-800 bg-ink-900 aspect-[2/3] max-w-[260px]">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt={show.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-ink-500 font-display text-3xl">
              {show.name.slice(0, 2)}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{show.name}</h1>
          <div className="text-sm text-ink-400 mt-1">
            {show.firstAirDate ? fmtAirDate(show.firstAirDate) : ""}
            {show.networks?.[0] ? ` · ${show.networks[0]}` : ""}
            {show.status ? ` · ${show.status}` : ""}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {show.genres.map((g) => (
              <span key={g} className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border border-ink-700 bg-ink-900 text-ink-300">
                {g}
              </span>
            ))}
          </div>
          <p className="mt-4 text-ink-200 leading-relaxed max-w-2xl">{show.overview}</p>
          <div className="grid grid-cols-3 gap-4 mt-5 max-w-md text-sm">
            <Stat label="TMDB rating" value={`★ ${fmtRating(show.voteAverage)}`} />
            <Stat label="Seasons" value={String(show.numberOfSeasons)} />
            <Stat label="Episodes" value={String(show.numberOfEpisodes)} />
          </div>
          <div className="mt-5">
            <WatchButton show={show} />
          </div>
          {!tmdbReady() ? (
            <div className="mt-4 text-xs text-ink-400">
              Showing demo data. Add a TMDB_API_KEY to load real seasons.
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl mb-4">Episodes</h2>
        <SeasonStrip show={show} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink-800 bg-ink-900/40 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-lg font-display tabular-nums">{value}</div>
    </div>
  );
}
