import { describe, it, expect } from "vitest";
import { avg, fmtRating, fmtRuntime, fmtAirDate, timeAgo } from "../src/lib/format";

describe("format", () => {
  it("formats rating to one decimal", () => {
    expect(fmtRating(0)).toBe("0.0");
    expect(fmtRating(8.876)).toBe("8.9");
    expect(fmtRating(NaN)).toBe("0.0");
  });

  it("formats runtime", () => {
    expect(fmtRuntime(null)).toBe("");
    expect(fmtRuntime(0)).toBe("");
    expect(fmtRuntime(45)).toBe("45m");
    expect(fmtRuntime(60)).toBe("1h");
    expect(fmtRuntime(95)).toBe("1h 35m");
  });

  it("averages an array, handles empty", () => {
    expect(avg([])).toBe(0);
    expect(avg([3, 4, 5])).toBe(4);
  });

  it("formats air date or returns empty", () => {
    expect(fmtAirDate(null)).toBe("");
    expect(fmtAirDate("2024-05-01")).toMatch(/2024/);
  });

  it("renders relative time ago", () => {
    const now = Date.now();
    expect(timeAgo(now)).toMatch(/s ago/);
    expect(timeAgo(now - 1000 * 60 * 5)).toMatch(/m ago/);
    expect(timeAgo(now - 1000 * 60 * 60 * 3)).toMatch(/h ago/);
  });
});
