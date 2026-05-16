"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Crown, Ghost, Lightbulb, Medal, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { Candidate, Severity, Tier } from "@/lib/types";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import {
  ControversyBadge,
  ElectabilityBadge,
  GovBadge,
  PartyBadge,
  SocialReachBadge,
  Stars,
  TierBadge,
} from "./Badges";

type SortKey =
  | "default"
  | "name"
  | "party"
  | "trackRecord"
  | "controversy"
  | "electability";

const TIER_ORDER: Tier[] = ["Notable", "Second-tier", "List-filler"];

const PARTY_CHIP_COLORS: Record<string, string> = {
  Labour:           "bg-red-100    text-red-900    border-red-200",
  PN:               "bg-blue-100   text-blue-900   border-blue-200",
  Momentum:         "bg-teal-100   text-teal-900   border-teal-200",
  ADPD:             "bg-green-100  text-green-900  border-green-200",
  "Aħwa Maltin":    "bg-amber-100  text-amber-900  border-amber-200",
  "Imperium Europa":"bg-violet-100 text-violet-900 border-violet-200",
  Independent:      "bg-orange-100 text-orange-900 border-orange-200",
};

const TIER_CHIP_COLORS: Record<string, string> = {
  Notable:      "bg-amber-50 text-amber-900 border-amber-200",
  "Second-tier":"bg-amber-50 text-amber-900 border-amber-200",
  "List-filler":"bg-amber-50 text-amber-900 border-amber-200",
};

const TIER_CHIP_ICONS: Record<string, ReactNode> = {
  Notable:       <Crown  size={12} aria-hidden />,
  "Second-tier": <Medal  size={12} aria-hidden />,
  "List-filler": <Ghost  size={12} aria-hidden />,
};

const TIER_CHIP_TITLES: Record<string, string> = {
  Notable:       "High-profile candidates — strong public presence, likely seat contenders",
  "Second-tier": "Credible candidates — some profile, realistic but not frontrunners",
  "List-filler": "Low-profile candidates — limited public presence, unlikely to win a seat",
};

const SEVERITY_ORDER: Severity[] = ["None", "Low", "Medium", "High"];
const ELECTABILITY_ORDER = ["✗", "✅", "✅✅", "✅✅✅"];
const TRACK_RECORD_ORDER = [1, 2, 3, 4, 5];

const SEVERITY_CHIP_COLORS: Record<string, string> = {
  None:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  Low:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50   text-amber-700   border-amber-200",
  High:   "bg-red-50     text-red-700     border-red-200",
};

const STAR_CHIP_COLORS: Record<string, string> = {
  "1": "bg-amber-50 text-amber-900 border-amber-200",
  "2": "bg-amber-50 text-amber-900 border-amber-200",
  "3": "bg-amber-50 text-amber-900 border-amber-200",
  "4": "bg-amber-50 text-amber-900 border-amber-200",
  "5": "bg-amber-50 text-amber-900 border-amber-200",
};

function candidateSlug(c: Candidate): string {
  return c.id.replace(/^\d+-/, "");
}

