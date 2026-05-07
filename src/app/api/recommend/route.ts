import { NextResponse } from "next/server";
import { GROQ_DEFAULTS, GROQ_MODEL, groqClient, groqReady } from "@/lib/groq";

// Show recommender. Given a snapshot of the user's recent ratings and short
// take excerpts, produce 5 recommendations with one line of reasoning each.
// Returns JSON for easy rendering.

export const runtime = "nodejs";

type Sample = {
  showName: string;
  rating: number;
  takeExcerpt?: string;
};

type Body = {
  recent: Sample[];
};

const SYSTEM = `You recommend TV shows to a viewer based on a snapshot of what they recently liked and disliked.

Hard rules:
1. Output strict JSON, one object, on one line. No prose, no markdown, no code fences. Schema:
{"picks":[{"title":"...","reason":"one sentence under 22 words"}, ...]}
2. Exactly five picks. Real shows only, no inventions.
3. Do not include any show that already appears in the user's recent list.
4. Recommend a mix: 3 close to their stated taste, 2 stretch picks that share a thematic or stylistic thread.
5. No em dashes, no en dashes, no semicolons in reasons.`;

export async function POST(req: Request) {
  const ready = groqReady();
  if (!ready.ok) {
    return NextResponse.json({ error: "AI offline." }, { status: 200 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!body?.recent?.length) {
    return NextResponse.json({ picks: [] });
  }

  const lines = body.recent
    .filter((r) => r && r.showName)
    .slice(0, 30)
    .map((r) => `${r.showName} (${r.rating || 0}/5)${r.takeExcerpt ? ` ${r.takeExcerpt.slice(0, 120)}` : ""}`);

  const prompt = `Recent ratings and notes:\n${lines.join("\n")}\n\nReturn the JSON now.`;

  try {
    const client = groqClient();
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.6,
      top_p: GROQ_DEFAULTS.top_p,
      max_tokens: 380,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt }
      ]
    });
    const raw = (completion.choices[0]?.message?.content ?? "{}").trim();
    let parsed: { picks?: { title?: unknown; reason?: unknown }[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const picks = (parsed.picks ?? [])
      .filter((p): p is { title: string; reason: string } =>
        typeof p?.title === "string" && typeof p?.reason === "string")
      .slice(0, 5);
    return NextResponse.json({ picks });
  } catch {
    return NextResponse.json({ error: "Recommender unavailable." }, { status: 200 });
  }
}
