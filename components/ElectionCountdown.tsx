"use client";

import { useEffect, useState } from "react";

// Polls open: 30 May 2026 07:00 Malta time (UTC+2)
const ELECTION_MS = Date.UTC(2026, 4, 30, 5, 0, 0); // 07:00 CEST = 05:00 UTC

function getRemaining() {
  const diff = ELECTION_MS - Date.now();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86_400_000);
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000)  / 60_000);
  const seconds = Math.floor((diff % 60_000)     / 1_000);
  return { days, hours, minutes, seconds };
}

export default function ElectionCountdown() {
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!remaining) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cta)]">
        Polls are open
      </p>
    );
  }

  const { days, hours, minutes, seconds } = remaining;

  return (
    <div className="flex items-end gap-3 tabular-nums">
      {[
        { value: days,    label: "days"    },
        { value: hours,   label: "hrs"     },
        { value: minutes, label: "min"     },
        { value: seconds, label: "sec"     },
      ].map(({ value, label }, i) => (
        <div key={label} className="flex items-end gap-1">
          {i > 0 && (
            <span className="font-mono text-[10px] text-[var(--muted)] mb-[3px] -ml-1.5">·</span>
          )}
          <div className="flex flex-col items-center leading-none">
            <span className="font-serif font-bold text-xl -tracking-[0.02em]">
              {String(value).padStart(2, "0")}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] mt-0.5">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
