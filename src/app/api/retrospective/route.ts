import { NextResponse } from "next/server";
import { GROQ_DEFAULTS, GROQ_MODEL, clampWords, groqClient, groqReady } from "@/lib/groq";

// Generate a 100 word season retrospective from the user's per episode takes.
// Stays in their voice. Surfaces the arc they implicitly drew across episodes.

export const runtime = "nodejs";

type TakeIn = {
  episodeNumber: number;
  episodeName: string;
  rating: number;
  body: string;
};

type Body = {
  showName: string;
  seasonNumber: number;
  takes: TakeIn[];
};

const SYSTEM = `You write 100 word season retrospectives based on a user's per episode takes.

Hard rules:
1. Stay in the user's voice. If they were sour all season, your retro is sour. If they were elated, the retro is elated.
2. Reference their actual ratings and points, do not invent new opinions or plot details.
3. Output 90 to 110 words. One paragraph. No headings, no bullets, no lists.
4. No em dashes, no en dashes, no semicolons. Plain commas and periods.
5. Treat the season as one arc. Note where their interest peaked or dipped.
6. Open with a clear thesis on the season as a whole. Close with their net feeling.`;

export async function POST(req: Request) {
  const ready = groqReady();
  if (!ready.ok) {
    return NextResponse.json({ error: "AI is offline. Set GROQ_API_KEY to enable retrospectives." }, { status: 200 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body?.takes?.length) {
    return NextResponse.json({ error: "No takes to summarize." }, { status: 400 });
  }

  const sorted = [...body.takes].sort((a, b) => a.episodeNumber - b.episodeNumber);
  const lines = sorted.map((t) => {
    const r = t.rating ? `${t.rating}/5` : "no rating";
    const snippet = (t.body || "").slice(0, 280).replace(/\s+/g, " ").trim();
    return `E${t.episodeNumber} ${t.episodeName} (${r}): ${snippet}`;
  });

  const user = [
    `Show: ${body.showName}`,
    `Season: ${body.seasonNumber}`,
    `Average rating: ${(sorted.reduce((a, t) => a + (t.rating || 0), 0) / sorted.length).toFixed(2)} of 5`,
    `Per episode notes:`,
    lines.join("\n"),
    ``,
    `Write the 100 word season retrospective in their voice.`
  ].join("\n");

  try {
    const client = groqClient();
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: GROQ_DEFAULTS.temperature,
      top_p: GROQ_DEFAULTS.top_p,
      max_tokens: 360,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user }
      ]
    });
    const text = (completion.choices[0]?.message?.content ?? "").trim();
    if (!text) return NextResponse.json({ error: "No output from model." }, { status: 502 });
    const cleaned = text.replace(/[—–]/g, ", ").replace(/\s+,/g, ",").replace(/,\s*,/g, ",");
    return NextResponse.json({ text: clampWords(cleaned, 120) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown Groq error";
    return NextResponse.json({ error: `Retrospective failed. ${msg}` }, { status: 200 });
  }
}
