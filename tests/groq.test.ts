import { describe, it, expect } from "vitest";
import { clampWords, wordCount, groqReady } from "../src/lib/groq";

describe("groq helpers", () => {
  it("counts words", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount(" hello world ")).toBe(2);
    expect(wordCount("a b c d")).toBe(4);
  });

  it("clamps words to a max", () => {
    const long = Array.from({ length: 200 }, (_, i) => `w${i}`).join(" ");
    const out = clampWords(long, 30);
    expect(wordCount(out)).toBeLessThanOrEqual(31);
  });

  it("reports availability based on env", () => {
    const r = groqReady();
    expect(typeof r.ok).toBe("boolean");
  });
});
