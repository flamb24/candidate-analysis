/**
 * scripts/generate-candidate-files.ts
 *
 * Auto-generates candidates/{slug}.md files by extracting canonical data from
 * the parsed district reports (reports/District*.md) — the same source as the
 * live app. For candidates who contest multiple districts the best data from
 * each appearance is merged (longest text wins, stars max, controversies unioned).
 *
 * Scope (default): Tier 1 + Tier 2 candidates appearing in 2+ districts.
 * Flags:
 *   --single      also include single-district candidates
 *   --tier3       also include Tier 3 (list-fillers)
 *   --force       overwrite files that already exist
 *   --dry-run     print what would be written, don't write
 *
 * Run: npx tsx scripts/generate-candidate-files.ts
 */

import { getAllDistricts, candidateSlug } from "@/lib/data";
import type { Candidate, Severity, SocialReach } from "@/lib/types";
import fs from "node:fs";
import path from "node:path";

const CANDIDATES_DIR = path.resolve(process.cwd(), "candidates");

const FORCE    = process.argv.includes("--force");
const DRY_RUN  = process.argv.includes("--dry-run");
const SINGLE   = process.argv.includes("--single");
const TIER3    = process.argv.includes("--tier3");

// ─── Serialization helpers ────────────────────────────────────────────────────

const SEV_MAP: Record<string, string> = {
  High:   "🔴 High",
  Medium: "🟡 Medium",
  Low:    "🟢 Low",
  None:   "🟢 None",
};

const REACH_MAP: Record<string, string> = {
  High:     "📢 High",
  Moderate: "📡 Moderate",
  Low:      "📶 Low",
  None:     "📵 None",
};

const SEV_ORDER:   Severity[]    = ["None", "Low", "Medium", "High"];
const REACH_ORDER: SocialReach[] = ["None", "Low", "Moderate", "High"];

function sevStr(s: Severity): string  { return SEV_MAP[s]   ?? "🟢 None"; }
function reachStr(r: SocialReach): string { return REACH_MAP[r] ?? "📵 None"; }
function starsStr(n: number): string  { return n > 0 ? "⭐".repeat(n) : "—"; }

function sourcesStr(sources: { text: string; url?: string }[]): string {
  if (!sources.length) return "—";
  return sources.map((s) => (s.url ? `[${s.text}](${s.url})` : s.text)).join(" · ");
}

function socialStr(links: { platform: string; url?: string }[]): string {
  if (!links.length) return "—";
  return links.map((l) => (l.url ? `[${l.platform}](${l.url})` : l.platform)).join(" · ");
}

function cell(s: string | undefined): string {
  const v = (s ?? "").trim();
  return v && v !== "—" ? v : "—";
}

// ─── Canonical merge ──────────────────────────────────────────────────────────

function longest(vals: (string | undefined)[]): string | undefined {
  const clean = vals.filter((v): v is string => !!v && !/^[—–-]$/.test(v.trim()));
  if (!clean.length) return undefined;
  return clean.reduce((best, v) => (v.length > best.length ? v : best), "");
}

function mergeCanonical(appearances: Candidate[]): Candidate {
  return {
    // identity from first appearance (district-scoped fields overridden per-district anyway)
    ...appearances[0],

    // metadata
    name:           appearances[0].name,
    party:          appearances.find((c) => c.party)?.party ?? "",
    isGovIncumbent: appearances.some((c) => c.isGovIncumbent),
    ballotName:     appearances.find((c) => c.ballotName)?.ballotName,

    // alignment — longest non-blank wins
    euGroup:            longest(appearances.map((c) => c.euGroup)),
    ideology:           longest(appearances.map((c) => c.ideology)),
    intraPartyStanding: longest(appearances.map((c) => c.intraPartyStanding)),
    keyIssues:          longest(appearances.map((c) => c.keyIssues)),
    abortionStance:     longest(appearances.map((c) => c.abortionStance)),

    // track record — longest text / max stars
    priorOffice: longest(appearances.map((c) => c.priorOffice)),
    achievement: longest(appearances.map((c) => c.achievement)),
    gap:         longest(appearances.map((c) => c.gap)),
    trackRecordStars: Math.max(0, ...appearances.map((c) => c.trackRecordStars)),

    // controversies — union, deduped by first 80 chars
    controversies: (() => {
      const seen = new Set<string>();
      const out: Candidate["controversies"] = [];
      for (const c of appearances) {
        for (const con of c.controversies) {
          const key = con.description.slice(0, 80).toLowerCase().trim();
          if (!seen.has(key)) { seen.add(key); out.push(con); }
        }
      }
      return out;
    })(),

    controversySeverity: appearances.reduce<Severity>(
      (best, c) =>
        SEV_ORDER.indexOf(c.controversySeverity) > SEV_ORDER.indexOf(best)
          ? c.controversySeverity
          : best,
      "None"
    ),

    // social — union links by URL, longest text fields, max reach
    socialLinks: (() => {
      const seen = new Set<string>();
      const out: Candidate["socialLinks"] = [];
      for (const c of appearances) {
        for (const sl of c.socialLinks) {
          const key = sl.url ?? sl.platform;
          if (!seen.has(key)) { seen.add(key); out.push(sl); }
        }
      }
      return out;
    })(),

    approxReach:     longest(appearances.map((c) => c.approxReach)),
    campaignTone:    longest(appearances.map((c) => c.campaignTone)),
    campaignMessage: longest(appearances.map((c) => c.campaignMessage)),

    socialReach: appearances.reduce<SocialReach>(
      (best, c) =>
        REACH_ORDER.indexOf(c.socialReach) > REACH_ORDER.indexOf(best)
          ? c.socialReach
          : best,
      "None"
    ),
  };
}

