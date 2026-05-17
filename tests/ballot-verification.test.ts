/**
 * Ballot verification test
 *
 * Parses all 13 district reports and verifies that every candidate
 * on the official Electoral Commission ballot appears exactly once,
 * with the correct party, and no extras are present.
 *
 * Source of truth: tests/fixtures/official-ballot.md
 *
 * Name matching: the parser uses public/display names; where a candidate's
 * display name differs from the ballot, the parser sets `ballotName`.
 * We compare using `ballotName ?? name` against the official registration.
 */

import { describe, it, expect } from "vitest";
import { parseDistrict } from "../lib/parser";
import fs from "fs";
import path from "path";

const REPORTS_DIR = path.join(__dirname, "../reports");
const BALLOT_PATH = path.join(__dirname, "fixtures/official-ballot.md");

// Party label normalisation: ballot uses full Maltese names
const PARTY_MAP: Record<string, string> = {
  "Partit Laburista": "Labour",
  "Partit Nazzjonalista": "PN",
  "AD+PD": "ADPD",
  Momentum: "Momentum",
  "Aħwa Maltin": "Aħwa Maltin",
  "Imperium Europa": "Imperium Europa",
  Independent: "Independent",
};

interface OfficialCandidate {
  fullName: string; // "FirstName(s) Surname" form
  party: string;   // normalised to match parser output
}

/**
 * Parse the official ballot markdown into a per-district candidate list.
 * Table rows are: | Surname | Name | Party |
 */
function parseOfficialBallot(): Map<number, OfficialCandidate[]> {
  const content = fs.readFileSync(BALLOT_PATH, "utf-8");
  const result = new Map<number, OfficialCandidate[]>();

  let currentDistrict: number | null = null;
  let inTable = false;

  for (const line of content.split("\n")) {
    // Detect district heading: "## DISTRICT N" or "## DISTRICT 13 (GOZO)"
    const districtMatch = line.match(/^##\s+DISTRICT\s+(\d+)/);
    if (districtMatch) {
      currentDistrict = parseInt(districtMatch[1], 10);
      result.set(currentDistrict, []);
      inTable = false;
      continue;
    }

    // Stop collecting at the KNOWN DISCREPANCIES section
    if (line.startsWith("## KNOWN DISCREPANCIES") || line.startsWith("## SUMMARY")) {
      currentDistrict = null;
      continue;
    }

    if (!currentDistrict) continue;

    // Detect table header row (Surname | Name | Party)
    if (/Surname.*Name.*Party/.test(line)) {
      inTable = true;
      continue;
    }
    // Skip separator rows
    if (/^\|[-| ]+\|$/.test(line.trim())) continue;

    if (inTable && line.startsWith("|")) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      const [surname, firstNameRaw, partyRaw] = cells;
      if (!surname || !firstNameRaw || !partyRaw) continue;

      // Strip parentheticals from the Name column: "Paul (Paul-Anthony)" → "Paul"
      const firstName = firstNameRaw.replace(/\s*\([^)]*\)/g, "").trim();

      // Reconstruct as "FirstName Surname" (ballot order is Surname, Name)
      const fullName = `${firstName} ${surname}`;
      const party = PARTY_MAP[partyRaw] ?? partyRaw;
      result.get(currentDistrict)!.push({ fullName, party });
    } else if (inTable && !line.startsWith("|")) {
      inTable = false;
    }
  }

  return result;
}

/**
 * Canonical form for name comparison.
 * Handles the following known ballot vs. report differences:
 *   • "Mc Kay" (ballot) ↔ "McKay" (report): collapse "Mc " prefix
 *   • "John-Joseph" (ballotName) ↔ "John Joseph" (ballot): hyphens → spaces
 *   • "Manché" (report) ↔ "Manche'" (ballot): strip diacritics + apostrophes
 */
function canon(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // strip combining diacritics (é→e, etc.)
    .replace(/['']/g, "")              // remove apostrophes / right single quotes
    .replace(/-/g, " ")               // hyphens → spaces
    .replace(/\bMc\s+/g, "Mc")        // collapse "Mc Kay" → "McKay"
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const officialBallot = parseOfficialBallot();

describe("Ballot verification — all 13 districts", () => {
  for (let district = 1; district <= 13; district++) {
    describe(`District ${district}`, () => {
      const official = officialBallot.get(district)!;
      const md = fs.readFileSync(
        path.join(REPORTS_DIR, `District${district}_Comparison_Tables_Tiered.md`),
        "utf-8"
      );
      const parsed = parseDistrict(md, district);

      it(`has the correct candidate count (${official.length})`, () => {
        expect(parsed.candidates.length).toBe(official.length);
      });

      it("contains every official ballot candidate", () => {
        const parsedNames = new Set(
          parsed.candidates.map((c) => canon(c.ballotName ?? c.name))
        );

        const missing: string[] = [];
        for (const oc of official) {
          if (!parsedNames.has(canon(oc.fullName))) {
            missing.push(`${oc.fullName} (${oc.party})`);
          }
        }

        expect(missing, `Missing from report: ${missing.join(", ")}`).toEqual([]);
      });

      it("contains no candidates absent from the official ballot", () => {
        const officialNames = new Set(official.map((oc) => canon(oc.fullName)));

        const extra: string[] = [];
        for (const c of parsed.candidates) {
          const key = canon(c.ballotName ?? c.name);
          if (!officialNames.has(key)) {
            extra.push(`${c.name}${c.ballotName ? ` (ballot: ${c.ballotName})` : ""}`);
          }
        }

        expect(extra, `Not on official ballot: ${extra.join(", ")}`).toEqual([]);
      });

      it("assigns the correct party to every candidate", () => {
        const officialMap = new Map(
          official.map((oc) => [canon(oc.fullName), oc.party])
        );

        const mismatches: string[] = [];
        for (const c of parsed.candidates) {
          const key = canon(c.ballotName ?? c.name);
          const expectedParty = officialMap.get(key);
          if (expectedParty && c.party !== expectedParty) {
            mismatches.push(
              `${c.name}: got "${c.party}", expected "${expectedParty}"`
            );
          }
        }

        expect(mismatches, `Party mismatches: ${mismatches.join("; ")}`).toEqual([]);
      });
    });
  }
});
