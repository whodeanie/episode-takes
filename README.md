# Episode Takes

Letterboxd for TV. Rate every episode in 0.5 star steps, write a take, share a single take with one URL. Free, open source, no account needed for v1. Powered by TMDB for catalog data and Groq Llama 3.3 70B for the AI features that actually pull their weight.

> Trakt is the closest thing that exists, but the UX is dated and seasons are the unit. Episodes are the unit.

## What ships in v1

* Trending shows on the home page via TMDB
* Show pages with poster, synopsis, season picker, episode grid
* Episode pages with rating, take, helpful votes, spoiler aware reveal
* Profile page with watching, watched, plan to watch, takes grouped by season
* Per take share URLs at `/share/[takeId]`
* Local first storage in localStorage. No accounts, no sync, no telemetry, no creepy data collection
* Demo mode that works with no TMDB key configured so the UI is always clickable

## The four AI features

The AI hooks are not gimmicks. Each one solves a real friction point that stops people from writing about the TV they watch.

### 1. Take polisher (the killer feature)

You watched the episode. You have a half formed thought. You do not want to spend ten minutes turning it into a paragraph. You hit Polish.

Prompt is voice preserving and refuses to invent claims. The system prompt instructs Llama 3.3 70B to keep the user's perspective exactly, add zero new plot or character claims, output 60 to 100 words, one paragraph, no em dashes.

Real example:

**Rough take**

> writing felt off for the second half. like they remembered what the show was about with 15 min left

**Polished**

> The first half kept its head. Patient blocking, the room breathed, characters did things for reasons you could name. Then the second half got nervous, started cutting around its own beats, and rushed through plot beats that should have landed. The episode only found the show again in the last fifteen minutes. By then I had already counted out. Not a write off, the cast carried what the script gave them, but the pacing made me wish someone in the writers room had pushed back harder. Three out of five for effort, two for the result.

### 2. Season retrospective generator

You finished a season. You have ten per episode takes saved. You hit AI season retrospective on your profile. Llama produces a 100 word paragraph in your voice that summarizes the arc of the season as you saw it, peaks and dips included.

System prompt insists on staying in voice and referencing actual ratings, never inventing new opinions or plot details. Open with thesis, close with net feeling.

### 3. Spoiler detector

When a user is about to publish a take, AI spoiler check labels whether the body discloses a plot twist, character death, or major reveal that would ruin the episode for someone who has not seen it. Strict by default. Returns JSON, the UI flips the spoiler toggle if the model flags it. The user keeps the final say.

### 4. Show recommender (v2 hook, route ready)

Given the user's recent ratings and short take excerpts, returns five picks: three close to taste, two stretch picks that share a thematic or stylistic thread. JSON only, with one sentence reasons.

All four hit Groq via the OpenAI SDK pointed at `https://api.groq.com/openai/v1`. Free tier covers Llama 3.3 70B with daily token limits that comfortably fit personal usage.

## Stack

* Next.js 15, React 19, TypeScript strict
* Tailwind CSS 3.4
* Groq via the OpenAI SDK (Llama 3.3 70B, free tier)
* TMDB v3 or v4 API for catalog data
* localStorage for v1 persistence (no SQLite required to start, by design)
* Vitest for unit tests
* Vercel hobby tier for deploy

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in GROQ_API_KEY and TMDB_API_KEY
npm run dev
# open http://localhost:3000
```

If you skip both keys the app still runs in demo mode with a curated catalog and the AI buttons return a clean offline message instead of erroring.

## Env vars

| Var | Purpose | Required |
| --- | --- | --- |
| `GROQ_API_KEY` | Groq Llama 3.3 70B for the four AI features | No, AI features are skipped without it |
| `GROQ_MODEL` | Override default model id | No, defaults to `llama-3.3-70b-versatile` |
| `TMDB_API_KEY` | TMDB v3 key or v4 read access token | No, app drops to demo mode without it |
| `NEXT_PUBLIC_BASE_URL` | Used for share URLs and OG metadata | No |

Get a TMDB key at https://www.themoviedb.org/settings/api. Get a Groq key at https://console.groq.com.

## Roadmap

* Magic link auth via NextAuth so takes survive across devices
* Server side persistence (Postgres on Neon free tier or PlanetScale)
* Public profiles with shareable URLs
* OG image generation per take for proper Twitter, Bluesky, Discord previews
* Taste twin matching with Pearson correlation across overlapping episode ratings
* Notifications when a show you watch drops a new episode

## Attribution

TV show data from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.

## License

MIT.
