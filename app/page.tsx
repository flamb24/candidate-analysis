import HeroSection from "@/components/HeroSection";
import FloatingCTA from "@/components/FloatingCTA";
import SourcesTicker from "@/components/SourcesTicker";
import { getT } from "@/lib/i18n";

export default function Home() {
  const t = getT("en");

  return (
    <>
      <HeroSection lang="en" />

      {/* ── Sources credit ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            {t.sourcesSectionLabel}
          </p>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {t.sourcesHeading}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            {t.sourcesCopy}
          </p>
        </div>
        <SourcesTicker />
      </section>

      <FloatingCTA href="/districts" label={t.findYourCandidate} />
    </>
  );
}
