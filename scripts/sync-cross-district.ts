/**
 * scripts/sync-cross-district.ts
 *
 * Syncs profile data for candidates who contest multiple districts.
 * Rules:
 *   1. Track Record: highest star rating wins → propagated to all entries
 *   2. Controversies: union across all districts → missing rows added to T{tier}_3
 *   3. euGroup: if any district has it, propagate longest value to all entries
 *   4. abortionStance: longest value wins and propagates to all entries
 *   5. ballotName: if set in any district, add annotation to all entries
 *   6. isGovIncumbent: if true in any district, add 🏛️ Gov. to all entries
 *
 * When T{tier}_1 or T{tier}_3 tables don't exist in a district (abbreviated reports),
 * they are created automatically before T{tier}_5.
 *
 * Run: node_modules/.bin/tsx scripts/sync-cross-district.ts
 */

import { parseDistrict } from "@/lib/parser";
import type { Candidate, Controversy } from "@/lib/types";
import fs from "fs";
import path from "path";

const REPORTS_DIR = path.resolve(process.cwd(), "reports");
const BALLOT_PATH = path.resolve(process.cwd(), "tests/fixtures/official-ballot.md");

// ─── Canonical name form (same as tests) ──────────────────────────────────────

function canon(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "")
    .replace(/-/g, " ")
    .replace(/\bMc\s+/g, "Mc")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Multi-district candidate discovery ───────────────────────────────────────

interface BallotEntry {
  key: string;
  fullName: string;
  districts: number[];
}

