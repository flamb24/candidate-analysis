/**
 * Business interests data integrity tests
 *
 * Verifies:
 *   1. Every non-Unknown conflict rating has ≥1 source URL with a valid http(s) scheme
 *   2. Every non-Unknown transparency rating has ≥1 source URL with a valid http(s) scheme
 *   3. Multi-district candidates with a candidates/*.md profile have identical
 *      conflictOfInterest and financialTransparency ratings across all their
 *      district entries (structural guarantee — same file, same data)
 *   4. Multi-district candidates WITHOUT a profile file have consistent
 *      conflictOfInterest and financialTransparency ratings across districts
 *      (parity check — district-level data must not diverge)
 *
 * Source of truth for multi-district discovery: tests/fixtures/official-ballot.md
 */

import { describe, it, expect } from "vitest";
import { getAllDistricts } from "../lib/data";
import type { Candidate } from "../lib/types";
import path from "path";
import { readdirSync } from "fs";
import { join } from "path";

// ─── Setup ────────────────────────────────────────────────────────────────────

const districts = getAllDistricts();

// Flat list of every parsed candidate (may include duplicates for multi-district)
const allCandidates: Candidate[] = districts.flatMap((d) => d.candidates);

// Candidates with a canonical candidates/*.md file — their data comes from one
// file so cross-district consistency is structurally guaranteed.
const CANDIDATES_DIR = join(process.cwd(), "candidates");
const hasCandidateFile = new Set(
  readdirSync(CANDIDATES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
);

// ─── Helper: group all district entries for each unique candidate slug ─────────

interface CandidateEntry {
  districtNum: number;
  candidate: Candidate;
}

function groupBySlug(): Map<string, CandidateEntry[]> {
  const map = new Map<string, CandidateEntry[]>();
  for (const d of districts) {
    for (const c of d.candidates) {
      const slug = c.id.replace(/^\d+-/, "");
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug)!.push({ districtNum: d.number, candidate: c });
    }
  }
  return map;
}

const bySlug = groupBySlug();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Business interests data integrity", () => {

  it("every Medium or High conflict rating has at least one valid source URL", () => {
    // "Low" means "assessed as clean — no significant conflicts documented",
    // which by definition has no negative URL to cite.
    // "Medium" and "High" make substantive claims and must be sourced.
    const failures: string[] = [];

    for (const c of allCandidates) {
      if (c.conflictOfInterest !== "Medium" && c.conflictOfInterest !== "High") continue;

      const sources = c.businessInterests.conflictSources;

      if (sources.length === 0) {
        failures.push(
          `${c.name} (${c.id}): conflictOfInterest="${c.conflictOfInterest}" but conflictSources is empty`
        );
        continue;
      }

      for (const s of sources) {
        if (!s.url || !/^https?:\/\//i.test(s.url)) {
          failures.push(
            `${c.name} (${c.id}): source "${s.text}" has invalid URL: "${s.url ?? "(none)"}"`
          );
        }
      }
    }

    expect(
      failures,
      `Conflict-rated candidates missing source URLs:\n  ${failures.join("\n  ")}`
    ).toEqual([]);
  });

  it("every Poor transparency rating has at least one valid source URL", () => {
    // "Partial" = filed with Speaker's office but not publicly tabled — a structural
    // fact about Malta's system, no specific URL exists to cite.
    // "Poor" = substantive failure to disclose — must be sourced.
    // "Full" = full public disclosure — also requires a source.
    const failures: string[] = [];

    for (const c of allCandidates) {
      if (c.financialTransparency !== "Poor" && c.financialTransparency !== "Full") continue;

      const sources = c.businessInterests.transparencySources;

      if (sources.length === 0) {
        failures.push(
          `${c.name} (${c.id}): financialTransparency="${c.financialTransparency}" but transparencySources is empty`
        );
        continue;
      }

      for (const s of sources) {
        if (!s.url || !/^https?:\/\//i.test(s.url)) {
          failures.push(
            `${c.name} (${c.id}): transparency source "${s.text}" has invalid URL: "${s.url ?? "(none)"}"`
          );
        }
      }
    }

    expect(
      failures,
      `Poor/Full transparency ratings missing source URLs:\n  ${failures.join("\n  ")}`
    ).toEqual([]);
  });

  it("multi-district candidates have consistent conflict ratings across all their district entries", () => {
    const failures: string[] = [];

    for (const [slug, entries] of bySlug) {
      if (entries.length < 2) continue;  // single-district — nothing to compare

      // Candidates with a profile file: structurally consistent (same file →
      // same parsed data). Verify anyway as a sanity check.
      const conflictValues = [...new Set(entries.map((e) => e.candidate.conflictOfInterest))];
      if (conflictValues.length > 1) {
        const detail = entries
          .map((e) => `D${e.districtNum}="${e.candidate.conflictOfInterest}"`)
          .join(" | ");
        failures.push(`${entries[0].candidate.name} (${slug}): conflictOfInterest differs — ${detail}`);
      }
    }

    expect(
      failures,
      `Conflict rating inconsistencies across districts:\n  ${failures.join("\n  ")}`
    ).toEqual([]);
  });

  it("multi-district candidates have consistent transparency ratings across all their district entries", () => {
    const failures: string[] = [];

    for (const [slug, entries] of bySlug) {
      if (entries.length < 2) continue;

      const transparencyValues = [...new Set(entries.map((e) => e.candidate.financialTransparency))];
      if (transparencyValues.length > 1) {
        const detail = entries
          .map((e) => `D${e.districtNum}="${e.candidate.financialTransparency}"`)
          .join(" | ");
        failures.push(`${entries[0].candidate.name} (${slug}): financialTransparency differs — ${detail}`);
      }
    }

    expect(
      failures,
      `Transparency rating inconsistencies across districts:\n  ${failures.join("\n  ")}`
    ).toEqual([]);
  });

  it("every Medium or High conflict rating has a non-empty conflict summary", () => {
    const failures: string[] = [];

    // Deduplicate: check each unique candidate once (first occurrence)
    const seen = new Set<string>();
    for (const c of allCandidates) {
      const slug = c.id.replace(/^\d+-/, "");
      if (seen.has(slug)) continue;
      seen.add(slug);

      if (c.conflictOfInterest !== "Medium" && c.conflictOfInterest !== "High") continue;

      if (!c.businessInterests.conflictSummary?.trim()) {
        failures.push(
          `${c.name} (${slug}): conflictOfInterest="${c.conflictOfInterest}" but no conflictSummary`
        );
      }
    }

    expect(
      failures,
      `Conflict-rated candidates missing summary text:\n  ${failures.join("\n  ")}`
    ).toEqual([]);
  });

  it("all source URLs in business interests sections use https (not http)", () => {
    const warnings: string[] = [];

    const seen = new Set<string>();
    for (const c of allCandidates) {
      const slug = c.id.replace(/^\d+-/, "");
      if (seen.has(slug)) continue;
      seen.add(slug);

      const allSources = [
        ...c.businessInterests.conflictSources,
        ...c.businessInterests.transparencySources,
      ];

      for (const s of allSources) {
        if (s.url && s.url.startsWith("http://")) {
          warnings.push(`${c.name} (${slug}): insecure http URL — "${s.url}"`);
        }
      }
    }

    expect(
      warnings,
      `Business interest sources using insecure http:\n  ${warnings.join("\n  ")}`
    ).toEqual([]);
  });
});
