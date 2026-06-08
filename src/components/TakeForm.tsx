"use client";

import { useState } from "react";
import { saveTake, setRating, getRating } from "@/lib/store";
import { RatingStars } from "./RatingStars";
import type { Episode } from "@/lib/types";

type Props = {
  episode: Episode;
  initialRating?: number;
  initialBody?: string;
  onSaved?: () => void;
};

export function TakeForm({ episode, initialRating, initialBody, onSaved }: Props) {
  const [rating, setRatingValue] = useState<number>(
    initialRating ?? getRating(episode.showId, episode.id) ?? 0
  );
  const [body, setBody] = useState<string>(initialBody ?? "");
  const [spoiler, setSpoiler] = useState<boolean>(false);
  const [polishing, setPolishing] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [warn, setWarn] = useState<string | null>(null);

  async function polish() {
    if (!body.trim()) return;
    setPolishing(true);
    setWarn(null);
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rough: body,
          showName: episode.showName,
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber,
          episodeName: episode.name,
          rating
        })
      });
      const data = await res.json();
      if (data.polished) {
        setBody(data.polished);
      } else if (data.error) {
        setWarn(data.error);
      }
    } catch {
      setWarn("Polish failed. Your take is still saved when you submit.");
    } finally {
      setPolishing(false);
    }
  }

  async function checkSpoiler() {
    if (!body.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/spoiler-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body,
          showName: episode.showName,
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber
        })
      });
      const data = await res.json();
      if (typeof data.spoiler === "boolean") {
        setSpoiler(data.spoiler);
        if (data.reason) setWarn(data.reason);
      }
    } catch {
      // soft fail
    } finally {
      setChecking(false);
    }
  }

  function submit() {
    if (!rating && !body.trim()) return;
    setRating(episode.showId, episode.id, rating);
    if (body.trim()) {
      saveTake({
        showId: episode.showId,
        showName: episode.showName,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        episodeId: episode.id,
        episodeName: episode.name,
        rating,
        body: body.trim(),
        spoiler
      });
    }
    setSaved(true);
    onSaved?.();
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-ink-300">Your take</div>
        <RatingStars value={rating} onChange={setRatingValue} size="md" />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you think? Half formed thoughts welcome. Hit Polish to clean it up."
        rows={4}
        className="w-full bg-ink-900 border border-ink-700 rounded p-3 text-sm focus:outline-none focus:border-screen-gold placeholder:text-ink-500"
      />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-ink-300">
          <input
            type="checkbox"
            checked={spoiler}
            onChange={(e) => setSpoiler(e.target.checked)}
            className="accent-screen-rose"
          />
          Mark as spoiler
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={checkSpoiler}
            disabled={checking || !body.trim()}
            className="text-xs px-3 py-1.5 rounded border border-ink-700 hover:border-screen-rose disabled:opacity-50"
          >
            {checking ? "Checking" : "AI spoiler check"}
          </button>
          <button
            type="button"
            onClick={polish}
            disabled={polishing || !body.trim()}
            className="text-xs px-3 py-1.5 rounded border border-ink-700 hover:border-screen-gold disabled:opacity-50"
          >
            {polishing ? "Polishing" : "Polish with AI"}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!rating && !body.trim()}
            className="text-xs px-3 py-1.5 rounded bg-screen-gold text-ink-950 font-medium hover:bg-amber-300 disabled:opacity-50"
          >
            {saved ? "Saved" : "Save take"}
          </button>
        </div>
      </div>
      {warn ? <div className="text-xs text-ink-400">{warn}</div> : null}
    </div>
  );
}
