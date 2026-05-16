import Link from "next/link";
import { notFound } from "next/navigation";
import { getDistrict } from "@/lib/data";
import IssueMatrix from "@/components/IssueMatrix";
import MasterComparison from "@/components/MasterComparison";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export default function DistrictPageContent({
  districtNum,
  lang,
}: {
  districtNum: number;
  lang: Lang;
}) {
  const t = getT(lang);
  const district = getDistrict(districtNum);
  if (!district) return notFound();

  const prefix = lang === "mt" ? "/mt" : "";

  const parties = Array.from(
    new Set(district.candidates.map((c) => c.party).filter(Boolean))
  ).sort();

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <nav className="text-sm">
        <Link
          href={`${prefix}/districts`}
          className="text-muted hover:text-foreground hover:underline"
        >
          {t.backToDistricts}
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          District {district.number}
        </h1>
        <p className="text-sm text-muted">{district.subtitle}</p>
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted">
          <span>
            <strong className="text-foreground">{district.candidates.length}</strong>{" "}
            {t.districtCandidates}
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">{district.tierCounts.Notable}</strong>{" "}
            {t.districtNotable}
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">
              {district.tierCounts["Second-tier"]}
            </strong>{" "}
            {t.districtSecondTier}
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">
              {district.tierCounts["List-filler"]}
            </strong>{" "}
            {t.districtFillers}
          </span>
        </div>
      </header>

      {district.intro && (
        <details className="group rounded-lg border border-border bg-muted-bg/30 p-4">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            {t.districtContext}
          </summary>
          <div className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
            {renderInlineBold(district.intro)}
          </div>
        </details>
      )}

      <section>
        <MasterComparison
          candidates={district.candidates}
          parties={parties}
          lang={lang}
        />
      </section>

      {district.issueMatrix && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {t.issueMatrixTitle}
          </h2>
          <p className="text-sm text-muted">
            {t.issueMatrixSubtext(district.number)}
          </p>
          <IssueMatrix data={district.issueMatrix} />
        </section>
      )}
    </div>
  );
}
