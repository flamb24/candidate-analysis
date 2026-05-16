"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to the very top on every client-side route change.
 * Sets history.scrollRestoration = "manual" so the browser never
 * fights us, then fires inside a rAF to win the race against any
 * residual scroll-restoration callbacks.
 */
export default function ScrollReset() {
  const pathname = usePathname();

  // Disable browser-managed scroll restoration once, on mount.
  useEffect(() => {
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual";
    }
  }, []);

  // On every navigation, reset scroll after the browser has settled.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
