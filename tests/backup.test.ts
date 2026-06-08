import { describe, expect, it } from "vitest";
import { createBackup, parseBackup } from "../src/lib/backup";

const snapshot = {
  profile: {
    userId: "user-1",
    username: "quiet_static",
    createdAt: 1_700_000_000_000,
  },
  takes: [
    {
      id: "take-1",
      userId: "user-1",
      username: "quiet_static",
      showId: 10,
      showName: "Example Show",
      seasonNumber: 1,
      episodeNumber: 2,
      episodeId: 102,
      episodeName: "Second Episode",
      rating: 4.5,
      body: "A patient episode with a strong finish.",
      spoiler: false,
      createdAt: 1_700_000_000_100,
    },
  ],
  lists: [
    {
      showId: 10,
      showName: "Example Show",
      posterPath: null,
      status: "watching" as const,
      addedAt: 1_700_000_000_200,
    },
  ],
  ratings: { "10.102": 4.5 },
};

describe("local data backup", () => {
  it("round trips a versioned backup", () => {
    const serialized = createBackup(snapshot, "2026-06-08T12:00:00.000Z");
    const parsed = parseBackup(serialized);

    expect(parsed).toEqual({
      ok: true,
      data: {
        format: "episode-takes-backup",
        version: 1,
        exportedAt: "2026-06-08T12:00:00.000Z",
        ...snapshot,
      },
    });
  });

  it("rejects a backup from an unknown format", () => {
    const parsed = parseBackup(JSON.stringify({ format: "something-else", version: 1 }));

    expect(parsed).toEqual({
      ok: false,
      error: "This is not an Episode Takes backup.",
    });
  });

  it("rejects malformed ratings instead of importing corrupt data", () => {
    const serialized = createBackup(snapshot);
    const broken = JSON.stringify({
      ...JSON.parse(serialized),
      ratings: { "10.102": 9 },
    });

    expect(parseBackup(broken)).toEqual({
      ok: false,
      error: "Backup ratings are invalid.",
    });
  });
});