function findMultiDistrictCandidates(): BallotEntry[] {
  const content = fs.readFileSync(BALLOT_PATH, "utf-8");
  const map = new Map<string, { fullName: string; districts: number[] }>();
  let currentDistrict: number | null = null;
  let inTable = false;

  for (const line of content.split("\n")) {
    if (line.startsWith("## KNOWN DISCREPANCIES") || line.startsWith("## SUMMARY")) {
      currentDistrict = null;
      continue;
    }
    const dm = line.match(/^##\s+DISTRICT\s+(\d+)/);
    if (dm) { currentDistrict = parseInt(dm[1], 10); inTable = false; continue; }
    if (!currentDistrict) continue;
    if (/Surname.*Name.*Party/.test(line)) { inTable = true; continue; }
    if (/^\|[-| ]+\|$/.test(line.trim())) continue;
    if (inTable && line.startsWith("|")) {
      const cells = line.split("|").map(c => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      const [surname, firstNameRaw] = cells;
      if (!surname || !firstNameRaw) continue;
      const firstName = firstNameRaw.replace(/\s*\([^)]*\)/g, "").trim();
      const fullName = `${firstName} ${surname}`;
      const key = canon(fullName);
      const ex = map.get(key);
      if (ex) {
        if (!ex.districts.includes(currentDistrict)) ex.districts.push(currentDistrict);
      } else {
        map.set(key, { fullName, districts: [currentDistrict] });
      }
    } else if (inTable && !line.startsWith("|")) {
      inTable = false;
    }
  }
  return Array.from(map.entries())
    .filter(([, v]) => v.districts.length > 1)
    .map(([key, v]) => ({ key, ...v }));
}

// ─── District loading ─────────────────────────────────────────────────────────

interface DistrictData {
  md: string;
  parsed: ReturnType<typeof parseDistrict>;
}

function loadAllDistricts(): Map<number, DistrictData> {
  const map = new Map<number, DistrictData>();
  for (let d = 1; d <= 13; d++) {
    const mdPath = path.join(REPORTS_DIR, `District${d}_Comparison_Tables_Tiered.md`);
    const md = fs.readFileSync(mdPath, "utf-8");
    map.set(d, { md, parsed: parseDistrict(md, d) });
  }
  return map;
}

function findCandidate(dist: ReturnType<typeof parseDistrict>, key: string): Candidate | undefined {
  return dist.candidates.find(c => canon(c.ballotName ?? c.name) === key);
}

// ─── Canonical value computation ──────────────────────────────────────────────

interface Canonical {
  maxStars: number;
  bestEuGroup: string;
  bestAbortionStance: string;
  isGovIncumbent: boolean;
  ballotName: string | undefined;
  allControversies: Controversy[];
}

function isBlank(v: string): boolean {
  return !v || /^[—–-]$/.test(v.trim());
}

function longest(vals: string[]): string {
  return vals.reduce((best, v) => v.length > best.length ? v : best, "");
}

function computeCanonical(entries: { d: number; c: Candidate }[]): Canonical {
  const maxStars = Math.max(0, ...entries.map(e => e.c.trackRecordStars));

  const euGroups = entries.map(e => e.c.euGroup ?? "").filter(v => !isBlank(v));
  const bestEuGroup = longest(euGroups);

  const abortionStances = entries.map(e => e.c.abortionStance ?? "").filter(v => !isBlank(v));
  const bestAbortionStance = longest(abortionStances);

  const isGovIncumbent = entries.some(e => e.c.isGovIncumbent);

  const ballotName = entries.find(e => e.c.ballotName)?.c.ballotName;

  // Union controversies, deduped by first 70 chars of description
  const seen = new Set<string>();
  const allControversies: Controversy[] = [];
  for (const { c } of entries) {
    for (const con of c.controversies) {
      const key = canon(con.description.slice(0, 70));
      if (!seen.has(key)) {
        seen.add(key);
        allControversies.push(con);
      }
    }
  }

  return { maxStars, bestEuGroup, bestAbortionStance, isGovIncumbent, ballotName, allControversies };
}

// ─── Table section finder ─────────────────────────────────────────────────────

interface TableSection {
  headingLine: number;
  headerLine: number;    // header row with column names
  firstDataLine: number; // first data row (after separator)
  lastDataLine: number;  // last data row (separator if empty)
  colCount: number;
}

/** Find a specific T{tier}_TABLE{num} section in the lines array. */
function findTableSection(
  lines: string[],
  tierNum: string,
  tableNum: string,
  headerPattern?: RegExp
): TableSection | null {
  const headingRe = new RegExp(`^##\\s+T${tierNum}\\s*[—-]\\s*TABLE\\s+${tableNum}\\b`);

  let headingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRe.test(lines[i])) { headingLine = i; break; }
  }
  if (headingLine < 0) return null;

  // Find first `|` row after the heading (= header row)
  let headerLine = -1;
  for (let i = headingLine + 1; i < Math.min(headingLine + 8, lines.length); i++) {
    if (lines[i].trim().startsWith("|")) {
      if (!headerPattern || headerPattern.test(lines[i])) {
        headerLine = i;
        break;
      }
    }
  }
  if (headerLine < 0) return null;

  const colCount = lines[headerLine].split("|").filter(Boolean).length;

  // separator is headerLine + 1; data starts at headerLine + 2
  const firstDataLine = headerLine + 2;
  // last data row: track until we hit a non-`|` non-blank line
  let lastDataLine = headerLine + 1; // default to separator
  for (let i = firstDataLine; i < lines.length; i++) {
    if (lines[i].trim().startsWith("|")) {
      lastDataLine = i;
    } else if (lines[i].trim() !== "") {
      break;
    }
  }

  return { headingLine, headerLine, firstDataLine, lastDataLine, colCount };
}

/**
 * Ensure T{tier}_TABLE{tableNum} exists; if it doesn't, create it before T{tier}_5.
 * Returns the section after creation (or the existing section).
 */
function ensureSection(
  lines: string[],
  tierNum: string,
  tableNum: string,
  columns: string[]
): TableSection | null {
  const existing = findTableSection(lines, tierNum, tableNum);
  if (existing) return existing;

  // Find T{tier}_5 to insert before it
  const t5Re = new RegExp(`^##\\s+T${tierNum}\\s*[—-]\\s*TABLE\\s+5\\b`);
  let insertAt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (t5Re.test(lines[i])) { insertAt = i; break; }
  }
  if (insertAt < 0) return null;

  const TITLES: Record<string, string> = {
    "1": "POLITICAL ALIGNMENT",
    "2": "TRACK RECORD",
    "3": "CONTROVERSIES",
  };
  const title = TITLES[tableNum] ?? `TABLE ${tableNum}`;
  const sep = `|${columns.map(() => "---").join("|")}|`;

  const newSection = [
    `## T${tierNum} — TABLE ${tableNum}: ${title}`,
    "",
    `| ${columns.join(" | ")} |`,
    sep,
    "---",
    "",
  ];
  lines.splice(insertAt, 0, ...newSection);
  return findTableSection(lines, tierNum, tableNum);
}

// ─── Row helpers ──────────────────────────────────────────────────────────────

