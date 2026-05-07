import { NextResponse } from "next/server";
import { getSeason, getShow } from "@/lib/tmdb";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showId = Number(searchParams.get("showId"));
  const seasonNumber = Number(searchParams.get("seasonNumber"));
  if (!Number.isFinite(showId) || !Number.isFinite(seasonNumber)) {
    return NextResponse.json({ error: "Bad params" }, { status: 400 });
  }
  try {
    const show = await getShow(showId);
    const eps = await getSeason(showId, seasonNumber, show.name);
    return NextResponse.json({ episodes: eps });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg, episodes: [] }, { status: 200 });
  }
}
