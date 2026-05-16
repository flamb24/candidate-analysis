"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LangToggle() {
  const pathname = usePathname();
  const isMt = pathname.startsWith("/mt");
  const target = isMt ? (pathname.slice(3) || "/") : "/mt" + pathname;

  function save() {
    try {
      localStorage.setItem("lang", isMt ? "en" : "mt");
    } catch {}
  }

  return (
    <Link
      href={target}
      onClick={save}
      className="rounded-md border border-border px-2.5 py-1 text-xs text-muted hover:border-foreground/40 hover:text-foreground transition-colors"
    >
      {isMt ? "EN" : "MT"}
    </Link>
  );
}
