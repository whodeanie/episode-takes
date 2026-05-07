// Local first persistence layer. All user data lives in localStorage with a
// versioned schema. No accounts needed for v1, no cross device sync, no
// telemetry. We expose typed helpers so components never reach into the raw
// keys directly.

"use client";

import type { Profile, ShowList, Take, WatchStatus } from "./types";
import { STORAGE_VERSION } from "./types";

const KEY_PROFILE = "et.profile";
const KEY_TAKES = "et.takes";
const KEY_LISTS = "et.lists";
const KEY_RATINGS = "et.ratings";
const KEY_VERSION = "et.version";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

function ensureSchema(): void {
  if (typeof window === "undefined") return;
  const v = window.localStorage.getItem(KEY_VERSION);
  if (v !== String(STORAGE_VERSION)) {
    window.localStorage.setItem(KEY_VERSION, String(STORAGE_VERSION));
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function adjective(): string {
  const a = ["wired", "loud", "quiet", "feral", "lucid", "patient", "rough", "warm", "lit", "sharp"];
  return a[Math.floor(Math.random() * a.length)];
}
function noun(): string {
  const a = ["nemo", "ghost", "moth", "rabbit", "owl", "comet", "static", "ember", "dune", "lake"];
  return a[Math.floor(Math.random() * a.length)];
}

export function getProfile(): Profile {
  ensureSchema();
  const existing = safeRead<Profile | null>(KEY_PROFILE, null);
  if (existing) return existing;
  const fresh: Profile = {
    userId: randomId(),
    username: `${adjective()}_${noun()}`,
    createdAt: Date.now()
  };
  safeWrite(KEY_PROFILE, fresh);
  return fresh;
}

export function setUsername(username: string): Profile {
  const p = getProfile();
  const next = { ...p, username: username.trim().slice(0, 24) || p.username };
  safeWrite(KEY_PROFILE, next);
  return next;
}

// Ratings keyed by showId.episodeId
type RatingMap = Record<string, number>;
function ratingKey(showId: number, episodeId: number): string {
  return `${showId}.${episodeId}`;
}

export function getRating(showId: number, episodeId: number): number | null {
  const map = safeRead<RatingMap>(KEY_RATINGS, {});
  const v = map[ratingKey(showId, episodeId)];
  return typeof v === "number" ? v : null;
}

export function setRating(showId: number, episodeId: number, rating: number): void {
  const map = safeRead<RatingMap>(KEY_RATINGS, {});
  map[ratingKey(showId, episodeId)] = rating;
  safeWrite(KEY_RATINGS, map);
}

export function clearRating(showId: number, episodeId: number): void {
  const map = safeRead<RatingMap>(KEY_RATINGS, {});
  delete map[ratingKey(showId, episodeId)];
  safeWrite(KEY_RATINGS, map);
}

export function getAllRatings(): RatingMap {
  return safeRead<RatingMap>(KEY_RATINGS, {});
}

// Takes
export function getTakes(): Take[] {
  return safeRead<Take[]>(KEY_TAKES, []);
}

export function getTakesForEpisode(episodeId: number): Take[] {
  return getTakes().filter((t) => t.episodeId === episodeId).sort((a, b) => b.upvotes - a.upvotes || b.createdAt - a.createdAt);
}

export function getTake(takeId: string): Take | null {
  return getTakes().find((t) => t.id === takeId) ?? null;
}

export function getTakesForShow(showId: number): Take[] {
  return getTakes().filter((t) => t.showId === showId);
}

export function getTakesForSeason(showId: number, seasonNumber: number): Take[] {
  return getTakes().filter((t) => t.showId === showId && t.seasonNumber === seasonNumber);
}

export function getTakesByUser(userId: string): Take[] {
  return getTakes().filter((t) => t.userId === userId);
}

export function saveTake(input: Omit<Take, "id" | "createdAt" | "upvotes" | "userId" | "username">): Take {
  const profile = getProfile();
  const all = getTakes();
  // Replace existing user take for the same episode.
  const filtered = all.filter((t) => !(t.userId === profile.userId && t.episodeId === input.episodeId));
  const take: Take = {
    ...input,
    id: randomId(),
    userId: profile.userId,
    username: profile.username,
    upvotes: 0,
    createdAt: Date.now()
  };
  filtered.push(take);
  safeWrite(KEY_TAKES, filtered);
  return take;
}

export function upvoteTake(takeId: string): void {
  const all = getTakes();
  const next = all.map((t) => (t.id === takeId ? { ...t, upvotes: t.upvotes + 1 } : t));
  safeWrite(KEY_TAKES, next);
}

export function deleteTake(takeId: string): void {
  const all = getTakes().filter((t) => t.id !== takeId);
  safeWrite(KEY_TAKES, all);
}

// Show lists
export function getShowLists(): ShowList[] {
  return safeRead<ShowList[]>(KEY_LISTS, []);
}

export function setShowStatus(item: Omit<ShowList, "addedAt">): ShowList[] {
  const all = getShowLists().filter((s) => s.showId !== item.showId);
  const next: ShowList = { ...item, addedAt: Date.now() };
  all.push(next);
  safeWrite(KEY_LISTS, all);
  return all;
}

export function getShowStatus(showId: number): WatchStatus | null {
  return getShowLists().find((s) => s.showId === showId)?.status ?? null;
}

export function removeFromList(showId: number): ShowList[] {
  const next = getShowLists().filter((s) => s.showId !== showId);
  safeWrite(KEY_LISTS, next);
  return next;
}
