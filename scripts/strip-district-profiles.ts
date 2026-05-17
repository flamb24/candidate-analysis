/**
 * scripts/strip-district-profiles.ts
 *
 * For every candidate who has a candidates/{slug}.md file, removes their rows
 * from T*_1, T*_2, T*_3, T*_4 in every district report file.
 * T*_5 (electability/summary) is NEVER touched — it is the district-specific source.
 * TABLE 6, 7, 8 and intro text are also never touched.
 *
 * If stripping leaves a table section with no data rows, the entire section
 * (heading + blank lines + header + separator) is removed.
 *
 * Flags:
 *   --dry-run   print what would change, don't write
 *
 * Run: node_modules/.bin/tsx scripts/strip-district-profiles.ts [--dry-run]
 */

import { parseDistrict } from "@/lib/parser";
import { candidateSlug } from "@/lib/data";
import type { Candidate } from "@/lib/types";
import fs from "node:fs";
import path from "node:path";

const REPORTS_DIR   = path.resolve(process.cwd(), "reports");
const CANDIDATES_DIR = path.resolve(process.cwd(), "candidates");
const DRY_RUN = process.argv.includes("--dry-run");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Escapes a candidate's display name for use in a regex. */
function nameRe(name: string): RegExp {
  const e = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\*\\*${e}(?:\\*\\*|\\s|\\(|$)`);
}

/**
 * Returns true if this line is a table data row (starts with |) and the
 * first pipe-cell matches the candidate's bold name pattern.
 */
function rowBelongsTo(line: string, re: RegExp): boolean {
  if (!line.trim().startsWith("|")) return false;
  const firstCell = line.split("|")[1] ?? "";
  return re.test(firstCell);
}

// ─── Section-level processing ─────────────────────────────────────────────────

interface Section {
  headingIdx: number;   // index of the ## heading line
  headerIdx: number;    // index of the | header | row
  sepIdx: number;       // index of the |---|---| separator row
  firstDataIdx: number; // index of first data row (= sepIdx + 1)
  lastDataIdx: number;  // index of last data row (inclusive; = sepIdx if empty)
}

/**
 * Find a T{tier}_TABLE{n} section (N ≠ 5) in a lines array.
 * Returns null if not found.
 */
function findSection(lines: string[], tierNum: string, tableNum: string): Section | null {
  const headingRe = new RegExp(
    `^##\\s+T${tierNum}\\s*[—\\-]\\s*TABLE\\s+${tableNum}\\b`,
    "i"
  );

  let headingIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRe.test(lines[i])) { headingIdx = i; break; }
  }
  if (headingIdx < 0) return null;

  // Find first | row after heading (= header)
  let headerIdx = -1;
  for (let i = headingIdx + 1; i < Math.min(headingIdx + 10, lines.length); i++) {
    if (lines[i].trim().startsWith("|")) { headerIdx = i; break; }
  }
  if (headerIdx < 0) return null;

  const sepIdx = headerIdx + 1;
  if (sepIdx >= lines.length || !lines[sepIdx].trim().startsWith("|")) return null;

  const firstDataIdx = sepIdx + 1;

  // Last data row: scan forward while lines start with |
  let lastDataIdx = sepIdx; // if no data rows, stays at sep
  for (let i = firstDataIdx; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith("|")) {
      lastDataIdx = i;
    } else if (t !== "") {
      break;
    }
  }

  return { headingIdx, headerIdx, sepIdx, firstDataIdx, lastDataIdx };
}

// ─── Per-district processing ──────────────────────────────────────────────────

