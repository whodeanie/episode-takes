// Groq client. Uses the OpenAI SDK pointed at https://api.groq.com/openai/v1
// because Groq is API compatible and the SDK gives us streaming, retries,
// and typed responses for free. Default model is Llama 3.3 70B.

import OpenAI from "openai";

export type GroqAvailability = {
  ok: boolean;
  reason?: string;
};

export function groqReady(): GroqAvailability {
  if (!process.env.GROQ_API_KEY) {
    return { ok: false, reason: "GROQ_API_KEY is not set" };
  }
  return { ok: true };
}

export function groqClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
}

export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Conservative defaults that keep the AI features fast without sacrificing
// the quality of short, voice forward outputs.
export const GROQ_DEFAULTS = {
  temperature: 0.7,
  top_p: 0.9,
  max_tokens: 320
} as const;

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function clampWords(s: string, max: number): string {
  const words = s.trim().split(/\s+/);
  if (words.length <= max) return s.trim();
  return words.slice(0, max).join(" ").replace(/[,;:]$/, "") + ".";
}