/** Regex that matches a bold candidate name cell (T1–T4 table format). */
function nameRe(displayName: string): RegExp {
  const e = displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\*\\*${e}(?:\\*\\*|\\s|\\(|$)`);
}

/**
 * Matches a candidate name in a T_5 table row (unbolded second column).
 * T_5 format: | **TierLabel** | CandidateName [suffix] | Party | …
 */
function matchesT5(line: string, displayName: string): boolean {
  const parts = line.split("|");
  if (parts.length < 3) return false;
  const cell = parts[2].trim();
  // Strip govIncumbent and ballot-name annotation suffixes
  const baseName = cell
    .replace(/🏛️\s*Gov\.?/gi, "")
    .replace(/\*\(Official ballot name:[^)]*\)\*/g, "")
    .trim();
  return baseName === displayName;
}

/** Update a specific column (0-based from Candidate) in a table row. */
function updateRowCol(line: string, colIdx: number, newValue: string): string {
  const parts = line.split("|");
  // parts[0]="", parts[1]=Candidate, parts[2]=col0 (idx 0), ...
  const targetIdx = colIdx + 2;
  if (parts.length > targetIdx) {
    parts[targetIdx] = ` ${newValue} `;
    return parts.join("|");
  }
  return line;
}

/**
 * Update the second cell (column index 1 in the pipe-split) of a T_5 row.
 * Used for govIncumbent in T_5 where candidate is in col 2 (parts[2]).
 */
function updateT5CandidateCell(line: string, newValue: string): string {
  const parts = line.split("|");
  if (parts.length < 3) return line;
  parts[2] = ` ${newValue} `;
  return parts.join("|");
}

/** Get column index (0-based from Candidate) from a header row. */
function colIdx(headerLine: string, colName: string): number {
  const headers = headerLine.split("|").map(h => h.trim()).filter(Boolean);
  const i = headers.findIndex(h => h === colName);
  return i - 1; // -1 because headers[0] is Candidate (shift by 1 to get 0-based from Candidate)
}

/** Build the candidate cell for bold rows (T1–T4). */
function buildNameCell(c: Candidate, canonical: Canonical): string {
  let cell = `**${c.name}**`;
  const bn = c.ballotName ?? (canonical.ballotName && !c.ballotName ? canonical.ballotName : undefined);
  if (!c.ballotName && canonical.ballotName) {
    cell += ` *(Official ballot name: ${canonical.ballotName})*`;
  }
  if (!c.isGovIncumbent && canonical.isGovIncumbent) {
    cell += " 🏛️ Gov.";
  }
  return cell;
}

/** Build a new T{tier}_1 row for a candidate that has no existing T_1 entry. */
function buildNewT1Row(c: Candidate, canonical: Canonical, headerLine: string): string {
  const headers = headerLine.split("|").map(h => h.trim()).filter(Boolean);
  const nameCell = buildNameCell(c, canonical);
  const cells: string[] = [];
  for (const h of headers) {
    if (h === "Candidate") cells.push(nameCell);
    else if (h === "Party") cells.push(c.party || "—");
    else if (h === "EU Group") cells.push(canonical.bestEuGroup || "—");
    else if (h === "Abortion Stance") cells.push(canonical.bestAbortionStance || "—");
    else cells.push("—");
  }
  return `| ${cells.join(" | ")} |`;
}

// Controversy row reconstruction helpers
function sevText(s: string): string {
  const MAP: Record<string, string> = {
    High: "🔴 High", Medium: "🟡 Medium", Low: "🟢 Low", None: "🟢 None/Low"
  };
  return MAP[s] ?? "🟢 None/Low";
}

function srcText(srcs: {text: string; url?: string}[]): string {
  if (!srcs.length) return "—";
  return srcs.map(s => s.url ? `[${s.text}](${s.url})` : s.text).join(" · ");
}

function buildControvRow(
  displayName: string,
  isGov: boolean,
  ballotName: string | undefined,
  con: Controversy,
  colCount: number
): string {
  let nameCell = `**${displayName}**`;
  if (ballotName) nameCell += ` *(Official ballot name: ${ballotName})*`;
  if (isGov) nameCell += " 🏛️ Gov.";

  if (colCount >= 5) {
    return `| ${nameCell} | ${con.description} | ${sevText(con.severity)} | ${con.nature ?? "—"} | ${srcText(con.sources)} |`;
  } else {
    return `| ${nameCell} | ${con.description} | ${sevText(con.severity)} |`;
  }
}

// ─── Per-candidate patcher ────────────────────────────────────────────────────

const TIER_NUM: Record<string, string> = {
  "Notable": "1",
  "Second-tier": "2",
  "List-filler": "3",
};

function patchCandidate(
  lines: string[],
  c: Candidate,
  canonical: Canonical
): string[] {
  const log: string[] = [];
  const tierNum = TIER_NUM[c.tier] ?? "1";
  const nre = nameRe(c.name);

  // ── 1. Track Record Stars ───────────────────────────────────────────────────
  if (canonical.maxStars > 0 && c.trackRecordStars !== canonical.maxStars) {
    const newStars = "⭐".repeat(canonical.maxStars);

    // Update T{tier}_5 "Track Record" column (names are UNBOLDED in T_5)
    const sec5 = findTableSection(lines, tierNum, "5", /Candidate.*Party/);
    if (sec5) {
      const headers = lines[sec5.headerLine];
      const ci = colIdx(headers, "Track Record");
      if (ci >= 0) {
        for (let i = sec5.firstDataLine; i <= sec5.lastDataLine; i++) {
          const line = lines[i];
          if (!line.trim().startsWith("|")) continue;
          // T_5 rows have unbolded candidate names — use matchesT5
          if (nre.test(line) || matchesT5(line, c.name)) {
            const oldVal = line.split("|")[ci + 2]?.trim();
            if (oldVal !== newStars) {
              lines[i] = updateRowCol(line, ci, newStars);
              log.push(`stars T${tierNum}_5: "${c.name}" ${oldVal} → ${newStars}`);
            }
            break;
          }
        }
      }
    }

    // Also update T{tier}_2 "Rating" column if it exists (names ARE bold in T_2)
    const sec2 = findTableSection(lines, tierNum, "2", /Candidate.*Role|Candidate.*Prior|Candidate.*Rating/);
    if (sec2) {
      const headers = lines[sec2.headerLine];
      const ci = colIdx(headers, "Rating");
      if (ci >= 0) {
        for (let i = sec2.firstDataLine; i <= sec2.lastDataLine; i++) {
          if (nre.test(lines[i]) && lines[i].trim().startsWith("|")) {
            const oldVal = lines[i].split("|")[ci + 2]?.trim();
            if (oldVal !== newStars) {
              lines[i] = updateRowCol(lines[i], ci, newStars);
              log.push(`stars T${tierNum}_2 Rating: "${c.name}" ${oldVal} → ${newStars}`);
            }
            break;
          }
        }
      }
    }
  }

  // ── 2. euGroup + 3. abortionStance → T{tier}_1 ──────────────────────────────
  const needsEu = !!(canonical.bestEuGroup && (c.euGroup ?? "") !== canonical.bestEuGroup);
  const needsAb = !!(canonical.bestAbortionStance && (() => {
    const cur = c.abortionStance ?? "";
    return cur !== canonical.bestAbortionStance &&
           (isBlank(cur) || cur.length < canonical.bestAbortionStance.length);
  })());

  if (needsEu || needsAb) {
    let sec1 = findTableSection(lines, tierNum, "1", /Candidate.*Party/);

    if (!sec1) {
      // Create the T{tier}_1 section from scratch
      sec1 = ensureSection(lines, tierNum, "1",
        ["Candidate", "Party", "EU Group", "Abortion Stance"]);
    }

    if (sec1) {
      // Find existing row for this candidate
      let candidateRow = -1;
      for (let i = sec1.firstDataLine; i <= sec1.lastDataLine; i++) {
        if (nre.test(lines[i]) && lines[i].trim().startsWith("|")) {
          candidateRow = i;
          break;
        }
      }

      if (candidateRow >= 0) {
        // Row exists — update in-place
        const headers = lines[sec1.headerLine];
        if (needsEu) {
          const ci = colIdx(headers, "EU Group");
          if (ci >= 0) {
            const oldVal = lines[candidateRow].split("|")[ci + 2]?.trim();
            if (oldVal !== canonical.bestEuGroup) {
              lines[candidateRow] = updateRowCol(lines[candidateRow], ci, canonical.bestEuGroup);
              log.push(`euGroup T${tierNum}_1: "${c.name}" "${oldVal}" → "${canonical.bestEuGroup}"`);
            }
          }
        }
        if (needsAb) {
          const ci = colIdx(headers, "Abortion Stance");
          if (ci >= 0) {
            const oldVal = lines[candidateRow].split("|")[ci + 2]?.trim();
            if (oldVal !== canonical.bestAbortionStance) {
              lines[candidateRow] = updateRowCol(lines[candidateRow], ci, canonical.bestAbortionStance);
              log.push(`abortion T${tierNum}_1: "${c.name}" "${oldVal}" → "${canonical.bestAbortionStance}"`);
            }
          }
        }
      } else {
        // No row yet — insert a new one at end of section
        const newRow = buildNewT1Row(c, canonical, lines[sec1.headerLine]);
        // Insert after last data line (or at firstDataLine if table is empty)
        const insertAt = sec1.lastDataLine >= sec1.firstDataLine
          ? sec1.lastDataLine + 1
          : sec1.firstDataLine;
        lines.splice(insertAt, 0, newRow);
        log.push(`T${tierNum}_1: added row for "${c.name}" (eu="${canonical.bestEuGroup}", ab="${canonical.bestAbortionStance}")`);
      }
    }
  }

  // ── 4. isGovIncumbent ───────────────────────────────────────────────────────
  if (canonical.isGovIncumbent && !c.isGovIncumbent) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`**${c.name}**`) && !line.includes("🏛️")) {
        lines[i] = line.replace(
          new RegExp(`\\*\\*${c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*(?! 🏛️)`),
          `**${c.name}** 🏛️ Gov.`
        );
        log.push(`govIncumbent: "${c.name}" row ${i}`);
      }
      // Also handle unbolded name in T_5
      if (matchesT5(line, c.name) && !line.includes("🏛️") && line.trim().startsWith("|")) {
        const parts = line.split("|");
        parts[2] = ` ${parts[2].trim()} 🏛️ Gov. `;
        lines[i] = parts.join("|");
        log.push(`govIncumbent T${tierNum}_5: "${c.name}" row ${i}`);
      }
    }
  }

  // ── 5. ballotName annotation ────────────────────────────────────────────────
  if (canonical.ballotName && !c.ballotName) {
    const annotation = `*(Official ballot name: ${canonical.ballotName})*`;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`**${c.name}**`) &&
          !line.includes("Official ballot name") &&
          line.trim().startsWith("|")) {
        lines[i] = line.replace(
          `**${c.name}**`,
          `**${c.name}** ${annotation}`
        );
        log.push(`ballotName: "${c.name}" ← "${canonical.ballotName}"`);
        break;
      }
    }
  }

  // ── 6. Controversy union → T{tier}_3 ───────────────────────────────────────
  const missingControvs = canonical.allControversies.filter(
    con => !c.controversies.some(
      cc => canon(cc.description.slice(0, 70)) === canon(con.description.slice(0, 70))
    )
  );

  if (missingControvs.length > 0) {
    let sec3 = findTableSection(lines, tierNum, "3", /Candidate.*Controversy/);

    if (!sec3) {
      // Create the T{tier}_3 section
      sec3 = ensureSection(lines, tierNum, "3",
        ["Candidate", "Controversy", "Severity", "Nature", "Source"]);
    }

    if (sec3) {
      // Find last row belonging to this candidate (or default to end of table)
      let lastCandidateRow = -1;
      for (let i = sec3.firstDataLine; i <= sec3.lastDataLine; i++) {
        if (nre.test(lines[i]) && lines[i].trim().startsWith("|")) {
          lastCandidateRow = i;
        }
      }
      const insertAt = lastCandidateRow >= 0 ? lastCandidateRow + 1 : sec3.lastDataLine + 1;

      const effGov = c.isGovIncumbent || canonical.isGovIncumbent;
      const effBallot = c.ballotName ?? canonical.ballotName;
      const newRows = missingControvs.map(con =>
        buildControvRow(c.name, effGov, effBallot, con, sec3!.colCount)
      );

      lines.splice(insertAt, 0, ...newRows);
      log.push(`controversies T${tierNum}_3: +${newRows.length} row(s) for "${c.name}"`);

      // Re-find sec3 after splice (line numbers changed)
      const updatedSec3 = findTableSection(lines, tierNum, "3", /Candidate.*Controversy/);

      // Also update T{tier}_5 Controversy column with the new max severity
      const allSeverities = [...c.controversies, ...missingControvs].map(con => con.severity);
      const SORDER = ["None", "Low", "Medium", "High"];
      const maxSev = allSeverities.reduce(
        (best, s) => SORDER.indexOf(s) > SORDER.indexOf(best) ? s : best,
        "None"
      );
      const sevEmoji = sevText(maxSev).split(" ")[0];

      const sec5 = findTableSection(lines, tierNum, "5", /Candidate.*Party/);
      if (sec5) {
        const ci5 = colIdx(lines[sec5.headerLine], "Controversy");
        if (ci5 >= 0) {
          for (let i = sec5.firstDataLine; i <= sec5.lastDataLine; i++) {
            const line = lines[i];
            if (!line.trim().startsWith("|")) continue;
            if (nre.test(line) || matchesT5(line, c.name)) {
              const currentSevCell = line.split("|")[ci5 + 2]?.trim();
              const currentSevEmoji = currentSevCell?.split(" ")[0];
              const currentSevLevel = currentSevEmoji === "🔴" ? "High"
                : currentSevEmoji === "🟡" ? "Medium"
                : currentSevEmoji === "🟢" ? "Low" : "None";
              if (SORDER.indexOf(maxSev) > SORDER.indexOf(currentSevLevel)) {
                lines[i] = updateRowCol(line, ci5, sevEmoji);
                log.push(`controversy severity T${tierNum}_5: "${c.name}" → ${sevEmoji}`);
              }
              break;
            }
          }
        }
      }
    } else {
      log.push(`SKIP controversies for "${c.name}" in T${tierNum}_3 (no T${tierNum}_5 found to anchor)`);
    }
  }

  if (log.length > 0) {
    console.log(`    ${log.join("\n    ")}`);
  }

  return lines;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("Loading all 13 districts...");
  const allData = loadAllDistricts();

  console.log("Finding multi-district candidates from official ballot...");
  const multiCandidates = findMultiDistrictCandidates();
  console.log(`  ${multiCandidates.length} multi-district candidates found\n`);

  // Accumulated file state (start with original, accumulate patches)
  const fileMd = new Map<number, string>(
    Array.from(allData.entries()).map(([d, v]) => [d, v.md])
  );
  let totalFiles = 0;
  const changedDistricts = new Set<number>();

  for (const ballotEntry of multiCandidates) {
    // Collect parsed entries for all districts this candidate contests
    const entries = ballotEntry.districts
      .map(d => {
        const c = findCandidate(allData.get(d)!.parsed, ballotEntry.key);
        return c ? { d, c } : null;
      })
      .filter(Boolean) as { d: number; c: Candidate }[];

    if (entries.length < 2) continue;

    const canonical = computeCanonical(entries);

    // Check if anything needs changing at all
    const needsChange = entries.some(({ c }) => {
      if (canonical.maxStars > 0 && c.trackRecordStars !== canonical.maxStars) return true;
      if (canonical.bestEuGroup && (c.euGroup ?? "") !== canonical.bestEuGroup) return true;
      if (canonical.bestAbortionStance) {
        const cur = c.abortionStance ?? "";
        if (cur !== canonical.bestAbortionStance && (isBlank(cur) || cur.length < canonical.bestAbortionStance.length)) return true;
      }
      if (canonical.isGovIncumbent && !c.isGovIncumbent) return true;
      if (canonical.ballotName && !c.ballotName) return true;
      const missingCon = canonical.allControversies.filter(
        con => !c.controversies.some(
          cc => canon(cc.description.slice(0, 70)) === canon(con.description.slice(0, 70))
        )
      );
      if (missingCon.length > 0) return true;
      return false;
    });

    if (!needsChange) continue;

    console.log(`\n${ballotEntry.fullName} (D${ballotEntry.districts.join(", D")})`);

    for (const { d, c } of entries) {
      const lines = fileMd.get(d)!.split("\n");
      const before = lines.join("\n");
      const after = patchCandidate(lines, c, canonical);
      const afterStr = after.join("\n");
      if (afterStr !== before) {
        fileMd.set(d, afterStr);
        changedDistricts.add(d);
      }
    }
  }

  // Write all modified files
  for (const d of changedDistricts) {
    const mdPath = path.join(REPORTS_DIR, `District${d}_Comparison_Tables_Tiered.md`);
    fs.writeFileSync(mdPath, fileMd.get(d)!, "utf-8");
    console.log(`\nWrote District${d}_Comparison_Tables_Tiered.md`);
    totalFiles++;
  }

  console.log(`\n✓ Done — ${totalFiles} file(s) updated\n`);
}

main();
