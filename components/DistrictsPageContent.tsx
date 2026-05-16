import Link from "next/link";
import { getAllDistricts } from "@/lib/data";
import MasterComparison from "@/components/MasterComparison";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function DistrictsPageContent({ lang }: { lang: Lang }) {
  const t = getT(lang);
  const districts = getAllDistricts();
  const candidates = districts.flatMap((d) => d.candidates);
  const districtNumbers = districts.map((d) => d.number);
  const partySet = new Set<string>();
  for (const c of candidates) if (c.party) partySet.add(c.party);
  const parties = Array.from(partySet).sort();
  const prefix = lang === "mt" ? "/mt" : "";

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t.chooseYourDistrict}
        </h1>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-1 sm:mx-0 sm:px-0">
          {districts.map((d) => (
            <Link
              key={d.number}
              href={`${prefix}/district/${d.number}`}
              className="shrink-0 rounded-full border border-border bg-muted-bg/50 px-3 py-1 text-sm hover:border-foreground/50"
            >
              District {d.number} ·{" "}
              <span className="text-muted">{d.candidates.length} {t.candidatesUnit}</span>
            </Link>
          ))}
        </div>
      </div>

      <MasterComparison
        candidates={candidates}
        parties={parties}
        districts={districtNumbers}
        lang={lang}
      />
    </div>
  );
}
