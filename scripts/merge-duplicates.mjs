#!/usr/bin/env node
/**
 * merge-duplicates.mjs
 *
 * Replaces "See D[n] report" stubs in secondary-district markdown files
 * with actual data from the candidate's primary district file.
 *
 * Run from project root:  node scripts/merge-duplicates.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

// ─── candidate map ────────────────────────────────────────────────────────────
// Each entry: { name, secondaryDistrict, primaryDistrict }
const CANDIDATES = [
  { name: 'Jonathan Attard',       secondary: 12, primary: 4  },
  { name: 'Ian Borg',              secondary: 7,  primary: 6  },
  { name: 'Julia Farrugia',        secondary: 7,  primary: 5  },
  { name: 'Stephen Spiteri',       secondary: 3,  primary: 2  },
  { name: 'John Baptist Camilleri',secondary: 3,  primary: 2  },
  { name: 'Robert Abela',          secondary: 5,  primary: 2  },
  { name: 'Owen Bonnici',          secondary: 5,  primary: 3  },
  { name: 'Chris Fearne',          secondary: 4,  primary: 3  },
  { name: 'Bernice Bonello',       secondary: 4,  primary: 2  },
  { name: 'Byron Camilleri',       secondary: 4,  primary: 2  },
  { name: 'Andy Ellul',            secondary: 4,  primary: 3  },
  { name: 'Miriam Dalli',          secondary: 11, primary: 5  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function districtFile(n) {
  return path.join(REPORTS_DIR, `District${n}_Comparison_Tables_Tiered.md`);
}

/** Split markdown into lines, preserving line endings */
function readLines(filepath) {
  return fs.readFileSync(filepath, 'utf8').split('\n');
}

/** Return true if a line is a markdown table row (starts with |) */
function isTableRow(line) {
  return line.trimStart().startsWith('|');
}

/** Parse a markdown table row into an array of cell strings (trimmed, no outer pipes) */
function parseCells(line) {
  // Remove leading/trailing | and split
  const inner = line.replace(/^\s*\|/, '').replace(/\|?\s*$/, '');
  return inner.split('|').map(c => c.trim());
}

/** Serialise cells back to a table row, matching the column count */
function buildRow(cells) {
  return '| ' + cells.join(' | ') + ' |';
}

/**
 * Determine which "TABLE" section a line number belongs to.
 * Returns 'T2', 'T3', 'T4', or null.
 * We match section headers like:
 *   ## T1 — TABLE 2: TRACK RECORD
 *   ## T2 — TABLE 3: CONTROVERSIES
 * etc.  The tier prefix (T1/T2/T3) is the tier-level; the "TABLE N" is the table type.
 */
function buildSectionIndex(lines) {
  // Returns array of { startLine, tableType ('T2'|'T3'|'T4'), tierLabel }
  const sections = [];
  const TABLE_PATTERN = /##\s+T\d+\s+—\s+TABLE\s+(\d+)/i;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(TABLE_PATTERN);
    if (m) {
      sections.push({ startLine: i, tableNum: parseInt(m[1], 10) });
    }
  }
  return sections;
}

/**
 * Find the line index of a candidate's row in the given lines array,
 * starting search from `fromLine`, within tableNum table.
 * Candidate name is matched ignoring 🏛️ Gov. decorator.
 * Returns -1 if not found.
 */
