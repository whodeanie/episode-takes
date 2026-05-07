import { NextResponse } from "next/server";
import { GROQ_DEFAULTS, GROQ_MODEL, groqClient, groqReady } from "@/lib/groq";

// Spoiler classifier. Asks the model to flag whether a take contains
// material likely to spoil the named episode for someone who has not seen it.
// Returns a strict JSON shape so the UI can react deterministically.

export const runtime = "nodejs";

type Body = {
  body: string;
  showName?: string;
  seasonNumber?: number;
  episodeNumber?: number;
};

const SYSTEM = `You decide whether a short user written take about a single TV episode contains spoilers.

Spoiler means: discloses a plot twist, a character death, a major reveal, the resolution of a long arc, or a key moment that a first time viewer would not want to know in advance.

Not a spoiler: the user's vibe, broad praise or criticism, comments on pacing, performances, cinematography, music, or general atmosphere that does not reveal what happens.

Output a single JSON object on one line, no prose, no markdown, no code fences. Schema:
{"spoiler": true|false, "reason": "one short sentence"}

Be strict. When in doubt, mark it true. Always output valid JSON.`;

export async function POST(req: Request) {
  const ready = groqReady();
  if (!ready.ok) {
    return NextResponse.json({ spoiler: false, reason: "AI offline. Set the toggle yourself if needed." });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const text = (body.body ?? "").trim();
  if (!text) return NextResponse.json({ spoiler: false, reason: "" });

  const ctx: string[] = [];
  if (body.showName) ctx.push(`Show: ${body.showName}`);
  if (body.seasonNumber) ctx.push(`Season: ${body.seasonNumber}`);
  if (body.episodeNumber) ctx.push(`Episode: ${body.episodeNumber}`);
  const prompt = `${ctx.join("\n")}\n\nTake:\n${text}`;

  try {
    const client = groqClient();
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.1,
      top_p: GROQ_DEFAULTS.top_p,
      max_tokens: 120,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt }
      ]
    });
    const raw = (completion.choices[0]?.message?.content ?? "{}").trim();
    let parsed: { spoiler?: unknown; reason?: unknown } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    const spoiler = parsed.spoiler === true;
    const reason = typeof parsed.reason === "string" ? parsed.reason.slice(0, 200) : "";
    return NextResponse.json({ spoiler, reason });
  } catch {
    return NextResponse.json({ spoiler: false, reason: "Spoiler check unavailable. Use the toggle if needed." });
  }
}
