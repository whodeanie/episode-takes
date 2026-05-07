// Curated demo dataset used when no TMDB key is configured. Keeps the UI
// fully clickable for screenshots and local development.

import type { Episode, ShowSummary } from "./types";

export const DEMO_SHOWS: ShowSummary[] = [
  {
    id: 1396,
    name: "Breaking Bad",
    posterPath: null,
    backdropPath: null,
    firstAirDate: "2008-01-20",
    overview: "A high school chemistry teacher turns to manufacturing methamphetamine after a cancer diagnosis upends his finances and his sense of legacy.",
    voteAverage: 8.9
  },
  {
    id: 60625,
    name: "Rick and Morty",
    posterPath: null,
    backdropPath: null,
    firstAirDate: "2013-12-02",
    overview: "An eccentric scientist drags his anxious teenage grandson across galaxies, dimensions, and the inside of his own neurosis.",
    voteAverage: 8.7
  },
  {
    id: 94605,
    name: "Arcane",
    posterPath: null,
    backdropPath: null,
    firstAirDate: "2021-11-06",
    overview: "Two sisters from opposite sides of a divided city are pulled into a war over magic, technology, and the fragile peace between their worlds.",
    voteAverage: 9.0
  },
  {
    id: 1399,
    name: "Game of Thrones",
    posterPath: null,
    backdropPath: null,
    firstAirDate: "2011-04-17",
    overview: "Noble houses scheme, fight, and fall while an existential threat gathers in the cold reaches beyond the wall.",
    voteAverage: 8.5
  },
  {
    id: 66732,
    name: "Stranger Things",
    posterPath: null,
    backdropPath: null,
    firstAirDate: "2016-07-15",
    overview: "A small town in 1980s Indiana finds itself at the seam of a reality where bicycles, walkie talkies, and dungeon manuals are weapons.",
    voteAverage: 8.6
  }
];

export const DEMO_EPISODES: Episode[] = Array.from({ length: 6 }, (_, i) => ({
  id: 1000 + i,
  showId: 0,
  showName: "Demo Show",
  seasonNumber: 1,
  episodeNumber: i + 1,
  name: `Episode ${i + 1}`,
  overview: "A demo episode used when TMDB credentials are not configured. Wire a TMDB_API_KEY to see real synopses, stills, and runtimes.",
  airDate: "2024-01-01",
  stillPath: null,
  voteAverage: 7.5 + (i % 3) * 0.4,
  runtime: 48
}));
