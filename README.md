# Episode Takes

**Live demo:** https://episode-takes.vercel.app

Episode Takes is a local-first TV journal. Rate individual episodes, write
short takes, organize a watchlist, and download a versioned backup of the data
stored in your browser. TMDB powers the catalog when configured. Groq powers
three optional writing helpers when configured.

No account is required. The app falls back to a small demo catalog when TMDB
credentials are unavailable.

## What ships in v1

* Trending shows on the home page via TMDB
* Show pages with poster, synopsis, season picker, episode grid
* Episode pages with a rating, take, and optional spoiler label
* Profile page with watching, watched, plan to watch, takes grouped by season
* Local permalinks at `/share/[takeId]` that resolve in the browser that wrote the take
* Validated JSON backup and restore for moving local data between browsers
* Local-first storage in localStorage. No accounts or sync
* Demo mode that works with no TMDB key configured so the UI is always clickable

## What this is not

This is not a social network. There are no public profiles, global helpful
votes, server-side take storage, or cross-device share links. The recommender
API route is an experiment and does not have a product UI yet.

## Optional AI helpers

### Take polisher

Turns a rough thought into a short review. The prompt instructs the model to
preserve the user's opinion and avoid adding plot claims.

### Season retrospective

Summarizes saved episode takes and ratings from one season into a short
retrospective.

### Spoiler check

Suggests whether a take should be marked as a spoiler. The user keeps the final
decision.

The helpers call Groq through the OpenAI SDK. Without `GROQ_API_KEY`, the UI
returns a clear offline message and the journal still works.

## Stack

* Next.js 16, React 19, TypeScript strict
* Tailwind CSS 3.4
* Groq via the OpenAI SDK
* TMDB v3 or v4 API for catalog data
* localStorage for v1 persistence (no SQLite required to start, by design)
* Vitest for unit tests
* Vercel hobby tier for deploy

## Self host

If you want to clone and run this yourself locally:

```bash
npm install
cp .env.example .env.local
npm run dev
# open http://localhost:3000
```

Runs out of the box with no env vars set. The catalog drops to demo mode and
the AI buttons return a clear offline message until you provide keys.

| Var | Purpose | Required |
| --- | --- | --- |
| `GROQ_API_KEY` | Groq key for optional AI helpers | No, AI features fall back gracefully without it |
| `GROQ_MODEL` | Override default model id | No, defaults to `llama-3.3-70b-versatile` |
| `TMDB_API_KEY` | TMDB v3 key or v4 read access token | No, app drops to demo mode without it |
| `NEXT_PUBLIC_BASE_URL` | Used for permalink metadata | No |

## Roadmap

* Magic link auth via NextAuth so takes survive across devices
* Server side persistence (Postgres on Neon free tier or PlanetScale)
* Optional server-backed profiles and public share links
* OG image generation per take for proper Twitter, Bluesky, Discord previews
* Taste twin matching with Pearson correlation across overlapping episode ratings
* Notifications when a show you watch drops a new episode

## Verification

```bash
npm run check
```

The check runs ESLint, TypeScript, unit tests, and a production build. GitHub
Actions runs the same command on pushes and pull requests.

## Attribution

TV show data from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.

## License

MIT.
