"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FloatingCTA() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = document.getElementById("candidates");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden={hidden}
      className={`
        fixed bottom-5 z-50 transition-all duration-300 ease-in-out
        left-4 right-4
        sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2
        ${hidden ? "translate-y-20 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}
      `}
    >
      <Link
        href="#candidates"
        className="
          group flex items-center justify-center gap-3
          w-full sm:w-auto sm:inline-flex
          rounded-2xl sm:rounded-full bg-[var(--cta)] text-white
          px-6 py-4 sm:py-3.5
          font-serif font-bold text-base -tracking-[0.005em]
          shadow-[0_4px_28px_-4px_var(--cta)]
          hover:-translate-y-px hover:shadow-[0_8px_36px_-4px_var(--cta)]
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cta)]
          transition-all duration-150
        "
      >
        Find your candidate
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-sm group-hover:bg-white/30 transition-colors"
        >
          →
        </span>
      </Link>
    </div>
  );
}