export default function MasterComparison({
  candidates,
  parties,
  districts,
  lang = "en",
}: {
  candidates: Candidate[];
  parties: string[];
  districts?: number[];
  lang?: Lang;
}) {
  const strings = getT(lang);
  const prefix = lang === "mt" ? "/mt" : "";

  const [selectedParties, setSelectedParties] = useState<Set<string>>(new Set(parties));
  const [selectedTiers, setSelectedTiers] = useState<Set<Tier>>(new Set(TIER_ORDER));
  const [selectedDistricts, setSelectedDistricts] = useState<Set<number>>(new Set(districts ?? []));
  const [selectedSeverities, setSelectedSeverities] = useState<Set<Severity>>(new Set(SEVERITY_ORDER));
  const [selectedStars, setSelectedStars] = useState<Set<number>>(new Set(TRACK_RECORD_ORDER));
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDesc, setSortDesc] = useState(true);

  // Drag-to-dismiss (mobile bottom sheet)
  const dragStartY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function openFilters() {
    setFiltersOpen(true);
    // Double RAF: let the element mount with its initial (off-screen) state,
    // then trigger the transition to the visible state.
    requestAnimationFrame(() => requestAnimationFrame(() => setFiltersVisible(true)));
  }

  function closeFilters() {
    setFiltersVisible(false);
    setTimeout(() => setFiltersOpen(false), 300);
  }

  // Close on Escape
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFiltersVisible(false);
        setTimeout(() => setFiltersOpen(false), 300);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  function handleDragStart(e: React.PointerEvent) {
    dragStartY.current = e.clientY;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function handleDragMove(e: React.PointerEvent) {
    if (!isDragging) return;
    setDragY(Math.max(0, e.clientY - dragStartY.current));
  }
  function handleDragEnd() {
    if (dragY > 80) {
      setDragY(0);
      setIsDragging(false);
      closeFilters();
    } else {
      setDragY(0);
      setIsDragging(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = candidates.filter((c) => {
      if (!selectedParties.has(c.party)) return false;
      if (!selectedTiers.has(c.tier)) return false;
      if (!selectedSeverities.has(c.controversySeverity)) return false;
      if (c.trackRecordStars > 0 && !selectedStars.has(c.trackRecordStars)) return false;
      if (districts && !selectedDistricts.has(c.district)) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.party.toLowerCase().includes(q) &&
        !`d${c.district}`.includes(q) &&
        !String(c.district).includes(q)
      )
        return false;
      return true;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === "default") {
        if (a.district !== b.district) return a.district - b.district;
        const td = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
        if (td !== 0) return td;
        const e =
          ELECTABILITY_ORDER.indexOf(b.electabilitySymbol) -
          ELECTABILITY_ORDER.indexOf(a.electabilitySymbol);
        if (e !== 0) return e;
        if (b.trackRecordStars !== a.trackRecordStars)
          return b.trackRecordStars - a.trackRecordStars;
        return a.name.localeCompare(b.name);
      }
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "party") cmp = a.party.localeCompare(b.party);
      else if (sortKey === "trackRecord") cmp = a.trackRecordStars - b.trackRecordStars;
      else if (sortKey === "controversy")
        cmp =
          SEVERITY_ORDER.indexOf(a.controversySeverity) -
          SEVERITY_ORDER.indexOf(b.controversySeverity);
      else if (sortKey === "electability")
        cmp =
          ELECTABILITY_ORDER.indexOf(a.electabilitySymbol) -
          ELECTABILITY_ORDER.indexOf(b.electabilitySymbol);
      return sortDesc ? -cmp : cmp;
    });
    return sorted;
  }, [
    candidates, selectedParties, selectedTiers, selectedSeverities,
    selectedStars, selectedDistricts, districts, search, sortKey, sortDesc,
  ]);

  function toggleInSet<T>(value: T, set: Set<T>, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function toggleDistrict(v: number) { toggleInSet(v, selectedDistricts, setSelectedDistricts); }

  function handleSort(key: SortKey) {
    if (sortKey === key) { setSortDesc((d) => !d); }
    else { setSortKey(key); setSortDesc(key === "name" || key === "party" ? false : true); }
  }

  const tierLabel = (tier: Tier) => {
    if (tier === "Notable") return strings.tierNotable;
    if (tier === "Second-tier") return strings.tierSecondTier;
    return strings.tierListFiller;
  };

  const isFiltered =
    !!search ||
    selectedParties.size < parties.length ||
    selectedTiers.size < TIER_ORDER.length ||
    selectedSeverities.size < SEVERITY_ORDER.length ||
    selectedStars.size < TRACK_RECORD_ORDER.length ||
    (!!districts && selectedDistricts.size < districts.length);

  const activeFilterCount =
    (selectedParties.size < parties.length ? 1 : 0) +
    (selectedTiers.size < TIER_ORDER.length ? 1 : 0) +
    (selectedSeverities.size < SEVERITY_ORDER.length ? 1 : 0) +
    (selectedStars.size < TRACK_RECORD_ORDER.length ? 1 : 0) +
    (districts && selectedDistricts.size < districts.length ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setSelectedParties(new Set(parties));
    setSelectedTiers(new Set(TIER_ORDER));
    setSelectedSeverities(new Set(SEVERITY_ORDER));
    setSelectedStars(new Set(TRACK_RECORD_ORDER));
    if (districts) setSelectedDistricts(new Set(districts));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Filters trigger */}
      <div className="flex gap-2">
        <button
          onClick={openFilters}
          aria-haspopup="dialog"
          aria-label={`${strings.filtersLabel}${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
          className="animate-attention relative inline-flex shrink-0 items-center gap-2 rounded-md border border-transparent bg-[var(--cta)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <SlidersHorizontal size={14} aria-hidden />
          {strings.filtersLabel}
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </button>
        <label htmlFor="candidate-search" className="sr-only">
          {strings.searchPlaceholder}
        </label>
        <input
          id="candidate-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={strings.searchPlaceholder}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {/* Tip */}
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Lightbulb size={13} aria-hidden className="shrink-0" />
        <span>
          <span className="font-medium">Tip:</span> filter by Candidate Public Profile to simplify your research
        </span>
      </p>

      {/* Count + view toggle */}
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{strings.candidatesCount(filtered.length)}</span>
        <div className="flex rounded-md border border-border bg-background p-0.5 text-sm">
          <button
            onClick={() => setView("cards")}
            className={`rounded px-2.5 py-1 ${view === "cards" ? "bg-foreground text-background" : "text-muted"}`}
            aria-pressed={view === "cards"}
          >
            {strings.viewCards}
          </button>
          <button
            onClick={() => setView("table")}
            className={`rounded px-2.5 py-1 ${view === "table" ? "bg-foreground text-background" : "text-muted"}`}
            aria-pressed={view === "table"}
          >
            {strings.viewTable}
          </button>
        </div>
      </div>

      {/* ── Filters sheet (mobile) / dialog (desktop) ───────────────────── */}
      {filtersOpen && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={closeFilters}
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 sm:backdrop-blur-sm ${
              filtersVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Positioning wrapper */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={strings.filtersLabel}
            className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4"
          >
            <div
              style={isDragging ? { transform: `translateY(${dragY}px)` } : undefined}
              className={`relative flex max-h-[65svh] flex-col rounded-t-2xl bg-background shadow-xl transition-all duration-300 sm:max-h-[80svh] sm:w-full sm:max-w-lg sm:rounded-2xl ${
                filtersVisible
                  ? "translate-y-0 opacity-100 sm:scale-100"
                  : "translate-y-full opacity-0 sm:translate-y-0 sm:scale-95"
              }`}
            >
              {/* Drag handle — mobile only */}
              <div
                className="flex cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing sm:hidden"
                onPointerDown={handleDragStart}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
              >
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-medium">{strings.filtersLabel}</span>
                <button
                  onClick={closeFilters}
                  aria-label="Close filters"
                  className="rounded-md p-1 text-muted transition-colors hover:bg-muted-bg hover:text-foreground"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>

              {/* Scrollable filter content */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-5 p-4">
                  {districts && districts.length > 1 && (
                    <FilterRow
                      label={strings.filterDistrict}
                      options={districts.map((d) => ({ value: d, label: `D${d}` }))}
                      selected={selectedDistricts}
                      onToggle={toggleDistrict}
                    />
                  )}

                  <FilterRow
                    label={strings.filterTier}
                    options={TIER_ORDER.map((tier) => ({ value: tier, label: tierLabel(tier) }))}
                    selected={selectedTiers}
                    onToggle={(v) => toggleInSet(v, selectedTiers, setSelectedTiers)}
                    colorMap={TIER_CHIP_COLORS}
                    iconMap={TIER_CHIP_ICONS}
                    titleMap={TIER_CHIP_TITLES}
                  />

                  <FilterRow
                    label={strings.filterParty}
                    options={parties.map((p) => ({ value: p, label: p }))}
                    selected={selectedParties}
                    onToggle={(v) => toggleInSet(v, selectedParties, setSelectedParties)}
                    colorMap={PARTY_CHIP_COLORS}
                  />

                  <FilterRow
                    label={strings.filterControversy}
                    options={SEVERITY_ORDER.map((s) => ({ value: s, label: s }))}
                    selected={selectedSeverities}
                    onToggle={(v) => toggleInSet(v, selectedSeverities, setSelectedSeverities)}
                    colorMap={SEVERITY_CHIP_COLORS}
                  />

                  <FilterRow
                    label={strings.filterTrackRecord}
                    options={TRACK_RECORD_ORDER.map((n) => ({ value: n, label: "★".repeat(n) }))}
                    selected={selectedStars}
                    onToggle={(v) => toggleInSet(v, selectedStars, setSelectedStars)}
                    colorMap={STAR_CHIP_COLORS}
                  />

                  {isFiltered && (
                    <button
                      onClick={resetFilters}
                      className="self-start text-xs text-accent hover:underline"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Results */}
      {view === "cards" ? (
        <CardGrid
          candidates={filtered}
          prefix={prefix}
          strings={strings}
          onReset={isFiltered ? resetFilters : undefined}
        />
      ) : (
        <DataTable
          candidates={filtered}
          sortKey={sortKey}
          sortDesc={sortDesc}
          onSort={handleSort}
          prefix={prefix}
          strings={strings}
          onReset={isFiltered ? resetFilters : undefined}
        />
      )}
    </div>
  );
}

function FilterRow<T extends string | number>({
  label,
  options,
  selected,
  onToggle,
  colorMap,
  iconMap,
  titleMap,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
  colorMap?: Record<string, string>;
  iconMap?: Record<string, ReactNode>;
  titleMap?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.has(o.value);
          const activeClass =
            colorMap?.[String(o.value)] ?? "border-accent bg-accent text-white";
          const icon = iconMap?.[String(o.value)];
          const tip = titleMap?.[String(o.value)];
          return (
            <button
              key={String(o.value)}
              onClick={() => onToggle(o.value)}
              aria-pressed={active}
              title={tip}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? activeClass
                  : "border-border bg-background text-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              {icon}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Strings = ReturnType<typeof getT>;

function CardGrid({
  candidates,
  prefix,
  strings,
  onReset,
}: {
  candidates: Candidate[];
  prefix: string;
  strings: Strings;
  onReset?: () => void;
}) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted-bg/50 px-4 py-8 text-center text-sm text-muted">
        <p>No candidates match the current filters.</p>
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/40"
          >
            Reset filters
          </button>
        )}
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {candidates.map((c) => (
        <li key={c.id}>
          <Link
            href={`${prefix}/district/${c.district}/${candidateSlug(c)}`}
            className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-4 transition hover:border-foreground/40 hover:shadow-sm"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <PartyBadge party={c.party} />
                <TierBadge tier={c.tier} />
                {c.isGovIncumbent && <GovBadge />}
                <span className="text-xs text-muted">D{c.district}</span>
              </div>
              <div className="self-start">
                <ElectabilityBadge
                  symbol={c.electabilitySymbol}
                  label={c.electabilityLabel}
                />
              </div>
              <h3 className="text-base font-semibold leading-snug group-hover:underline">
                {c.name}
              </h3>
            </div>

            {c.ideology && (
              <p className="text-sm text-muted line-clamp-2">{c.ideology}</p>
            )}

            <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
              <div>
                <dt className="mb-1 leading-tight text-muted">{strings.cardTrackRecord}</dt>
                <dd className="flex items-center"><Stars count={c.trackRecordStars} /></dd>
              </div>
              <div>
                <dt className="mb-1 leading-tight text-muted">{strings.cardControversy}</dt>
                <dd className="flex items-center"><ControversyBadge severity={c.controversySeverity} /></dd>
              </div>
              <div>
                <dt className="mb-1 leading-tight text-muted">{strings.cardSocialMedia}</dt>
                <dd className="flex items-center"><SocialReachBadge reach={c.socialReach} /></dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DataTable({
  candidates,
  sortKey,
  sortDesc,
  onSort,
  prefix,
  strings,
  onReset,
}: {
  candidates: Candidate[];
  sortKey: SortKey;
  sortDesc: boolean;
  onSort: (k: SortKey) => void;
  prefix: string;
  strings: Strings;
  onReset?: () => void;
}) {
  function arrow(k: SortKey) {
    if (sortKey !== k) return null;
    return <span className="ml-1 inline-block">{sortDesc ? "▾" : "▴"}</span>;
  }
  const sortBtn = "uppercase tracking-wide hover:text-foreground";
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted-bg/50 px-4 py-8 text-center text-sm text-muted">
        <p>No candidates match the current filters.</p>
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/40"
          >
            Reset filters
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-lg sm:border sm:border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted-bg/60 text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="sticky left-0 z-10 bg-muted-bg/95 px-3 py-2 backdrop-blur">
              <button onClick={() => onSort("name")} className={sortBtn}>
                {strings.colCandidate} {arrow("name")}
              </button>
            </th>
            <th className="px-3 py-2">
              <button onClick={() => onSort("party")} className={sortBtn}>
                {strings.filterParty} {arrow("party")}
              </button>
            </th>
            <th className="px-3 py-2">{strings.filterDistrict}</th>
            <th className="px-3 py-2">{strings.filterTier}</th>
            <th className="px-3 py-2">
              <button onClick={() => onSort("trackRecord")} className={sortBtn}>
                {strings.cardTrackRecord} {arrow("trackRecord")}
              </button>
            </th>
            <th className="px-3 py-2">
              <button onClick={() => onSort("controversy")} className={sortBtn}>
                {strings.cardControversy} {arrow("controversy")}
              </button>
            </th>
            <th className="px-3 py-2">{strings.cardSocialMedia}</th>
            <th className="px-3 py-2">
              <button onClick={() => onSort("electability")} className={sortBtn}>
                {strings.colElectability} {arrow("electability")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((c) => (
            <tr key={c.id} className="bg-background hover:bg-muted-bg/40">
              <td className="sticky left-0 z-10 max-w-[16rem] truncate bg-background px-3 py-2 font-medium">
                <Link
                  href={`${prefix}/district/${c.district}/${candidateSlug(c)}`}
                  className="hover:underline"
                >
                  {c.name}
                </Link>
                {c.isGovIncumbent && (
                  <span className="ml-2 align-middle"><GovBadge /></span>
                )}
              </td>
              <td className="px-3 py-2"><PartyBadge party={c.party} /></td>
              <td className="px-3 py-2 text-muted">D{c.district}</td>
              <td className="px-3 py-2"><TierBadge tier={c.tier} /></td>
              <td className="px-3 py-2"><Stars count={c.trackRecordStars} /></td>
              <td className="px-3 py-2"><ControversyBadge severity={c.controversySeverity} /></td>
              <td className="px-3 py-2"><SocialReachBadge reach={c.socialReach} /></td>
              <td className="px-3 py-2">
                <ElectabilityBadge
                  symbol={c.electabilitySymbol}
                  label={c.electabilityLabel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
