import { getAllDistricts } from "@/lib/data";
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
