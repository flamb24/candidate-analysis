"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Candidate, Tier } from "@/lib/types";
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
const SEVERITY_ORDER = ["None", "Low", "Medium", "High"];
const ELECTABILITY_ORDER = ["✗", "✅", "✅✅", "✅✅✅"];

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

  const [selectedParties, setSelectedParties] = useState<Set<string>>(
    new Set(parties)
  );
  const [selectedTiers, setSelectedTiers] = useState<Set<Tier>>(
    new Set(TIER_ORDER)
  );
  const [selectedDistricts, setSelectedDistricts] = useState<Set<number>>(
    new Set(districts ?? [])
  );
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = candidates.filter((c) => {
      if (!selectedParties.has(c.party)) return false;
      if (!selectedTiers.has(c.tier)) return false;
      if (districts && !selectedDistricts.has(c.district)) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
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
      else if (sortKey === "trackRecord")
        cmp = a.trackRecordStars - b.trackRecordStars;
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
    candidates,
    selectedParties,
    selectedTiers,
    selectedDistricts,
    districts,
    search,
    sortKey,
    sortDesc,
  ]);

  function toggleInSet<T>(value: T, set: Set<T>, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function toggleDistrict(v: number) {
    toggleInSet(v, selectedDistricts, setSelectedDistricts);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(key === "name" || key === "party" ? false : true);
    }
  }

  const tierLabel = (tier: Tier) => {
    if (tier === "Notable") return strings.tierNotable;
    if (tier === "Second-tier") return strings.tierSecondTier;
    return strings.tierListFiller;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted-bg/50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={strings.searchPlaceholder}
            className="flex-1 min-w-[180px] rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <div className="flex rounded-md border border-border bg-background p-0.5 text-sm">
            <button
              onClick={() => setView("cards")}
              className={`rounded px-2.5 py-1 ${
                view === "cards" ? "bg-foreground text-background" : "text-muted"
              }`}
              aria-pressed={view === "cards"}
            >
              {strings.viewCards}
            </button>
            <button
              onClick={() => setView("table")}
              className={`rounded px-2.5 py-1 ${
                view === "table" ? "bg-foreground text-background" : "text-muted"
              }`}
              aria-pressed={view === "table"}
            >
              {strings.viewTable}
            </button>
          </div>
        </div>

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
          options={TIER_ORDER.map((tier) => ({
            value: tier,
            label: tierLabel(tier),
          }))}
          selected={selectedTiers}
          onToggle={(v) => toggleInSet(v, selectedTiers, setSelectedTiers)}
        />

        <FilterRow
          label={strings.filterParty}
          options={parties.map((p) => ({ value: p, label: p }))}
          selected={selectedParties}
          onToggle={(v) => toggleInSet(v, selectedParties, setSelectedParties)}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>{strings.candidatesCount(filtered.length)}</span>
      </div>

      {view === "cards" ? (
        <CardGrid candidates={filtered} prefix={prefix} strings={strings} />
      ) : (
        <DataTable
          candidates={filtered}
          sortKey={sortKey}
          sortDesc={sortDesc}
          onSort={handleSort}
          prefix={prefix}
          strings={strings}
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
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.has(o.value);
        return (
          <button
            key={String(o.value)}
            onClick={() => onToggle(o.value)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              active
                ? "border-accent bg-accent text-white"
                : "border-border bg-background text-muted hover:border-foreground hover:text-foreground"
            }`}
          >
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
}: {
  candidates: Candidate[];
  prefix: string;
  strings: Strings;
}) {
  if (candidates.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted-bg/50 px-4 py-8 text-center text-sm text-muted">
        No candidates match the current filters.
      </p>
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <PartyBadge party={c.party} />
                  <TierBadge tier={c.tier} />
                  {c.isGovIncumbent && <GovBadge />}
                  <span className="text-xs text-muted">D{c.district}</span>
                </div>
                <h3 className="mt-1.5 text-base font-semibold leading-snug group-hover:underline">
                  {c.name}
                </h3>
              </div>
              <ElectabilityBadge
                symbol={c.electabilitySymbol}
                label={c.electabilityLabel}
              />
            </div>

            {c.ideology && (
              <p className="text-sm text-muted line-clamp-2">{c.ideology}</p>
            )}

            <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
              <div>
                <dt className="mb-1 leading-tight text-muted">{strings.cardTrackRecord}</dt>
                <dd className="flex items-center">
                  <Stars count={c.trackRecordStars} />
                </dd>
              </div>
              <div>
                <dt className="mb-1 leading-tight text-muted">{strings.cardControversy}</dt>
                <dd className="flex items-center">
                  <ControversyBadge severity={c.controversySeverity} />
                </dd>
              </div>
              <div>
                <dt className="mb-1 leading-tight text-muted">{strings.cardSocialMedia}</dt>
                <dd className="flex items-center">
                  <SocialReachBadge reach={c.socialReach} />
                </dd>
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
}: {
  candidates: Candidate[];
  sortKey: SortKey;
  sortDesc: boolean;
  onSort: (k: SortKey) => void;
  prefix: string;
  strings: Strings;
}) {
  function arrow(k: SortKey) {
    if (sortKey !== k) return null;
    return <span className="ml-1 inline-block">{sortDesc ? "▾" : "▴"}</span>;
  }
  const sortBtn = "uppercase tracking-wide hover:text-foreground";
  if (candidates.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted-bg/50 px-4 py-8 text-center text-sm text-muted">
        No candidates match the current filters.
      </p>
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
                  <span className="ml-2 align-middle">
                    <GovBadge />
                  </span>
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
