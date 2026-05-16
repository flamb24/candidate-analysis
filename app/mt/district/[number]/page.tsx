import type { Metadata } from "next";
import { getAllDistricts, getDistrict } from "@/lib/data";
import DistrictPageContent from "@/components/DistrictPageContent";

export function generateStaticParams() {
  return getAllDistricts().map((d) => ({ number: String(d.number) }));
}

interface Props {
  params: Promise<{ number: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const district = getDistrict(parseInt(number, 10));
  if (!district) return {};
  const title = `Kandidati Distrett ${district.number} — Distrett`;
  const description = `Qabbel il-${district.candidates.length} kandidati fid-Distrett ${district.number}${district.localities ? ` (${district.localities})` : ""} fl-Elezzjoni Ġenerali ta' Malta 2026.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function MtDistrictPage({ params }: Props) {
  const { number } = await params;
  return <DistrictPageContent districtNum={parseInt(number, 10)} lang="mt" />;
}
