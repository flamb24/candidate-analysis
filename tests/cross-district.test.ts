/**
 * Cross-district candidate tests
 *
 * Verifies that candidates who contest multiple districts:
 *   1. Are parsed in every district they contest (presence test)
 *   2. Have consistent core profile data across all their district entries
 *      (consistency test)
 *
 * Multi-district candidates are derived automatically from the official ballot —
 * any name that appears under more than one district heading is included.
 *
 * Excluded from consistency: `tier`, `electability*` — these legitimately differ
 * between a candidate's primary and secondary districts.
 *
 * Source of truth: tests/fixtures/official-ballot.md
 */

import { describe, it, expect } from "vitest";
import { getAllDistricts } from "../lib/data";
import type { Candidate } from "../lib/types";
import fs from "fs";
import path from "path";
import { readdirSync } from "fs";
import { join } from "path";

const BALLOT_PATH = path.join(__dirname, "fixtures/official-ballot.md");

// Slugs that have a canonical candidates/*.md file — their profile data lives
// in one place, so cross-district consistency is guaranteed structurally.
const CANDIDATES_DIR = join(process.cwd(), "candidates");
const hasCandidateFile = new Set(
  readdirSync(CANDIDATES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
);

// ─── Canonical name normalisation ─────────────────────────────────────────────
// Must stay in sync with ballot-verification.test.ts

function canon(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (é→e, etc.)
    .replace(/['']/g, "")            // remove apostrophes / right single quotes
    .replace(/-/g, " ")              // hyphens → spaces
    .replace(/\bMc\s+/g, "Mc")      // collapse "Mc Kay" → "McKay"
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Multi-district candidate discovery ───────────────────────────────────────

interface MultiDistrictCandidate {
  key: string;       // canonical form used for report lookup
  fullName: string;  // display form ("FirstName Surname")
  districts: number[];
}

function findMultiDistrictCandidates(): MultiDistrictCandidate[] {
  const content = fs.readFileSync(BALLOT_PATH, "utf-8");
  const map = new Map<string, { fullName: string; districts: number[] }>();

  let currentDistrict: number | null = null;
  let inTable = false;

  for (const line of content.split("\n")) {
    // Stop before the discrepancy / summary appendix sections
    if (
      line.startsWith("## KNOWN DISCREPANCIES") ||
      line.startsWith("## SUMMARY")
    ) {
      currentDistrict = null;
      continue;
    }

    const districtMatch = line.match(/^##\s+DISTRICT\s+(\d+)/);
    if (districtMatch) {
      currentDistrict = parseInt(districtMatch[1], 10);
      inTable = false;
      continue;
    }
    if (!currentDistrict) continue;

    if (/Surname.*Name.*Party/.test(line)) {
      inTable = true;
      continue;
    }
    if (/^\|[-| ]+\|$/.test(line.trim())) continue;

    if (inTable && line.startsWith("|")) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      const [surname, firstNameRaw] = cells;
      if (!surname || !firstNameRaw) continue;

      // Strip parentheticals from Name column: "Paul (Paul-Anthony)" → "Paul"
      const firstName = firstNameRaw.replace(/\s*\([^)]*\)/g, "").trim();
      const fullName = `${firstName} ${surname}`;
      const key = canon(fullName);

      const existing = map.get(key);
      if (existing) {
        if (!existing.districts.includes(currentDistrict)) {
          existing.districts.push(currentDistrict);
        }
      } else {
        map.set(key, { fullName, districts: [currentDistrict] });
      }
    } else if (inTable && !line.startsWith("|")) {
      inTable = false;
    }
  }

  return Array.from(map.entries())
    .filter(([, v]) => v.districts.length > 1)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

// ─── Parsed district map (with candidate-file overrides applied) ───────────────

const _districtMap = new Map(getAllDistricts().map((d) => [d.number, d]));

function findCandidate(districtNumber: number, key: string): Candidate | undefined {
  return _districtMap.get(districtNumber)?.candidates.find(
    (c) => canon(c.ballotName ?? c.name) === key
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Report a field mismatch: if ANY district has the field set to a non-default
 * value and the values across districts are not all equal, return a description
 * string. Returns null if the field is consistent.
 *
 * "—" (em/en dash) is treated as "not set" — same as the empty default.
 */
function checkStringField(
  fieldName: string,
  entries: { d: number; v: string }[],
  defaultValue = ""
): string | null {
  // Normalise em-dash / en-dash / bare hyphen placeholders to the default
  const norm = entries.map(({ d, v }) => ({
    d,
    v: /^[—–-]$/.test(v.trim()) ? defaultValue : v,
  }));
  const nonDefault = norm.filter(({ v }) => v !== defaultValue);
  if (nonDefault.length === 0) return null;
  const unique = [...new Set(norm.map(({ v }) => v))];
  if (unique.length === 1) return null; // all equal
  // Report using the original (un-normalised) values so the output is readable
  return `${fieldName}: ${entries.map(({ d, v }) => `D${d}="${v || "—"}"`).join(" | ")}`;
}

function checkNumericField(
  fieldName: string,
  entries: { d: number; v: number }[],
  defaultValue = 0
): string | null {
  const nonDefault = entries.filter(({ v }) => v !== defaultValue);
  if (nonDefault.length === 0) return null;
  const unique = [...new Set(entries.map(({ v }) => v))];
  if (unique.length === 1) return null;
  return `${fieldName}: ${entries.map(({ d, v }) => `D${d}=${v}`).join(" | ")}`;
}

// ─── Build the list ────────────────────────────────────────────────────────────

const multiDistrictList = findMultiDistrictCandidates();

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("Cross-district candidates", () => {
  /**
   * Test group 1: Presence
   * Every candidate listed under multiple districts in the official ballot
   * must appear in each of those districts' parsed candidate lists.
   */
  describe("Presence — each multi-district candidate appears in all their districts", () => {
    for (const candidate of multiDistrictList) {
      it(`${candidate.fullName} present in D${candidate.districts.join(", D")}`, () => {
        const missing: number[] = [];
        for (const d of candidate.districts) {
          if (!findCandidate(d, candidate.key)) missing.push(d);
        }
        expect(
          missing,
          `"${candidate.fullName}" not found in district(s): ${missing.join(", ")}`
        ).toEqual([]);
      });
    }
  });

  /**
   * Test group 2: Profile consistency
   * Core profile fields must be equal across all districts for the same
   * candidate. Tier and electability are intentionally excluded.
   *
   * Fields checked:
   *   - party              (hard: must always match)
   *   - isGovIncumbent     (hard: must always match)
   *   - ballotName         (if set in ANY district, must match in ALL)
   *   - trackRecordStars   (if non-zero in ANY district, must match in ALL)
   *   - controversySeverity (if non-"None" in ANY district, must match in ALL)
   *   - controversies count (if non-zero in ANY district, must match in ALL)
   *   - euGroup            (if set in ANY district, must match in ALL)
   *   - abortionStance     (if set in ANY district, must match in ALL)
   */
  describe("Profile consistency — core fields match across districts (tier and electability excluded)", () => {
    for (const candidate of multiDistrictList) {
      it(`${candidate.fullName} has consistent profile data`, () => {
        const entries = candidate.districts
          .map((d) => ({ d, c: findCandidate(d, candidate.key) }))
          .filter((e): e is { d: number; c: Candidate } => e.c !== undefined);

        // If the candidate is only found in one district (presence test handles
        // the missing-district case), there is nothing to compare.
        if (entries.length < 2) return;

        // Candidates with a canonical file have a single source of truth —
        // consistency is structurally guaranteed by the override merge.
        const slug = entries[0].c.id.replace(/^\d+-/, "");
        if (hasCandidateFile.has(slug)) return;

        const mismatches: string[] = [];

        // party — must always be equal
        const partyMismatch = checkStringField(
          "party",
          entries.map(({ d, c }) => ({ d, v: c.party }))
        );
        if (partyMismatch) mismatches.push(partyMismatch);

        // isGovIncumbent — must always be equal
        const govMismatch = checkStringField(
          "isGovIncumbent",
          entries.map(({ d, c }) => ({ d, v: String(c.isGovIncumbent) }))
        );
        if (govMismatch) mismatches.push(govMismatch);

        // ballotName — if set in any district, must be set and equal in all
        const ballotEntries = entries.map(({ d, c }) => ({ d, v: c.ballotName ?? "" }));
        const withBallotName = ballotEntries.filter(({ v }) => v !== "");
        if (withBallotName.length > 0) {
          const uniqueNames = [...new Set(withBallotName.map(({ v }) => v))];
          const missingIn = ballotEntries.filter(({ v }) => v === "");
          if (uniqueNames.length > 1) {
            mismatches.push(
              `ballotName (conflicting): ${ballotEntries.map(({ d, v }) => `D${d}="${v || "—"}"`).join(" | ")}`
            );
          } else if (missingIn.length > 0) {
            mismatches.push(
              `ballotName (missing in some districts): ` +
                ballotEntries.map(({ d, v }) => `D${d}="${v || "—"}"`).join(" | ")
            );
          }
        }

        // trackRecordStars — if non-zero in any, must agree across all
        const starsMismatch = checkNumericField(
          "trackRecordStars",
          entries.map(({ d, c }) => ({ d, v: c.trackRecordStars }))
        );
        if (starsMismatch) mismatches.push(starsMismatch);

        // controversySeverity — if non-"None" in any, all must agree
        const sevEntries = entries.map(({ d, c }) => ({ d, v: c.controversySeverity }));
        const sevMismatch = checkStringField("controversySeverity", sevEntries, "None");
        if (sevMismatch) mismatches.push(sevMismatch);

        // controversies count — if non-zero in any, all must agree
        const contMismatch = checkNumericField(
          "controversies count",
          entries.map(({ d, c }) => ({ d, v: c.controversies.length }))
        );
        if (contMismatch) mismatches.push(contMismatch);

        // euGroup — if set in any district, must be equal in all
        const euMismatch = checkStringField(
          "euGroup",
          entries.map(({ d, c }) => ({ d, v: c.euGroup ?? "" }))
        );
        if (euMismatch) mismatches.push(euMismatch);

        // abortionStance — if set in any district, must be equal in all
        const abortionMismatch = checkStringField(
          "abortionStance",
          entries.map(({ d, c }) => ({ d, v: c.abortionStance ?? "" }))
        );
        if (abortionMismatch) mismatches.push(abortionMismatch);

        expect(
          mismatches,
          `Profile inconsistencies for ${candidate.fullName}:\n  ${mismatches.join("\n  ")}`
        ).toEqual([]);
      });
    }
  });
});