function findCandidateRow(lines, candidateName, fromLine, toLine) {
  // Match bold name anywhere in cell, ignoring emoji/decorator suffix
  const escapedName = candidateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\*\\*${escapedName}\\*\\*`);
  for (let i = fromLine; i <= toLine && i < lines.length; i++) {
    if (isTableRow(lines[i]) && re.test(lines[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Given lines and a section start index, find the line range of the table
 * (from the header row after the section heading to the next blank line or next heading).
 * Returns { headerLine, dataStart, dataEnd } — all inclusive line indices.
 */
function getTableRange(lines, sectionStart) {
  // Find first table row (the header |---|...|)
  let headerLine = -1;
  let i = sectionStart + 1;
  while (i < lines.length && !lines[i].match(/^#+\s/)) {
    if (isTableRow(lines[i])) {
      headerLine = i;
      break;
    }
    i++;
  }
  if (headerLine === -1) return null;

  // dataStart is after the separator row
  let dataStart = headerLine + 2; // skip header + separator
  if (dataStart >= lines.length || !isTableRow(lines[dataStart - 1])) {
    dataStart = headerLine + 1;
  }

  // dataEnd: last consecutive table row
  let dataEnd = dataStart;
  while (dataEnd < lines.length && isTableRow(lines[dataEnd])) {
    dataEnd++;
  }
  dataEnd--; // last table row

  return { headerLine, dataStart, dataEnd };
}

/**
 * Find all sections for a given tableNum in the document.
 * Returns array of { sectionHeaderLine, range }.
 */
function findTableSections(lines, tableNum) {
  const TABLE_PATTERN = /##\s+T\d+\s+—\s+TABLE\s+(\d+)/i;
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(TABLE_PATTERN);
    if (m && parseInt(m[1], 10) === tableNum) {
      // Find the extent of this section (next heading at same or higher level)
      let end = i + 1;
      while (end < lines.length && !lines[end].match(/^##\s/)) {
        end++;
      }
      const range = getTableRange(lines, i);
      if (range) {
        results.push({ sectionHeaderLine: i, sectionEnd: end - 1, range });
      }
    }
  }
  return results;
}

/**
 * Search all TABLE N sections for a candidate's row.
 * Returns { sectionInfo, rowLine } or null.
 */
function findCandidateInTable(lines, tableNum, candidateName) {
  const sections = findTableSections(lines, tableNum);
  for (const sec of sections) {
    const rowLine = findCandidateRow(
      lines, candidateName, sec.range.dataStart, sec.range.dataEnd
    );
    if (rowLine !== -1) {
      return { sectionInfo: sec, rowLine };
    }
  }
  return null;
}

/** Check if a cell value contains a "See D" stub */
function isStub(cell) {
  return /See D\d+/i.test(cell);
}

// ─── per-table merge logic ────────────────────────────────────────────────────

/**
 * TABLE 2 (TRACK RECORD): cell-by-cell replacement.
 * Primary row columns (by index after splitting):
 *   0: Candidate name
 *   1: Prior Office/Role
 *   2: Key Documented Achievement
 *   3: Principle vs Delivery Gap
 *   4: Rating  ← do NOT overwrite
 *
 * Some T2/T3 tables have only 3 columns (Candidate | Role | Rating).
 * We skip those (primary always has 5 cols for notable candidates).
 */
function mergeTable2(secLines, secRowLine, primaryRow) {
  const secCells = parseCells(secLines[secRowLine]);
  const priCells = parseCells(primaryRow);

  let changed = false;
  const changes = [];

  // We'll align by position. If primary has more cols, use position mapping.
  // Cells 1...(n-1) are replaced if stub, EXCEPT last cell (Rating).
  const lastIdx = secCells.length - 1;
  for (let ci = 1; ci < lastIdx; ci++) {
    if (isStub(secCells[ci])) {
      const replacement = priCells[ci] !== undefined ? priCells[ci] : secCells[ci];
      if (replacement && replacement !== secCells[ci]) {
        changes.push(`  col ${ci}: "${secCells[ci]}" → "${replacement.substring(0, 60)}..."`);
        secCells[ci] = replacement;
        changed = true;
      }
    }
  }

  if (changed) {
    secLines[secRowLine] = buildRow(secCells);
  }
  return { changed, changes };
}

/**
 * TABLE 3 (CONTROVERSIES): replace the single stub row with ALL primary rows.
 * Returns modified lines array and change log.
 */
function mergeTable3(secLines, secRowLine, primaryRows) {
  const changes = [];
  // primaryRows is array of raw line strings from the primary file
  // Replace secLines[secRowLine] with all primaryRows
  const before = secLines[secRowLine];
  secLines.splice(secRowLine, 1, ...primaryRows);
  changes.push(`  Replaced 1 stub row with ${primaryRows.length} row(s) from primary`);
  changes.push(`  Stub was: "${before.substring(0, 80)}"`);
  return { changed: true, changes };
}

/**
 * TABLE 4 (SOCIAL MEDIA): cell-by-cell replacement.
 * Columns: Candidate | Facebook | Instagram | X/Twitter | Website | Reach | Tone | Key Message | Rating
 * Do NOT overwrite Rating (last col).
 */
function mergeTable4(secLines, secRowLine, primaryRow) {
  const secCells = parseCells(secLines[secRowLine]);
  const priCells = parseCells(primaryRow);

  let changed = false;
  const changes = [];

  const lastIdx = secCells.length - 1;
  for (let ci = 1; ci < lastIdx; ci++) {
    if (isStub(secCells[ci])) {
      const replacement = priCells[ci] !== undefined ? priCells[ci] : secCells[ci];
      if (replacement && replacement !== secCells[ci]) {
        changes.push(`  col ${ci}: "${secCells[ci]}" → "${replacement.substring(0, 60)}"`);
        secCells[ci] = replacement;
        changed = true;
      }
    }
  }

  if (changed) {
    secLines[secRowLine] = buildRow(secCells);
  }
  return { changed, changes };
}

// ─── main processing ──────────────────────────────────────────────────────────

const allChanges = [];

for (const candidate of CANDIDATES) {
  const { name, secondary, primary } = candidate;
  const secFile = districtFile(secondary);
  const priFile = districtFile(primary);

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Processing: ${name}  (D${secondary} secondary → D${primary} primary)`);

  if (!fs.existsSync(secFile)) {
    console.log(`  ⚠ Secondary file not found: ${secFile}`);
    continue;
  }
  if (!fs.existsSync(priFile)) {
    console.log(`  ⚠ Primary file not found: ${priFile}`);
    continue;
  }

  // Backup secondary file
  const bakFile = secFile + '.bak';
  if (!fs.existsSync(bakFile)) {
    fs.copyFileSync(secFile, bakFile);
    console.log(`  Backed up to ${path.basename(bakFile)}`);
  } else {
    console.log(`  Backup already exists, skipping backup`);
  }

  const secLines = readLines(secFile);
  const priLines = readLines(priFile);

  const candidateChanges = { name, secondary, primary, tables: [] };

  // ── TABLE 2 ──────────────────────────────────────────────────────────────
  const secT2 = findCandidateInTable(secLines, 2, name);
  const priT2 = findCandidateInTable(priLines, 2, name);

  if (!secT2) {
    console.log(`  ⚠ Candidate not found in D${secondary} TABLE 2`);
  } else if (!priT2) {
    console.log(`  ⚠ Candidate not found in D${primary} TABLE 2`);
  } else {
    const secRow = secLines[secT2.rowLine];
    // Check if there are any stubs
    const cells = parseCells(secRow);
    const hasStubs = cells.some(c => isStub(c));
    if (hasStubs) {
      const primaryRowStr = priLines[priT2.rowLine];
      const result = mergeTable2(secLines, secT2.rowLine, primaryRowStr);
      if (result.changed) {
        console.log(`  TABLE 2: ${result.changes.length} cell(s) replaced`);
        result.changes.forEach(c => console.log(`   ${c}`));
        candidateChanges.tables.push({ table: 2, changes: result.changes });
      }
    } else {
      console.log(`  TABLE 2: no stubs found — skipping`);
    }
  }

  // ── TABLE 3 ──────────────────────────────────────────────────────────────
  const secT3 = findCandidateInTable(secLines, 3, name);

  if (!secT3) {
    console.log(`  ⚠ Candidate not found in D${secondary} TABLE 3`);
  } else {
    const secRow = secLines[secT3.rowLine];
    if (isStub(secRow)) {
      // Find ALL rows for this candidate in primary TABLE 3
      const priT3Sections = findTableSections(priLines, 3);
      const priCandidateRows = [];
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\*\\*${escapedName}\\*\\*`);

      for (const sec of priT3Sections) {
        for (let li = sec.range.dataStart; li <= sec.range.dataEnd; li++) {
          if (isTableRow(priLines[li]) && re.test(priLines[li])) {
            priCandidateRows.push(priLines[li]);
          }
        }
      }

      if (priCandidateRows.length === 0) {
        console.log(`  ⚠ No TABLE 3 rows found for ${name} in D${primary}`);
      } else {
        // secLines is modified in place; rowLine may shift after this, but we
        // handle TABLE 4 by re-reading the updated lines
        const result = mergeTable3(secLines, secT3.rowLine, priCandidateRows);
        console.log(`  TABLE 3: ${result.changes.join('; ')}`);
        candidateChanges.tables.push({ table: 3, changes: result.changes });
      }
    } else {
      console.log(`  TABLE 3: no stub found — skipping`);
    }
  }

  // ── TABLE 4 ──────────────────────────────────────────────────────────────
  // Re-search after possible splice in TABLE 3
  const secT4 = findCandidateInTable(secLines, 4, name);
  const priT4 = findCandidateInTable(priLines, 4, name);

  if (!secT4) {
    // Some files don't have TABLE 4 for secondary-tier candidates — not an error
    console.log(`  TABLE 4: not found in D${secondary} — skipping`);
  } else if (!priT4) {
    console.log(`  TABLE 4: candidate not found in D${primary} TABLE 4 — skipping`);
  } else {
    const secRow = secLines[secT4.rowLine];
    const cells = parseCells(secRow);
    const hasStubs = cells.some(c => isStub(c));
    if (hasStubs) {
      const primaryRowStr = priLines[priT4.rowLine];
      const result = mergeTable4(secLines, secT4.rowLine, primaryRowStr);
      if (result.changed) {
        console.log(`  TABLE 4: ${result.changes.length} cell(s) replaced`);
        result.changes.forEach(c => console.log(`   ${c}`));
        candidateChanges.tables.push({ table: 4, changes: result.changes });
      }
    } else {
      console.log(`  TABLE 4: no stubs found — skipping`);
    }
  }

  // Write back secondary file if anything changed
  const anyChange = candidateChanges.tables.length > 0;
  if (anyChange) {
    fs.writeFileSync(secFile, secLines.join('\n'), 'utf8');
    console.log(`  ✓ Wrote changes to ${path.basename(secFile)}`);
    allChanges.push(candidateChanges);
  } else {
    console.log(`  No changes made for ${name}`);
  }
}

// ─── final summary ────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(70)}`);
console.log('SUMMARY');
console.log(`${'═'.repeat(70)}`);
if (allChanges.length === 0) {
  console.log('No changes made.');
} else {
  for (const c of allChanges) {
    console.log(`\n${c.name}  D${c.secondary} ← D${c.primary}`);
    for (const t of c.tables) {
      console.log(`  TABLE ${t.table}: ${t.changes.length} change(s)`);
      t.changes.forEach(ch => console.log(`    ${ch}`));
    }
  }
  console.log(`\nTotal candidates modified: ${allChanges.length}`);
}