function processDistrict(distNum: number, candidateFileSet: Set<string>): boolean {
  const mdPath = path.join(REPORTS_DIR, `District${distNum}_Comparison_Tables_Tiered.md`);
  if (!fs.existsSync(mdPath)) return false;

  const originalMd = fs.readFileSync(mdPath, "utf-8");
  const lines = originalMd.split("\n");

  // Parse to get candidate list (without overrides — we want raw district names)
  const parsed = parseDistrict(originalMd, distNum);

  // Build a map: nameRe → candidate (only for candidates with a file)
  type RemoveEntry = { re: RegExp; c: Candidate };
  const toRemove: RemoveEntry[] = [];
  for (const c of parsed.candidates) {
    const slug = candidateSlug(c);
    if (candidateFileSet.has(slug)) {
      toRemove.push({ re: nameRe(c.name), c });
    }
  }

  if (toRemove.length === 0) return false;

  // Work on a mutable copy; track whether we changed anything
  let changed = false;

  // Process each tier × tables 1–4
  for (const tierNum of ["1", "2", "3"]) {
    for (const tableNum of ["1", "2", "3", "4"]) {
      const sec = findSection(lines, tierNum, tableNum);
      if (!sec) continue;

      // Collect indices of rows to delete (reverse order so indices stay valid)
      const toDelete: number[] = [];
      for (let i = sec.firstDataIdx; i <= sec.lastDataIdx; i++) {
        if (!lines[i].trim().startsWith("|")) continue;
        for (const { re } of toRemove) {
          if (rowBelongsTo(lines[i], re)) {
            toDelete.push(i);
            break;
          }
        }
      }

      if (toDelete.length === 0) continue;
      changed = true;

      // Remove rows (highest index first so earlier indices stay valid)
      for (const idx of toDelete.reverse()) {
        lines.splice(idx, 1);
      }

      // Re-find the section after splicing (indices have shifted)
      const sec2 = findSection(lines, tierNum, tableNum);
      if (!sec2) continue;

      // Check if table is now empty (no data rows between sep and next non-blank)
      let hasDataRows = false;
      for (let i = sec2.sepIdx + 1; i < lines.length; i++) {
        const t = lines[i].trim();
        if (t.startsWith("|")) { hasDataRows = true; break; }
        if (t !== "") break;
      }

      if (!hasDataRows) {
        // Remove the entire section: heading, blank lines between it and the
        // header, header row, and separator row.
        // Find the extent: from headingIdx to sepIdx (inclusive), plus any
        // trailing blank lines immediately after the separator.
        let removeEnd = sec2.sepIdx;
        // Also remove any blank line immediately after the separator
        while (removeEnd + 1 < lines.length && lines[removeEnd + 1].trim() === "") {
          removeEnd++;
        }
        // Remove from headingIdx..removeEnd (inclusive), but also remove any
        // blank lines BEFORE the heading (up to the previous non-blank).
        let removeStart = sec2.headingIdx;
        // Eat blank lines preceding the heading
        while (removeStart > 0 && lines[removeStart - 1].trim() === "") {
          removeStart--;
        }
        lines.splice(removeStart, removeEnd - removeStart + 1);
      }
    }
  }

  if (!changed) return false;

  const newMd = lines.join("\n");
  if (newMd === originalMd) return false;

  if (DRY_RUN) {
    const removedLines = originalMd.split("\n").length - lines.length;
    console.log(`  [dry-run] District${distNum}: would remove ~${removedLines} lines`);
  } else {
    fs.writeFileSync(mdPath, newMd, "utf-8");
    const removedLines = originalMd.split("\n").length - lines.length;
    console.log(`  ✓ District${distNum}: removed ${removedLines} lines`);
  }

  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // Load set of candidate slugs that have files
  const candidateFileSet = new Set(
    fs.readdirSync(CANDIDATES_DIR)
      .filter((f) => f.endsWith(".md") && f !== ".gitkeep")
      .map((f) => f.replace(/\.md$/, ""))
  );

  console.log(`${candidateFileSet.size} candidate files found in candidates/`);
  if (DRY_RUN) console.log("[dry-run mode — no files will be written]\n");

  let totalChanged = 0;
  for (let d = 1; d <= 13; d++) {
    if (processDistrict(d, candidateFileSet)) totalChanged++;
  }

  console.log(`\n${DRY_RUN ? "[dry-run] " : ""}${totalChanged} district file(s) updated`);
}

main();
