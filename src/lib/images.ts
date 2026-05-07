// Pure helpers for TMDB image URLs. Safe to import in client components.

const IMG = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w342"): string | null {
  if (!path) return null;
  return `${IMG}/${size}${path}`;
}

export function stillUrl(path: string | null, size: "w185" | "w300" | "original" = "w300"): string | null {
  if (!path) return null;
  return `${IMG}/${size}${path}`;
}
