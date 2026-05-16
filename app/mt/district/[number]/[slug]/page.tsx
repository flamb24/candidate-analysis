import type { Metadata } from "next";
import { getAllDistricts, getCandidate } from "@/lib/data";
import CandidatePageContent from "@/components/CandidatePageContent";

export function generateStaticParams() {
  return getAllDistricts().flatMap((d) =>
    d.candidates.map((c) => ({
      number: String(d.number),
      slug: c.id.replace(/^\d+-/, ""),
    }))
  );
}

interface Props {
  params: Promise<{ number: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number, slug } = await params;
  const candidate = getCandidate(parseInt(number, 10), slug);
  if (!candidate) return {};
  const party = candidate.party || "Indipendenti";
  const title = `${candidate.name} — Distrett ${number} — Distrett`;
  const description = `${candidate.name} (${party}) — rekord, kontroversji, elettabbiltà, u feħmiet fuq kwistjonijiet ewlenin. Distrett ${number}, Elezzjoni Ġenerali ta' Malta 2026.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function MtCandidatePage({ params }: Props) {
  const { number, slug } = await params;
  return (
    <CandidatePageContent
      districtNum={parseInt(number, 10)}
      slug={slug}
      lang="mt"
    />
  );
}
