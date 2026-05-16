import Link from "next/link";
import { getAllDistricts } from "@/lib/data";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function DistrictsPageContent({ lang }: { lang: Lang }) {
  const t = getT(lang);
  const districts = getAllDistricts();
  const prefix = lang === "mt" ? "/mt" : "";

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">

      <header className="flex flex-col gap-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--cta)] flex items-center gap-3">
          <span className="inline-block w-5 h-px bg-[var(--cta)]" />
          {t.electionLabel}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t.electoralDistrictsTitle(districts.length)}
        </h1>
      </header>

      <ol
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
        role="list"
      >
        {districts.map((d) => (
          <li key={d.number} className="bg-background">
            <Link
              href={`${prefix}/district/${d.number}`}
              className="group flex flex-col gap-2 p-5 h-full hover:bg-muted-bg/60 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  District {d.number}
                </span>
                <span className="font-mono text-[10px] text-[var(--muted)]">
                  {d.candidates.length} {t.candidatesUnit}
                </span>
              </div>
              <p className="text-sm leading-snug text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                {d.localities || `District ${d.number}`}
              </p>
              <div className="mt-auto pt-3 flex gap-3 text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--muted)]">
                <span>{d.tierCounts.Notable} {t.notableUnit}</span>
                <span>·</span>
                <span>{d.tierCounts["Second-tier"]} {t.secondTierUnit}</span>
                <span>·</span>
                <span>{d.tierCounts["List-filler"]} {t.fillersUnit}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="border-t border-border pt-6">
        <Link
          href={`${prefix}/districts/all`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          {t.viewAllCandidates}
          <span aria-hidden>→</span>
        </Link>
      </div>

    </div>
  );
}
