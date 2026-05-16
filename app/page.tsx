import Link from "next/link";
import { getAllDistricts } from "@/lib/data";
import MasterComparison from "@/components/MasterComparison";
import HeroSection from "@/components/HeroSection";
import FloatingCTA from "@/components/FloatingCTA";

export default function Home() {
  const districts = getAllDistricts();
  const candidates = districts.flatMap((d) => d.candidates);
  const districtNumbers = districts.map((d) => d.number);
  const partySet = new Set<string>();
  for (const c of candidates) if (c.party) partySet.add(c.party);
  const parties = Array.from(partySet).sort();

  return (
    <>
      <HeroSection />
      <FloatingCTA />

      <section id="candidates" className="flex flex-col gap-6 px-4 sm:px-6 py-8 sm:py-10 max-w-6xl mx-auto w-full">
        <div className="flex flex-col gap-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-1 sm:mx-0 sm:px-0">
            {districts.map((d) => (
              <Link
                key={d.number}
                href={`/district/${d.number}`}
                className="shrink-0 rounded-full border border-border bg-muted-bg/50 px-3 py-1 text-sm hover:border-foreground/50"
              >
                District {d.number} ·{" "}
                <span className="text-muted">{d.candidates.length} candidates</span>
              </Link>
            ))}
          </div>
        </div>

        <MasterComparison
          candidates={candidates}
          parties={parties}
          districts={districtNumbers}
        />
      </section>
    </>
  );
}
