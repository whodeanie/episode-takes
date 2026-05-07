import Link from "next/link";
import { searchShows, trendingShows, tmdbReady } from "@/lib/tmdb";
import { ShowCard } from "@/components/ShowCard";
import { RecentActivity } from "@/components/RecentActivity";

export const revalidate = 3600;

type SP = Promise<{ q?: string }>;

export default async function HomePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp?.q ?? "").trim();
  const ready = tmdbReady();

  const [trending, results] = await Promise.all([
    q ? Promise.resolve([]) : trendingShows(),
    q ? searchShows(q) : Promise.resolve([])
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950 p-8 md:p-12 overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-1/3 w-72 h-72 rounded-full bg-screen-rose blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-screen-cyan blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            Rate every episode.
            <br />
            Share your takes.
            <br />
            <span className="text-screen-gold">Find your taste twins.</span>
          </h1>
          <p className="mt-4 text-ink-300 max-w-xl">
            Letterboxd for TV at the episode level. Half a star to five, in 0.5 steps. Polish a rough thought into a clean review with one click. Free, no account required.
          </p>
          <form action="/" method="get" className="mt-6 flex gap-2 max-w-lg">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search a show. Severance. Succession. The Bear."
              className="flex-1 bg-ink-900 border border-ink-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-screen-gold"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-screen-gold text-ink-950 font-medium text-sm hover:bg-amber-300"
            >
              Search
            </button>
          </form>
          {!ready ? (
            <p className="mt-3 text-xs text-ink-400">
              Demo mode is on because no TMDB key is configured. Add TMDB_API_KEY to unlock real catalog search.
            </p>
          ) : null}
        </div>
      </section>

      {/* Search results */}
      {q ? (
        <section>
          <h2 className="font-display text-xl mb-4">Results for {q}</h2>
          {results.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {results.map((s) => <ShowCard key={s.id} show={s} />)}
            </div>
          ) : (
            <div className="rounded-lg border border-ink-800 bg-ink-900/40 p-6 text-sm text-ink-400">
              No matches. Try a different title.
            </div>
          )}
        </section>
      ) : null}

      {/* Trending */}
      {!q ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Trending this week</h2>
            <span className="text-xs text-ink-400">via TMDB</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {trending.slice(0, 5).map((s) => <ShowCard key={s.id} show={s} />)}
          </div>
        </section>
      ) : null}

      {/* Recent activity */}
      {!q ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent takes on this device</h2>
            <Link href="/me" className="text-xs text-ink-400 hover:text-screen-cyan">Your profile</Link>
          </div>
          <RecentActivity />
        </section>
      ) : null}
    </div>
  );
}
