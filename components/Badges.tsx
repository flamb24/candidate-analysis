import { Check, Circle, Landmark, Megaphone, Volume1, Volume2, VolumeX, X } from "lucide-react";
import type {
  ElectabilitySymbol,
  Severity,
  SocialReach,
  Tier,
} from "@/lib/types";

const PARTY_COLORS: Record<string, string> = {
  Labour: "bg-red-100 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-900",
  PN: "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-900",
  Momentum:
    "bg-teal-100 text-teal-900 border-teal-200 dark:bg-teal-950 dark:text-teal-100 dark:border-teal-900",
  ADPD: "bg-green-100 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-900",
  "Aħwa Maltin":
    "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-900",
};

export function PartyBadge({ party }: { party: string }) {
  const cls =
    PARTY_COLORS[party] ??
    "bg-zinc-100 text-zinc-900 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800";
  return (
    <span
      data-party={party}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {party}
    </span>
  );
}

const TIER_STYLES: Record<Tier, string> = {
  Notable:
    "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  "Second-tier":
    "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800",
  "List-filler":
    "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800",
};

export function TierBadge({ tier }: { tier: Tier }) {
  const label =
    tier === "Notable"
      ? "Notable"
      : tier === "Second-tier"
        ? "2nd tier"
        : "List-filler";
  return (
    <span
      data-tier={tier}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${TIER_STYLES[tier]}`}
    >
      {label}
    </span>
  );
}

export function GovBadge() {
  return (
    <span
      data-gov-badge
      title="Currently in government"
      className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
    >
      <Landmark size={10} aria-hidden />
      Gov
    </span>
  );
}

export function Stars({ count, max = 5 }: { count: number; max?: number }) {
  if (count === 0) return <span className="text-muted">—</span>;
  return (
    <span
      data-stars
      aria-label={`${count} of ${max} stars`}
      className="inline-flex items-baseline whitespace-nowrap text-base leading-none tracking-tight"
    >
      <span className="text-amber-500">{"★".repeat(count)}</span>
      <span className="text-zinc-300 dark:text-zinc-700">
        {"★".repeat(Math.max(0, max - count))}
      </span>
    </span>
  );
}

const SEVERITY_STYLES: Record<Severity, { label: string; cls: string }> = {
  None:   { label: "None",   cls: "text-emerald-700 dark:text-emerald-400" },
  Low:    { label: "Low",    cls: "text-emerald-700 dark:text-emerald-400" },
  Medium: { label: "Medium", cls: "text-amber-700 dark:text-amber-400" },
  High:   { label: "High",   cls: "text-red-700 dark:text-red-400" },
};

export function ControversyBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <span data-severity={severity} className={`inline-flex items-center gap-1 text-sm ${s.cls}`}>
      <Circle size={10} fill="currentColor" strokeWidth={0} aria-hidden />
      <span>{s.label}</span>
    </span>
  );
}

const REACH_ICON: Record<SocialReach, React.ReactNode> = {
  None:     <VolumeX  size={14} aria-hidden />,
  Low:      <Volume1  size={14} aria-hidden />,
  Moderate: <Volume2  size={14} aria-hidden />,
  High:     <Megaphone size={14} aria-hidden />,
};

export function SocialReachBadge({ reach }: { reach: SocialReach }) {
  return (
    <span data-reach={reach} className="inline-flex items-center gap-1 text-sm" title={reach}>
      {REACH_ICON[reach]}
      <span className="text-muted">{reach}</span>
    </span>
  );
}

const ELECTABILITY_LABELS: Record<ElectabilitySymbol, { short: string; cls: string; checks: number }> = {
  "✅✅✅": { short: "Near-certain", cls: "bg-emerald-600 text-white dark:bg-emerald-500",              checks: 3 },
  "✅✅":   { short: "Likely",       cls: "bg-emerald-500/90 text-white",                               checks: 2 },
  "✅":     { short: "Competitive",  cls: "bg-amber-400 text-amber-950",                                checks: 1 },
  "✗":      { short: "Unlikely",     cls: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400", checks: 0 },
};

export function ElectabilityBadge({
  symbol,
  label,
}: {
  symbol: ElectabilitySymbol;
  label?: string;
}) {
  const { short, cls, checks } = ELECTABILITY_LABELS[symbol];
  return (
    <span
      data-electability={symbol}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      <span aria-hidden className="inline-flex">
        {checks === 0
          ? <X size={12} strokeWidth={2.5} />
          : Array.from({ length: checks }).map((_, i) => (
              <Check key={i} size={12} strokeWidth={2.5} className="-mx-px" />
            ))
        }
      </span>
      <span>{label || short}</span>
    </span>
  );
}
