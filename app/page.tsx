import HeroSection from "@/components/HeroSection";
import FloatingCTA from "@/components/FloatingCTA";
import { getT } from "@/lib/i18n";

export default function Home() {
  const t = getT("en");

  return (
    <>
      <HeroSection lang="en" />
      <FloatingCTA href="/districts" label={t.findYourCandidate} />
    </>
  );
}
