import type { Metadata } from "next";
import VotingGuideContent from "@/components/VotingGuideContent";

export const metadata: Metadata = {
  title: "How to Vote — Distrett",
  description:
    "A non-partisan guide to casting your vote well at the Malta General Election on 30 May 2026. How STV works, what to look for in a candidate, red flags, and key issues.",
  openGraph: {
    title: "How to Vote — Distrett",
    description:
      "A non-partisan guide to casting your vote well at the Malta General Election on 30 May 2026.",
    url: "https://distrett.com/guide",
  },
};

export default function GuidePage() {
  return <VotingGuideContent />;
}
