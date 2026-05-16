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
  const title = `District ${district.number} Candidates — Distrett`;
  const description = `Compare all ${district.candidates.length} candidates running in District ${district.number}${district.localities ? ` (${district.localities})` : ""} in the Malta General Election 2026 — track records, controversies, and electability.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function DistrictPage({ params }: Props) {
  const { number } = await params;
  return <DistrictPageContent districtNum={parseInt(number, 10)} lang="en" />;
}
