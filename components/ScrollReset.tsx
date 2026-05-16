"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scrolls to the top on every client-side route change. */
export default function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
