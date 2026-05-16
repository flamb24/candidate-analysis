"use client";
import { useEffect, useState } from "react";

export default function HVToggle() {
  const [hv, setHv] = useState(false);

  useEffect(() => {
    setHv(document.documentElement.classList.contains("hv"));
  }, []);

  function toggle() {
    const next = !hv;
    setHv(next);
    document.documentElement.classList.toggle("hv", next);
    try { localStorage.setItem("hv", next ? "1" : "0"); } catch { /* private browsing */ }
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={hv}
      aria-label={hv ? "Turn off high-visibility mode" : "Turn on high-visibility mode"}
      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
        hv
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted hover:border-foreground hover:text-foreground"
      }`}
    >
      {hv ? "High vis ✓" : "High vis"}
    </button>
  );
}
