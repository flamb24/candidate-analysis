import Link from "next/link";
import { getAllDistricts } from "@/lib/data";
import MasterComparison from "@/components/MasterComparison";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function AllCandidatesPageContent({ lang }: { lang: Lang }) {
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
      <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-muted">
        <Link
          href={`${prefix}/districts`}
          className="hover:text-foreground hover:underline"
        >
          {t.electoralDistrictsTitle(districts.length)}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{t.allCandidatesTitle}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t.allCandidatesTitle}
      </h1>

      <MasterComparison
        candidates={candidates}
        parties={parties}
        districts={districtNumbers}
        lang={lang}
      />
    </div>
  );
}
