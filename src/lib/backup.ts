import type { Profile, ShowList, Take } from "./types";

export type RatingMap = Record<string, number>;

export type BackupSnapshot = {
  profile: Profile | null;
  takes: Take[];
  lists: ShowList[];
  ratings: RatingMap;
};

export type EpisodeTakesBackup = BackupSnapshot & {
  format: "episode-takes-backup";
  version: 1;
  exportedAt: string;
};

export type BackupParseResult =
  | { ok: true; data: EpisodeTakesBackup }
  | { ok: false; error: string };

const MAX_BACKUP_SIZE = 2_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown, maxLength = 5_000): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isRating(value: unknown): value is number {
  return (
    isFiniteNumber(value) &&
    value >= 0 &&
    value <= 5 &&
    Number.isInteger(value * 2)
  );
}

function isProfile(value: unknown): value is Profile {
  return (
    isRecord(value) &&
    isString(value.userId, 100) &&
    isString(value.username, 24) &&
    isFiniteNumber(value.createdAt)
  );
}

function isTake(value: unknown): value is Take {
  return (
    isRecord(value) &&
    isString(value.id, 100) &&
    isString(value.userId, 100) &&
    isString(value.username, 24) &&
    isFiniteNumber(value.showId) &&
    isString(value.showName, 300) &&
    isFiniteNumber(value.seasonNumber) &&
    isFiniteNumber(value.episodeNumber) &&
    isFiniteNumber(value.episodeId) &&
    isString(value.episodeName, 300) &&
    isRating(value.rating) &&
    isString(value.body) &&
    typeof value.spoiler === "boolean" &&
    isFiniteNumber(value.createdAt)
  );
}

function isShowList(value: unknown): value is ShowList {
  return (
    isRecord(value) &&
    isFiniteNumber(value.showId) &&
    isString(value.showName, 300) &&
    (value.posterPath === null || isString(value.posterPath, 500)) &&
    (value.status === "watching" ||
      value.status === "watched" ||
      value.status === "plan") &&
    isFiniteNumber(value.addedAt)
  );
}

function isRatingMap(value: unknown): value is RatingMap {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([key, rating]) => /^\d+\.\d+$/.test(key) && isRating(rating),
    )
  );
}

export function createBackup(
  snapshot: BackupSnapshot,
  exportedAt = new Date().toISOString(),
): string {
  const backup: EpisodeTakesBackup = {
    format: "episode-takes-backup",
    version: 1,
    exportedAt,
    ...snapshot,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(serialized: string): BackupParseResult {
  if (serialized.length > MAX_BACKUP_SIZE) {
    return { ok: false, error: "Backup is too large to import." };
  }

  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    return { ok: false, error: "Backup is not valid JSON." };
  }

  if (!isRecord(value) || value.format !== "episode-takes-backup") {
    return { ok: false, error: "This is not an Episode Takes backup." };
  }
  if (value.version !== 1) {
    return { ok: false, error: "This backup version is not supported." };
  }
  if (!isString(value.exportedAt, 100)) {
    return { ok: false, error: "Backup export date is invalid." };
  }
  if (value.profile !== null && !isProfile(value.profile)) {
    return { ok: false, error: "Backup profile is invalid." };
  }
  if (!Array.isArray(value.takes) || !value.takes.every(isTake)) {
    return { ok: false, error: "Backup takes are invalid." };
  }
  if (!Array.isArray(value.lists) || !value.lists.every(isShowList)) {
    return { ok: false, error: "Backup show lists are invalid." };
  }
  if (!isRatingMap(value.ratings)) {
    return { ok: false, error: "Backup ratings are invalid." };
  }

  return { ok: true, data: value as EpisodeTakesBackup };
}
