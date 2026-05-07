"use client";

import { useEffect, useState } from "react";
import type { Show, WatchStatus } from "@/lib/types";
import { getShowStatus, removeFromList, setShowStatus } from "@/lib/store";

const LABELS: Record<WatchStatus, string> = {
  watching: "Watching",
  watched: "Watched",
  plan: "Plan to watch"
};

export function WatchButton({ show }: { show: Show }) {
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setStatus(getShowStatus(show.id));
  }, [show.id]);

  function pick(s: WatchStatus | null) {
    if (!s) {
      removeFromList(show.id);
      setStatus(null);
    } else {
      setShowStatus({
        showId: show.id,
        showName: show.name,
        posterPath: show.posterPath,
        status: s
      });
      setStatus(s);
    }
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          "px-4 py-2 rounded text-sm font-medium border transition " +
          (status
            ? "bg-screen-gold/20 border-screen-gold text-screen-gold"
            : "bg-ink-800 border-ink-700 hover:border-screen-gold")
        }
      >
        {status ? LABELS[status] : "Add to your list"}
      </button>
      {open ? (
        <div className="absolute z-20 right-0 mt-2 w-48 rounded-lg border border-ink-700 bg-ink-900 shadow-xl">
          {(["watching", "watched", "plan"] as WatchStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => pick(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-ink-800 first:rounded-t-lg"
            >
              {LABELS[s]}
            </button>
          ))}
          {status ? (
            <button
              onClick={() => pick(null)}
              className="w-full text-left px-3 py-2 text-sm text-screen-rose hover:bg-ink-800 rounded-b-lg"
            >
              Remove from list
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
