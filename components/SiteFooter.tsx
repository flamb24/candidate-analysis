"use client";

import { usePathname } from "next/navigation";
import { getT } from "@/lib/i18n";

export default function SiteFooter() {
  const pathname = usePathname();
  const lang = pathname.startsWith("/mt") ? "mt" : "en";
  const t = getT(lang);

  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted">
      {t.footer}
    </footer>
  );
}
