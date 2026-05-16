// components/HeroSection.tsx
//
// Distrett — Malta General Election 2026 home-page hero.
// Editorial / broadsheet direction. React Server Component, Tailwind v4.
// Drop into app/page.tsx above the candidates section.

import { getAllDistricts } from "@/lib/data";

const PARTIES: Array<{ name: string; code: string; varName: string }> = [
  { name: "Partit Laburista",       code: "PL",   varName: "--party-pl"   },
  { name: "Partit Nazzjonalista",   code: "PN",   varName: "--party-pn"   },
  { name: "Momentum",               code: "MOM",  varName: "--party-mom"  },
  { name: "ADPD — The Green Party", code: "ADPD", varName: "--party-adpd" },
  { name: "Aħwa Maltin",            code: "AM",   varName: "--party-am"   },
];

export default function HeroSection() {
  const districts = getAllDistricts();
  const candidates = districts.flatMap((d) => d.candidates);
  const partyCount = new Set(candidates.map((c) => c.party).filter(Boolean)).size;

  const STATS: Array<[string, string]> = [
    [String(candidates.length), "Candidates"],
    [String(districts.length),  "Districts"],
    ["65",                       "Seats in parliament"],
    [String(partyCount || PARTIES.length), "Political parties"],
  ];

  return (
    <section
      aria-labelledby="hero-headline"
      className="relative isolate w-full overflow-hidden bg-[var(--bg)] text-[var(--fg)] font-serif"
    >
      {/* Ghosted "ivvota" — decorative background text */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute right-[-6vw] top-[10vh] font-serif italic font-black leading-[0.78] tracking-[-0.04em] text-[var(--border)]/70"
        style={{ fontSize: "clamp(10rem, 28vw, 28rem)" }}
      >
        ivvota
      </span>

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16 pt-6 lg:pt-8 pb-10 lg:pb-12 min-h-[100svh] flex flex-col">

        {/* ── Masthead ─────────────────────────────────────────────── */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div className="flex items-baseline gap-3 lg:gap-4">
              <span className="font-serif font-extrabold text-lg lg:text-xl -tracking-[0.015em]">
                Distrett<span className="text-[var(--cta)]">.</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                distrett.com · an independent voter guide
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Vol. I · No. 1 · Saturday, 30 May 2026
            </span>
          </div>
          <div className="h-[2px] bg-[var(--fg)]" />
          <div className="h-px bg-[var(--fg)] -mt-2" />
        </header>

        {/* ── Main grid ────────────────────────────────────────────── */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-x-8 mt-10 lg:mt-14 flex-1">

          {/* Headline column */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--cta)] mb-5 flex items-center gap-3">
                <span className="inline-block w-5 h-px bg-[var(--cta)]" />
                The 2026 Election Brief
              </p>
              <h1
                id="hero-headline"
                className="font-serif font-medium leading-[0.92] tracking-[-0.025em] text-balance"
                style={{ fontSize: "clamp(3.25rem, 9vw, 8.25rem)" }}
              >
                Vote like
                <br />
                you <span className="font-extrabold">know</span>
                <br />
                <em className="italic font-normal text-[var(--muted)]">them.</em>
              </h1>
            </div>

            <div className="max-w-[38rem] mt-8 lg:mt-10">
              <div className="h-px bg-[var(--border)]" />
              <p className="font-serif text-base lg:text-[17px] leading-[1.5] mt-4 -tracking-[0.005em]">
                Know who you&apos;re really voting for. We break down every
                candidate in your district — their track record, documented
                controversies, and public stances on the issues that matter.
                Find out who&apos;s here to represent you and who&apos;s just
                making up the numbers.
              </p>
            </div>
          </div>

          {/* Issue-brief side column */}
          <aside className="lg:col-span-4 lg:border-l lg:border-[var(--border)] lg:pl-7 flex flex-col gap-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-2.5">
                In this issue
              </p>
              <p className="font-serif italic text-lg leading-[1.35]">
                A candidate-by-candidate read of the {districts.length} electoral
                districts — receipts, records, and reputations included.
              </p>
            </div>

            <div className="h-px bg-[var(--border)]" />

            <dl className="grid grid-cols-2 gap-y-4 gap-x-3 m-0">
              {STATS.map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-serif font-extrabold text-[2.25rem] leading-none tracking-[-0.03em]">
                    {n}
                  </dd>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mt-1">
                    {l}
                  </p>
                </div>
              ))}
            </dl>

            <div className="h-px bg-[var(--border)]" />

            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                On the ballot
              </p>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {PARTIES.map((p) => (
                  <li
                    key={p.code}
                    className="flex items-center justify-between font-serif text-sm"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
                        style={{ background: `var(${p.varName})` }}
                      />
                      {p.name}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted)]">
                      {p.code}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* ── Bottom bar: date lockup + scroll cue ────────────────── */}
        <div className="mt-10 lg:mt-12">
          <div className="h-px bg-[var(--fg)]" />
          <div className="flex items-center justify-between gap-6 pt-5 lg:pt-6">

            {/* Date lockup */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
                Polls open
              </span>
              <time
                dateTime="2026-05-30"
                className="font-serif font-semibold text-base lg:text-xl -tracking-[0.01em]"
              >
                Saturday <span className="italic font-normal">·</span> 30 May 2026{" "}
                <span className="italic font-normal">·</span> 07:00–22:00
              </time>
            </div>

            {/* Animated scroll cue */}
            <a
              href="#candidates"
              aria-label="Scroll to candidates"
              className="flex flex-col items-center gap-2.5 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
                The candidates
              </span>
              <span
                aria-hidden="true"
                className="relative w-px h-11 bg-current/35 overflow-hidden block"
              >
                <span className="absolute -left-px top-0 w-0.5 h-3.5 bg-current motion-safe:animate-[cueDrop_2.2s_cubic-bezier(.5,.05,.5,.95)_infinite]" />
              </span>
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
