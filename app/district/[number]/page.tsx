import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllDistricts, getDistrict } from "@/lib/data";
import IssueMatrix from "@/components/IssueMatrix";
import MasterComparison from "@/components/MasterComparison";

export function generateStaticParams() {
  return getAllDistricts().map((d) => ({ number: String(d.number) }));
}

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

interface Props {
  params: Promise<{ number: string }>;
}

export default async function DistrictPage({ params }: Props) {
  const { number } = await params;
  const districtNum = parseInt(number, 10);
  const district = getDistrict(districtNum);
  if (!district) return notFound();

  const parties = Array.from(
    new Set(district.candidates.map((c) => c.party).filter(Boolean))
  ).sort();

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm">
        <Link href="/" className="text-muted hover:text-foreground hover:underline">
          ← All districts
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
            candidates
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">{district.tierCounts.Notable}</strong>{" "}
            notable
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">
              {district.tierCounts["Second-tier"]}
            </strong>{" "}
            second-tier
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">
              {district.tierCounts["List-filler"]}
            </strong>{" "}
            list-fillers
          </span>
        </div>
      </header>

      {district.intro && (
        <details className="group rounded-lg border border-border bg-muted-bg/30 p-4">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            District context
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
        />
      </section>

      {district.issueMatrix && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Issue stance matrix
          </h2>
          <p className="text-sm text-muted">
            Where each party stands across the issues most likely to drive votes in D{district.number}.
          </p>
          <IssueMatrix data={district.issueMatrix} />
        </section>
      )}
    </div>
  );
}
