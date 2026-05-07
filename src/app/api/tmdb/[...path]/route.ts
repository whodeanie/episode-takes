// Proxy for arbitrary TMDB GETs. Used by client side fetches that need the
// server held key. Pass through to api.themoviedb.org, append the API key,
// and pipe back the JSON. Read only on purpose: only GET is allowed.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE = "https://api.themoviedb.org/3";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: Request, ctx: Ctx) {
  const { path } = await ctx.params;
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "TMDB_API_KEY is not set" }, { status: 503 });
  }
  const incoming = new URL(req.url);
  const target = new URL(`${BASE}/${path.join("/")}`);
  for (const [k, v] of incoming.searchParams.entries()) target.searchParams.set(k, v);

  const headers: Record<string, string> = { accept: "application/json" };
  if (key.split(".").length === 3) {
    headers.authorization = `Bearer ${key}`;
  } else {
    target.searchParams.set("api_key", key);
  }

  const res = await fetch(target.toString(), { headers, next: { revalidate: 3600 } });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" }
  });
}
