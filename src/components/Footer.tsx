import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-3 text-sm text-ink-400">
        <div>
          <div className="font-display text-base text-ink-100 mb-2">Episode Takes</div>
          <p>
            A free, open source corner of the internet for rating TV one episode at a
            time. No accounts required. Your takes live on your device and can be
            exported as a versioned backup.
          </p>
        </div>
        <div>
          <div className="text-ink-100 mb-2">About</div>
          <ul className="space-y-1">
            <li><Link href="/" className="hover:text-ink-100">Home</Link></li>
            <li><Link href="/me" className="hover:text-ink-100">Your profile</Link></li>
            <li>
              <a href="https://github.com/whodeanie/episode-takes" className="hover:text-ink-100" target="_blank" rel="noreferrer">GitHub</a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-ink-100 mb-2">Attribution</div>
          <p>
            TV show data from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
