import Link from "next/link";
import { getAllDistricts } from "@/lib/data";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import LocalitySearch, { type LocalityEntry } from "@/components/LocalitySearch";

// ─── Locality parsing ─────────────────────────────────────────────────────────
// Splits a raw localities string (e.g. "Qormi, Siġġiewi, Luqa and Ħal Farruġ")
// into individual locality names, handling all edge cases in the dataset.
function parseLocalities(localities: string): string[] {
  const parts = localities.split(",").map(s => s.trim()).filter(Boolean);
  const result: string[] = [];
  for (const part of parts) {
    // Strip Oxford-comma "and " prefix (e.g. ", and In-Naxxar (part of)")
    const cleaned = part.replace(/^and\s+/i, "").trim();
    // Split on " and " that is NOT inside parentheses
    const andMatch = cleaned.match(/ and (?![^(]*\))/);
    if (andMatch && andMatch.index !== undefined) {
      result.push(cleaned.slice(0, andMatch.index).trim());
      result.push(cleaned.slice(andMatch.index + 5).trim());
    } else {
      result.push(cleaned);
    }
  }
  return result.filter(Boolean);
}

export default function DistrictsPageContent({ lang }: { lang: Lang }) {
  const t = getT(lang);
  const districts = getAllDistricts();
  const prefix = lang === "mt" ? "/mt" : "";

  const entries: LocalityEntry[] = districts.flatMap(d =>
    parseLocalities(d.localities).map(locality => ({
      locality,
      districtNumber: d.number,
    }))
  );

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

      <LocalitySearch
        entries={entries}
        prefix={prefix}
        placeholder={t.localitySearchPlaceholder}
        noResults={t.localitySearchNoResults}
      />

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
                <span className="font-mono text-xs text-[var(--muted)]">
                  {d.candidates.length} {t.candidatesUnit}
                </span>
              </div>
              <p className="text-sm leading-snug text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                {d.localities || `District ${d.number}`}
              </p>
              <div className="mt-auto pt-3 flex gap-3 text-xs font-mono uppercase tracking-[0.1em] text-[var(--muted)]">
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

      <Link
        href={`${prefix}/districts/all`}
        className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-muted-bg/40 px-5 py-4 transition-colors hover:bg-muted-bg hover:border-foreground/30"
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground group-hover:underline">
            {t.viewAllCandidates}
          </span>
          <span className="text-sm text-muted">
            Compare candidates across all {districts.length} districts in one view
          </span>
        </div>
        <span aria-hidden className="shrink-0 text-muted text-lg group-hover:text-foreground transition-colors">→</span>
      </Link>

    </div>
  );
}
