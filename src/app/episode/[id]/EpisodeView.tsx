"use client";

import { useEffect, useState } from "react";
import { TakeForm } from "@/components/TakeForm";
import { getProfile, getTakesForEpisode } from "@/lib/store";
import type { Episode, Take } from "@/lib/types";

export function EpisodeView({ episode }: { episode: Episode }) {
  const [yourTake, setYourTake] = useState<Take | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const profile = getProfile();
    const all = getTakesForEpisode(episode.id);
    const yours = all.find((t) => t.userId === profile.userId) ?? null;
    setYourTake(yours);
  }, [episode.id, tick]);

  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="font-display text-lg mb-3">Your take</h2>
        <TakeForm
          episode={episode}
          initialRating={yourTake?.rating}
          initialBody={yourTake?.body}
          onSaved={() => setTick((n) => n + 1)}
        />
      </section>

    </div>
  );
}
