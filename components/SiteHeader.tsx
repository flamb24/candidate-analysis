"use client";

import Link from "next/link";
import { BookOpen, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import HVToggle from "@/components/HVToggle";
import ShareButton from "@/components/ShareButton";
import LangToggle from "@/components/LangToggle";
import { getT } from "@/lib/i18n";

export default function SiteHeader() {
  const pathname = usePathname();
  const lang = pathname.startsWith("/mt") ? "mt" : "en";
  const t = getT(lang);
  const homeHref = lang === "mt" ? "/mt" : "/";
  const isHome = pathname === "/" || pathname === "/mt";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {isHome ? (
          <span className="w-[72px]" />
        ) : (
          <Link
            href={homeHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted hover:border-foreground/40 hover:text-foreground transition-colors"
          >
            <Home size={11} aria-hidden />
            {t.home}
          </Link>
        )}
        <nav className="flex items-center gap-2 sm:gap-3 text-sm text-muted">
          <Link
            href={lang === "mt" ? "/mt/guide" : "/guide"}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--cta)]/40 px-2.5 py-1 text-xs text-[var(--cta)] hover:bg-[var(--cta)]/5 transition-colors"
          >
            <BookOpen size={11} aria-hidden />
            {t.votingGuide}
          </Link>
          <ShareButton shareLabel={t.share} copiedLabel={t.copied} />
          {/* <LangToggle /> — hidden until translations are reviewed */}
          <HVToggle label={t.highVis} />
        </nav>
      </div>
    </header>
  );
}
