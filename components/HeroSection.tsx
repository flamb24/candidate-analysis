// components/HeroSection.tsx
//
// Distrett — Malta General Election 2026 home-page hero.
// Editorial / broadsheet direction. React Server Component, Tailwind v4.

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getAllDistricts } from "@/lib/data";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import ElectionCountdown from "@/components/ElectionCountdown";

const PARTIES: Array<{ name: string; code: string; varName: string }> = [
  { name: "Partit Laburista",       code: "PL",   varName: "--party-pl"   },
  { name: "Partit Nazzjonalista",   code: "PN",   varName: "--party-pn"   },
  { name: "Momentum",               code: "MOM",  varName: "--party-mom"  },
  { name: "ADPD — The Green Party", code: "ADPD", varName: "--party-adpd" },
  { name: "Aħwa Maltin",            code: "AM",   varName: "--party-am"   },
  { name: "Imperium Europa",        code: "IE",   varName: "--party-ie"   },
  { name: "Independent",            code: "IND",  varName: "--party-ind"  },
];

export default function HeroSection({ lang = "en" }: { lang?: Lang }) {
  const t = getT(lang);
  const prefix = lang === "mt" ? "/mt" : "";

  const districts = getAllDistricts();
  const candidates = districts.flatMap((d) => d.candidates);
  // Deduplicate multi-district candidates (they appear in several districts but
  // are one person) by stripping the district prefix from the candidate id.
  const uniqueCandidateCount = new Set(candidates.map((c) => c.id.replace(/^\d+-/, ""))).size;
  const partyCount = new Set(candidates.map((c) => c.party).filter(Boolean)).size;

  const STATS: Array<[string, string]> = [
    [String(uniqueCandidateCount), t.statCandidates],
    [String(districts.length),  t.statDistricts],
    ["65",                       t.statSeats],
    [String(partyCount || PARTIES.length), t.statParties],
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

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16 pt-6 lg:pt-8 pb-2 lg:pb-4 min-h-[100svh] flex flex-col">

        {/* ── Masthead ─────────────────────────────────────────────── */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-serif font-extrabold text-5xl lg:text-7xl -tracking-[0.02em]">
              Distrett<span className="text-[var(--cta)]">.</span>
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              distrett.com · {t.tagline}
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
              <h1
                id="hero-headline"
                className="font-serif font-medium leading-[0.92] tracking-[-0.025em] text-balance"
                style={{ fontSize: "clamp(3.25rem, 9vw, 8.25rem)" }}
              >
                {t.headlineLine1}
                <br />
                {t.headlineLine2Prefix}<span className="font-extrabold">{t.headlineLine2Bold}</span>
                <br />
                <span className="font-medium italic text-[var(--muted)]">{t.headlineLine3}</span>
              </h1>
              <p className="mt-4 text-2xl sm:text-4xl font-medium tracking-tight text-[var(--muted)]">
                {t.heroSubline}
              </p>
            </div>

            <div className="max-w-[38rem] mt-8 lg:mt-10">
              <div className="h-px bg-[var(--border)]" />
              <p className="font-serif text-base lg:text-[17px] leading-[1.5] mt-4 -tracking-[0.005em]">
                {t.subhead}
              </p>
            </div>
          </div>

          {/* Issue-brief side column */}
          <aside className="lg:col-span-4 lg:border-l lg:border-[var(--border)] lg:pl-7 flex flex-col gap-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2.5">
                {t.inThisIssue}
              </p>
              <p className="font-serif italic text-lg leading-[1.35]">
                {t.issueBlurb(districts.length)}
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
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--muted)] mt-1">
                    {l}
                  </p>
                </div>
              ))}
            </dl>

            {/* ── Voting guide promo ───────────────────────────────── */}
            <Link
              href={`${prefix}/guide`}
              className="group flex flex-col gap-2 rounded-lg border border-[var(--cta)]/30 bg-[var(--cta)]/5 px-4 py-3.5 hover:bg-[var(--cta)]/10 transition-colors"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--cta)] flex items-center gap-2">
                <BookOpen size={11} aria-hidden />
                {t.votingGuide}
              </span>
              <span className="font-serif italic text-[15px] leading-snug text-[var(--fg)]">
                Not sure how the single-transferable voting system works? Our non-partisan guide walks you through casting your vote well.
              </span>
              <span className="text-xs font-medium text-[var(--cta)] group-hover:underline underline-offset-2">
                How to vote well →
              </span>
            </Link>

            {/* ── Find your candidates CTA ────────────────────────── */}
            <Link
              href={`${prefix}/districts`}
              className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 hover:border-[var(--fg)]/40 hover:bg-[var(--fg)]/[0.03] transition-colors"
            >
              <span className="font-serif font-semibold text-sm -tracking-[0.005em]">
                {t.findYourCandidate}
              </span>
              <span aria-hidden className="text-[var(--muted)] group-hover:text-[var(--fg)] transition-colors text-sm">→</span>
            </Link>

            <div className="h-px bg-[var(--border)]" />

            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {t.onTheBallot}
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
                    <span className="font-mono text-xs tracking-[0.1em] text-[var(--muted)]">
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
          <div className="flex items-center gap-6 pt-5 lg:pt-6">

            {/* Date lockup + countdown */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {t.pollsOpen}
              </span>
              <time
                dateTime="2026-05-30"
                className="font-serif font-semibold text-base lg:text-xl -tracking-[0.01em]"
              >
                {t.electionDateTime}
              </time>
              <ElectionCountdown />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