// ─── Markdown generation ──────────────────────────────────────────────────────

function generateMarkdown(c: Candidate, districts: number[]): string {
  const lines: string[] = [];

  // ── Header ──
  lines.push(`# ${c.name}`);
  lines.push(`<!-- party: ${c.party || "—"} -->`);
  lines.push(`<!-- gov-incumbent: ${c.isGovIncumbent} -->`);
  if (c.ballotName) lines.push(`<!-- ballot-name: ${c.ballotName} -->`);
  lines.push(`<!-- districts: ${districts.join(", ")} -->`);
  lines.push("");

  // ── Political Alignment ──
  lines.push("## Political Alignment");
  lines.push(
    "| EU Group | Ideological Position | Intra-Party Standing | Key Issues | Abortion Stance |"
  );
  lines.push(
    "|----------|---------------------|----------------------|------------|-----------------|"
  );
  lines.push(
    `| ${cell(c.euGroup)} | ${cell(c.ideology)} | ${cell(c.intraPartyStanding)} | ${cell(c.keyIssues)} | ${cell(c.abortionStance)} |`
  );
  lines.push("");

  // ── Track Record ──
  lines.push("## Track Record");
  lines.push("| Prior Office | Achievement | Gap | Rating |");
  lines.push("|--------------|-------------|-----|--------|");
  lines.push(
    `| ${cell(c.priorOffice)} | ${cell(c.achievement)} | ${cell(c.gap)} | ${starsStr(c.trackRecordStars)} |`
  );
  lines.push("");

  // ── Controversies ──
  lines.push("## Controversies");
  lines.push("| Controversy | Severity | Nature | Source |");
  lines.push("|-------------|----------|--------|--------|");
  if (c.controversies.length === 0) {
    lines.push("| No documented controversy | 🟢 None | — | — |");
  } else {
    for (const con of c.controversies) {
      lines.push(
        `| ${con.description} | ${sevStr(con.severity)} | ${cell(con.nature)} | ${sourcesStr(con.sources)} |`
      );
    }
  }
  lines.push("");

  // ── Social Media ──
  lines.push("## Social Media");
  lines.push(
    "| Platforms & Links | Approx. Reach | Campaign Tone | Key Campaign Message | Rating |"
  );
  lines.push(
    "|-------------------|---------------|---------------|---------------------|--------|"
  );
  lines.push(
    `| ${socialStr(c.socialLinks)} | ${cell(c.approxReach)} | ${cell(c.campaignTone)} | ${cell(c.campaignMessage)} | ${reachStr(c.socialReach)} |`
  );
  lines.push("");

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const allDistricts = getAllDistricts();

  // Build a map: normalised-slug → list of { candidate, districtNumber }
  const bySlug = new Map<string, Array<{ c: Candidate; d: number }>>();

  for (const district of allDistricts) {
    for (const candidate of district.candidates) {
      const slug = candidateSlug(candidate);
      const existing = bySlug.get(slug) ?? [];
      existing.push({ c: candidate, d: district.number });
      bySlug.set(slug, existing);
    }
  }

  const tierFilter = new Set(["Notable", "Second-tier", ...(TIER3 ? ["List-filler"] : [])]);

  let generated = 0;
  let skipped   = 0;
  let existing  = 0;

  for (const [slug, appearances] of bySlug) {
    const isMulti = appearances.length > 1;

    // Scope filter
    if (!isMulti && !SINGLE) continue;
    if (!appearances.some((a) => tierFilter.has(a.c.tier))) continue;

    const filePath = path.join(CANDIDATES_DIR, `${slug}.md`);

    if (fs.existsSync(filePath) && !FORCE) {
      existing++;
      continue;
    }

    const canonical = isMulti
      ? mergeCanonical(appearances.map((a) => a.c))
      : appearances[0].c;

    const districts = appearances.map((a) => a.d).sort((x, y) => x - y);
    const md = generateMarkdown(canonical, districts);

    if (DRY_RUN) {
      console.log(`\n── ${slug}.md (D${districts.join(", D")}) ──`);
      console.log(md);
    } else {
      fs.writeFileSync(filePath, md, "utf-8");
      console.log(`  ✓ ${slug}.md  (D${districts.join(", D")})`);
    }
    generated++;
  }

  console.log(
    `\n${DRY_RUN ? "[dry-run] " : ""}Generated: ${generated}` +
    (existing ? `  |  Skipped (already exist): ${existing}` : "") +
    (skipped  ? `  |  Filtered out: ${skipped}`              : "")
  );
}

main();
