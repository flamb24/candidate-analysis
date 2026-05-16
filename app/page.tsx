import Link from "next/link";
import { getAllDistricts } from "@/lib/data";
import MasterComparison from "@/components/MasterComparison";

export default function Home() {
  const districts = getAllDistricts();
  const candidates = districts.flatMap((d) => d.candidates);
  const districtNumbers = districts.map((d) => d.number);
  const partySet = new Set<string>();
  for (const c of candidates) if (c.party) partySet.add(c.party);
  const parties = Array.from(partySet).sort();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Candidate Comparison
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Browse all {candidates.length} candidates across{" "}
          {districts.length} district{districts.length === 1 ? "" : "s"} contesting
          the Malta General Election 2026. Filter by district, party, or tier; tap any
          candidate for the full profile.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {districts.map((d) => (
            <Link
              key={d.number}
              href={`/district/${d.number}`}
              className="rounded-full border border-border bg-muted-bg/50 px-3 py-1 text-sm hover:border-foreground/50"
            >
              District {d.number} ·{" "}
              <span className="text-muted">{d.candidates.length} candidates</span>
            </Link>
          ))}
        </div>
      </section>

      <MasterComparison
        candidates={candidates}
        districts={districtNumbers}
        parties={parties}
      />
    </div>
  );
}
