import { NextResponse } from "next/server";
import { GROQ_DEFAULTS, GROQ_MODEL, clampWords, groqClient, groqReady } from "@/lib/groq";

// Polish a rough thought into a clean 60 to 100 word episode review.
// Maintains the user's voice. Refuses to invent claims that were not in the
// original. Returns the polished text only, no preamble.

export const runtime = "nodejs";

type Body = {
  rough: string;
  showName?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
  rating?: number;
};

const SYSTEM = `You polish rough thoughts about a single TV episode into clean, voice forward reviews.

Hard rules:
1. Keep the user's perspective, opinion, and tone exactly. If they liked it, you like it. If they hated it, you hate it.
2. Add zero new claims, plot points, character names, or facts. Only smooth what is already there.
3. Output 60 to 100 words. One paragraph. No headings, no bullets.
4. No em dashes, no en dashes, no semicolons. Plain commas and periods only.
5. Never reveal you are an AI. Never apologize. Output the review text only.
6. Do not mention spoilers as a meta concept. Just write the review.

If the rough text is too thin to support 60 words, write 40 to 60 words instead. Better short and honest than padded.`;

export async function POST(req: Request) {
  const ready = groqReady();
  if (!ready.ok) {
    return NextResponse.json({ error: "AI is offline. Set GROQ_API_KEY to enable polish." }, { status: 200 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const rough = (body.rough ?? "").trim();
  if (!rough) {
    return NextResponse.json({ error: "Need some rough text to polish." }, { status: 400 });
  }

  const context: string[] = [];
  if (body.showName) context.push(`Show: ${body.showName}`);
  if (body.seasonNumber) context.push(`Season: ${body.seasonNumber}`);
  if (body.episodeNumber) context.push(`Episode number: ${body.episodeNumber}`);
  if (body.episodeName) context.push(`Episode title: ${body.episodeName}`);
  if (typeof body.rating === "number" && body.rating > 0) context.push(`Their rating: ${body.rating} of 5`);

  const user = [
    context.length ? `Context:\n${context.join("\n")}` : "",
    `Rough take:\n${rough}`,
    `Polished review:`
  ].filter(Boolean).join("\n\n");

  try {
    const client = groqClient();
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: GROQ_DEFAULTS.temperature,
      top_p: GROQ_DEFAULTS.top_p,
      max_tokens: GROQ_DEFAULTS.max_tokens,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user }
      ]
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "No output from model." }, { status: 502 });
    }
    // Defensive: strip em/en dashes that the model may have produced.
    const cleaned = text.replace(/[—–]/g, ", ").replace(/\s+,/g, ",").replace(/,\s*,/g, ",");
    const trimmed = clampWords(cleaned, 110);
    return NextResponse.json({ polished: trimmed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown Groq error";
    return NextResponse.json({ error: `Polish failed. ${msg}` }, { status: 200 });
  }
}
