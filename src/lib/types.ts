// Domain types for episode takes.
// All persistence is local first via localStorage with a stable schema version.

export const STORAGE_VERSION = 1;

export type ShowSummary = {
  id: number;
  name: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string | null;
  overview: string;
  voteAverage: number;
};

export type Season = {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
  posterPath: string | null;
  airDate: string | null;
  overview: string;
};

export type Show = ShowSummary & {
  numberOfSeasons: number;
  numberOfEpisodes: number;
  status: string;
  genres: string[];
  seasons: Season[];
  networks: string[];
};

export type Episode = {
  id: number;
  showId: number;
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  stillPath: string | null;
  voteAverage: number;
  runtime: number | null;
};

// Stored locally per device, keyed by user anon id.
export type Take = {
  id: string;
  userId: string;
  username: string;
  showId: number;
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeId: number;
  episodeName: string;
  rating: number; // 0.5 to 5.0 in 0.5 steps
  body: string;
  spoiler: boolean;
  upvotes: number;
  createdAt: number;
};

export type WatchStatus = "watching" | "watched" | "plan";

export type ShowList = {
  showId: number;
  showName: string;
  posterPath: string | null;
  status: WatchStatus;
  addedAt: number;
};

export type Profile = {
  userId: string;
  username: string;
  createdAt: number;
};
