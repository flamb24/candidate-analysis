import Link from "next/link";
import { getAllDistricts } from "@/lib/data";
import HeroSection from "@/components/HeroSection";
import FloatingCTA from "@/components/FloatingCTA";

export default function Home() {
  const districts = getAllDistricts();

  return (
    <>
      <HeroSection />
      <FloatingCTA />

      {/* ── Below-fold district list ───────────────────────────────── */}
      <section
        id="districts"
        aria-labelledby="districts-heading"
        className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
      >
        <header className="mb-8 flex flex-col gap-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--cta)] flex items-center gap-3">
            <span className="inline-block w-5 h-px bg-[var(--cta)]" />
            Malta General Election · 30 May 2026
          </p>
          <h2
            id="districts-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            13 electoral districts
          </h2>
        </header>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border" role="list">
          {districts.map((d) => (
            <li key={d.number} className="bg-background">
              <Link
                href={`/district/${d.number}`}
                className="group flex flex-col gap-2 p-5 h-full hover:bg-muted-bg/60 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    District {d.number}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--muted)]">
                    {d.candidates.length} candidates
                  </span>
                </div>
                <p className="text-sm leading-snug text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                  {d.localities || `District ${d.number}`}
                </p>
                <div className="mt-auto pt-3 flex gap-3 text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--muted)]">
                  <span>{d.tierCounts.Notable} notable</span>
                  <span>·</span>
                  <span>{d.tierCounts["Second-tier"]} second-tier</span>
                  <span>·</span>
                  <span>{d.tierCounts["List-filler"]} fillers</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
