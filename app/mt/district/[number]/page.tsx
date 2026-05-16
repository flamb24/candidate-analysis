import { getAllDistricts } from "@/lib/data";
import DistrictPageContent from "@/components/DistrictPageContent";

export function generateStaticParams() {
  return getAllDistricts().map((d) => ({ number: String(d.number) }));
}

interface Props {
  params: Promise<{ number: string }>;
}

export default async function MtDistrictPage({ params }: Props) {
  const { number } = await params;
  return <DistrictPageContent districtNum={parseInt(number, 10)} lang="mt" />;
}
