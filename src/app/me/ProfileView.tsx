"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getAllRatings,
  getProfile,
  getShowLists,
  getTakes,
  exportLocalData,
  importLocalData,
  setUsername as persistUsername
} from "@/lib/store";
import type { Profile, ShowList, Take } from "@/lib/types";
import { RatingStars } from "@/components/RatingStars";
import { avg, timeAgo } from "@/lib/format";
import { posterUrl } from "@/lib/images";

export function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [lists, setLists] = useState<ShowList[]>([]);
  const [takes, setTakes] = useState<Take[]>([]);
  const [retro, setRetro] = useState<{ key: string; text: string; loading: boolean; error?: string } | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setDraft(p.username);
    setLists(getShowLists());
    setTakes(getTakes().sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const ratings = getAllRatings();

  // group takes by show + season
  const grouped = useMemo(() => {
    const map = new Map<string, { showId: number; showName: string; seasonNumber: number; takes: Take[] }>();
    for (const t of takes) {
      const key = `${t.showId}.${t.seasonNumber}`;
      if (!map.has(key)) {
        map.set(key, { showId: t.showId, showName: t.showName, seasonNumber: t.seasonNumber, takes: [] });
      }
      map.get(key)!.takes.push(t);
    }
    return Array.from(map.values()).sort((a, b) => b.takes[0].createdAt - a.takes[0].createdAt);
  }, [takes]);

  const watchingByStatus = useMemo(() => ({
    watching: lists.filter((l) => l.status === "watching"),
    watched: lists.filter((l) => l.status === "watched"),
    plan: lists.filter((l) => l.status === "plan")
  }), [lists]);

  function saveUsername() {
    const p = persistUsername(draft);
    setProfile(p);
    setEditing(false);
  }

  function downloadBackup() {
    const blob = new Blob([exportLocalData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `episode-takes-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage("Backup downloaded.");
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = importLocalData(await file.text());
    if (!result.ok) {
      setBackupMessage(result.error);
      return;
    }

    setBackupMessage(
      `Restored ${result.takes} takes, ${result.lists} list items, and ${result.ratings} ratings.`,
    );
    window.location.reload();
  }

  async function generateRetro(showId: number, showName: string, seasonNumber: number, ts: Take[]) {
    const key = `${showId}.${seasonNumber}`;
    setRetro({ key, text: "", loading: true });
    try {
      const res = await fetch("/api/retrospective", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          showName,
          seasonNumber,
          takes: ts.map((t) => ({
            episodeNumber: t.episodeNumber,
            episodeName: t.episodeName,
            rating: t.rating,
            body: t.body
          }))
        })
      });
      const data = await res.json();
      if (data.text) setRetro({ key, text: data.text, loading: false });
      else setRetro({ key, text: "", loading: false, error: data.error || "AI not available." });
    } catch {
      setRetro({ key, text: "", loading: false, error: "AI not available." });
    }
  }

  if (!profile) return null;

  const totalTakes = takes.length;
  const avgRating = avg(takes.map((t) => t.rating).filter(Boolean));
  const totalRated = Object.keys(ratings).length;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-400">Your profile</div>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="bg-ink-900 border border-ink-700 rounded px-2 py-1 text-2xl font-display"
                maxLength={24}
              />
              <button onClick={saveUsername} className="text-xs px-3 py-1.5 rounded bg-screen-gold text-ink-950 font-medium">Save</button>
            </div>
          ) : (
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              @{profile.username}
              <button onClick={() => setEditing(true)} className="ml-3 text-xs text-ink-400 hover:text-screen-cyan align-middle">edit</button>
            </h1>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Stat label="Episodes rated" value={String(totalRated)} />
          <Stat label="Takes written" value={String(totalTakes)} />
          <Stat label="Avg rating" value={avgRating ? avgRating.toFixed(2) : "0.00"} />
        </div>
      </header>

      <section className="rounded-lg border border-ink-800 bg-ink-900/40 p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-lg">Local data backup</h2>
            <p className="mt-1 max-w-xl text-sm text-ink-400">
              Ratings and takes stay in this browser. Download a versioned JSON
              backup before clearing storage or moving devices.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={downloadBackup}
              className="text-xs px-3 py-1.5 rounded bg-screen-gold text-ink-950 font-medium hover:bg-amber-300"
            >
              Download backup
            </button>
            <button
              type="button"
              onClick={() => importInput.current?.click()}
              className="text-xs px-3 py-1.5 rounded border border-ink-700 hover:border-screen-cyan"
            >
              Restore backup
            </button>
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              onChange={restoreBackup}
              className="hidden"
            />
          </div>
        </div>
        {backupMessage ? (
          <p className="mt-3 text-xs text-ink-300">{backupMessage}</p>
        ) : null}
      </section>

      <Lists title="Watching" items={watchingByStatus.watching} />
      <Lists title="Watched" items={watchingByStatus.watched} />
      <Lists title="Plan to watch" items={watchingByStatus.plan} />

      <section>
        <h2 className="font-display text-xl mb-3">Your takes by season</h2>
        {grouped.length === 0 ? (
          <div className="rounded-lg border border-ink-800 bg-ink-900/30 p-6 text-sm text-ink-400">
            Write your first take and it will show up here.
          </div>
        ) : (
          <ul className="space-y-4">
            {grouped.map((g) => {
              const key = `${g.showId}.${g.seasonNumber}`;
              const seasonAvg = avg(g.takes.map((t) => t.rating).filter(Boolean));
              return (
                <li key={key} className="rounded-lg border border-ink-800 bg-ink-900/40 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <Link href={`/show/${g.showId}`} className="font-medium hover:text-screen-cyan">
                        {g.showName}
                      </Link>
                      <span className="text-ink-400"> · Season {g.seasonNumber} · {g.takes.length} takes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <RatingStars value={seasonAvg} readOnly size="sm" />
                      <button
                        onClick={() => generateRetro(g.showId, g.showName, g.seasonNumber, g.takes)}
                        disabled={retro?.key === key && retro.loading}
                        className="text-xs px-3 py-1.5 rounded border border-ink-700 hover:border-screen-gold disabled:opacity-50"
                      >
                        {retro?.key === key && retro.loading ? "Generating" : "AI season retrospective"}
                      </button>
                    </div>
                  </div>
                  {retro?.key === key && retro.text ? (
                    <div className="mt-3 rounded border border-screen-gold/40 bg-screen-gold/5 p-3 text-sm leading-relaxed text-ink-100 whitespace-pre-wrap">
                      {retro.text}
                    </div>
                  ) : null}
                  {retro?.key === key && retro.error ? (
                    <div className="mt-3 text-xs text-ink-400">{retro.error}</div>
                  ) : null}
                  <ul className="mt-3 space-y-1.5">
                    {g.takes.sort((a, b) => a.episodeNumber - b.episodeNumber).map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                        <Link href={`/episode/${t.showId}-${t.seasonNumber}-${t.episodeNumber}`} className="text-ink-300 hover:text-screen-cyan">
                          E{t.episodeNumber} · {t.episodeName}
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                          <RatingStars value={t.rating} readOnly size="sm" />
                          <span className="text-[11px] text-ink-400">{timeAgo(t.createdAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-ink-800 bg-ink-900/40 p-2.5 text-center">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-lg font-display tabular-nums">{value}</div>
    </div>
  );
}

function Lists({ title, items }: { title: string; items: ShowList[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="font-display text-xl mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((s) => (
          <Link key={s.showId} href={`/show/${s.showId}`} className="block rounded overflow-hidden border border-ink-800 hover:border-screen-cyan">
            <div className="aspect-[2/3] bg-ink-800">
              {s.posterPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterUrl(s.posterPath, "w185") ?? ""} alt={s.showName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-ink-500 text-sm">{s.showName.slice(0, 2)}</div>
              )}
            </div>
            <div className="p-2 text-xs leading-tight line-clamp-2">{s.showName}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
