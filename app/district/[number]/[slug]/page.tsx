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
  const party = candidate.party || "Independent";
  const title = `${candidate.name} — District ${number} — Distrett`;
  const description = `${candidate.name} (${party}) — track record, controversies, electability, and stance on key issues. District ${number}, Malta General Election 2026.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function CandidatePage({ params }: Props) {
  const { number, slug } = await params;
  return (
    <CandidatePageContent
      districtNum={parseInt(number, 10)}
      slug={slug}
      lang="en"
    />
  );
}
