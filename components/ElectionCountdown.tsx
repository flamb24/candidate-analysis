"use client";

import { useEffect, useState } from "react";

// Polls open:  30 May 2026 07:00 Malta time (CEST = UTC+2)
// Polls close: 30 May 2026 22:00 Malta time
const POLLS_OPEN_MS  = Date.UTC(2026, 4, 30,  5, 0, 0); // 07:00 CEST → UTC
const POLLS_CLOSE_MS = Date.UTC(2026, 4, 30, 20, 0, 0); // 22:00 CEST → UTC

type Phase = "countdown" | "open" | "concluded";

function getPhase(): Phase {
  const now = Date.now();
  if (now < POLLS_OPEN_MS)  return "countdown";
  if (now < POLLS_CLOSE_MS) return "open";
  return "concluded";
}

function getRemaining() {
  const diff = POLLS_OPEN_MS - Date.now();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86_400_000);
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000)  / 60_000);
  const seconds = Math.floor((diff % 60_000)     / 1_000);
  return { days, hours, minutes, seconds };
}

export default function ElectionCountdown() {
  const [phase, setPhase]         = useState<Phase>(getPhase);
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => {
      setPhase(getPhase());
      setRemaining(getRemaining());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (phase === "open") {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--cta)]">
        Polls are open today · 07:00–22:00
      </p>
    );
  }

  if (phase === "concluded" || !remaining) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        Election concluded · 30 May 2026
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
