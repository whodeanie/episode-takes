// TMDB client. Server side only. Reads TMDB_API_KEY from env, supports both
// v3 (?api_key=) and v4 (Bearer) credentials, normalises responses, caches
// results in memory for the lifetime of the lambda, and falls back to a
// curated demo dataset when no key is present so the UI is always clickable.

import type { Episode, Season, Show, ShowSummary } from "./types";
import { DEMO_SHOWS, DEMO_EPISODES } from "./demoData";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

type Cached<T> = { value: T; expires: number };
const cache = new Map<string, Cached<unknown>>();
const TTL_MS = 1000 * 60 * 60; // 1 hour

function cacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

function cacheSet<T>(key: string, value: T): void {
  cache.set(key, { value, expires: Date.now() + TTL_MS });
}

export function tmdbReady(): boolean {
  return !!process.env.TMDB_API_KEY;
}

async function tmdbFetch<T>(path: string, query: Record<string, string> = {}): Promise<T> {
  const key = process.env.TMDB_API_KEY ?? "";
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);

  const headers: Record<string, string> = { accept: "application/json" };
  // v4 tokens are JWT shaped (three dot delimited segments). v3 keys are short hex.
  if (key && key.split(".").length === 3) {
    headers.authorization = `Bearer ${key}`;
  } else if (key) {
    url.searchParams.set("api_key", key);
  }

  const cacheKey = url.toString();
  const cached = cacheGet<T>(cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), { headers, next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${path}`);
  }
  const data = (await res.json()) as T;
  cacheSet(cacheKey, data);
  return data;
}

export { posterUrl, stillUrl } from "./images";

type RawShow = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  overview: string;
  vote_average: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  genres?: { id: number; name: string }[];
  networks?: { id: number; name: string }[];
  seasons?: {
    id: number;
    season_number: number;
    name: string;
    episode_count: number;
    poster_path: string | null;
    air_date: string | null;
    overview: string;
  }[];
};

type RawEpisode = {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime: number | null;
};

function shapeSummary(raw: RawShow): ShowSummary {
  return {
    id: raw.id,
    name: raw.name,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    firstAirDate: raw.first_air_date,
    overview: raw.overview,
    voteAverage: raw.vote_average
  };
}

function shapeShow(raw: RawShow): Show {
  const seasons: Season[] = (raw.seasons ?? [])
    .filter((s) => s.season_number > 0)
    .map((s) => ({
      id: s.id,
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      posterPath: s.poster_path,
      airDate: s.air_date,
      overview: s.overview
    }));

  return {
    ...shapeSummary(raw),
    numberOfSeasons: raw.number_of_seasons ?? seasons.length,
    numberOfEpisodes: raw.number_of_episodes ?? seasons.reduce((a, s) => a + s.episodeCount, 0),
    status: raw.status ?? "",
    genres: (raw.genres ?? []).map((g) => g.name),
    seasons,
    networks: (raw.networks ?? []).map((n) => n.name)
  };
}

export async function trendingShows(): Promise<ShowSummary[]> {
  if (!tmdbReady()) return DEMO_SHOWS.slice(0, 5);
  const data = await tmdbFetch<{ results: RawShow[] }>("/trending/tv/week", { language: "en-US" });
  return data.results.slice(0, 10).map(shapeSummary);
}

export async function searchShows(q: string): Promise<ShowSummary[]> {
  if (!q.trim()) return [];
  if (!tmdbReady()) {
    const needle = q.toLowerCase();
    return DEMO_SHOWS.filter((s) => s.name.toLowerCase().includes(needle));
  }
  const data = await tmdbFetch<{ results: RawShow[] }>("/search/tv", { query: q, language: "en-US" });
  return data.results.slice(0, 20).map(shapeSummary);
}

export async function getShow(id: number): Promise<Show> {
  if (!tmdbReady()) {
    const fallback = DEMO_SHOWS.find((s) => s.id === id) ?? DEMO_SHOWS[0];
    return {
      ...fallback,
      numberOfSeasons: 1,
      numberOfEpisodes: 6,
      status: "Demo",
      genres: ["Drama"],
      networks: ["Demo"],
      seasons: [{
        id: -1,
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 6,
        posterPath: fallback.posterPath,
        airDate: fallback.firstAirDate,
        overview: fallback.overview
      }]
    };
  }
  const raw = await tmdbFetch<RawShow>(`/tv/${id}`);
  return shapeShow(raw);
}

export async function getSeason(showId: number, seasonNumber: number, showName: string): Promise<Episode[]> {
  if (!tmdbReady()) {
    return DEMO_EPISODES.map((e) => ({ ...e, showId, showName }));
  }
  const raw = await tmdbFetch<{ episodes: RawEpisode[] }>(`/tv/${showId}/season/${seasonNumber}`);
  return raw.episodes.map((e) => ({
    id: e.id,
    showId,
    showName,
    seasonNumber: e.season_number,
    episodeNumber: e.episode_number,
    name: e.name,
    overview: e.overview,
    airDate: e.air_date,
    stillPath: e.still_path,
    voteAverage: e.vote_average,
    runtime: e.runtime
  }));
}

export async function getEpisode(showId: number, seasonNumber: number, episodeNumber: number): Promise<Episode> {
  if (!tmdbReady()) {
    const demo = DEMO_EPISODES.find((e) => e.episodeNumber === episodeNumber) ?? DEMO_EPISODES[0];
    const show = DEMO_SHOWS.find((s) => s.id === showId) ?? DEMO_SHOWS[0];
    return { ...demo, showId, showName: show.name };
  }
  const showRaw = await tmdbFetch<RawShow>(`/tv/${showId}`);
  const ep = await tmdbFetch<RawEpisode>(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`);
  return {
    id: ep.id,
    showId,
    showName: showRaw.name,
    seasonNumber: ep.season_number,
    episodeNumber: ep.episode_number,
    name: ep.name,
    overview: ep.overview,
    airDate: ep.air_date,
    stillPath: ep.still_path,
    voteAverage: ep.vote_average,
    runtime: ep.runtime
  };
}
