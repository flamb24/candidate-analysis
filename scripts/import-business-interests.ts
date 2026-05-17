/**
 * scripts/import-business-interests.ts
 *
 * Parses Business_Interests_Register.md and appends a "## Business Interests"
 * section to each matching candidates/*.md file.
 *
 * What is imported:
 *   - conflict-rating: mapped from the 🔴/🟡/🟢/⬜ emoji in the register
 *   - Conflict summary: the reason text from the "Conflict rating" row
 *   - Conflict sources: all source links from all table rows EXCEPT the asset
 *     declarations row (which is transparency-specific)
 *   - Transparency summary: text from the "Asset declarations filed" row
 *   - transparency-rating: always set to "Unknown" — requires manual editorial review
 *   - Transparency sources: links from the asset declarations row
 *
 * Flags:
 *   --dry-run       print what would be written without modifying files
 *   --no-overwrite  skip candidates that already have a ## Business Interests section
 *
 * Run: node_modules/.bin/tsx scripts/import-business-interests.ts [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";

const REGISTER_PATH = path.resolve(
  process.env.HOME ?? "",
  "Downloads/Business_Interests_Register.md"
);
const CANDIDATES_DIR = path.resolve(process.cwd(), "candidates");

const DRY_RUN     = process.argv.includes("--dry-run");
const NO_OVERWRITE = process.argv.includes("--no-overwrite");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "")
    .replace(/-/g, " ")
    .replace(/\bMc\s+/g, "Mc")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(name: string): string {
  return normalise(name).replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Extract all [text](url) links from a markdown cell string. */
function extractLinks(cell: string): { text: string; url: string }[] {
  const links: { text: string; url: string }[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cell)) !== null) {
    links.push({ text: m[1], url: m[2] });
  }
  return links;
}

/** Escape a string for use inside a markdown table cell. */
function escapeCell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** Convert collected source links to the "· " separated markdown format. */
function formatSources(links: { text: string; url: string }[]): string {
  if (links.length === 0) return "—";
  return links.map(l => `[${l.text}](${l.url})`).join(" · ");
}

// ─── Register parsing ─────────────────────────────────────────────────────────

interface RegisterEntry {
  name:          string;
  conflictEmoji: "🔴" | "🟡" | "🟢" | "⬜" | null;
  conflictReason: string;   // third cell of the conflict rating row
  conflictLinks:  { text: string; url: string }[];
  declarationText: string;  // detail cell of the asset declarations row
  declarationLinks: { text: string; url: string }[];
}

function parseRegister(content: string): RegisterEntry[] {
  const entries: RegisterEntry[] = [];
  const lines = content.split("\n");

  let currentName: string | null = null;
  let inTable = false;
  let entry: RegisterEntry | null = null;

  for (const line of lines) {
    // Stop at non-candidate sections
    if (/^##\s+(PN|INDEPENDENT|MOMENTUM|ADPD|AĦWA|IMPERIUM|ADDITIONAL|TIER [23])/i.test(line)) {
      // still want to continue parsing — these are just party headings
      currentName = null;
      inTable = false;
      entry = null;
      continue;
    }
    if (/^##\s+(?!.*CANDIDATES)/.test(line) && !/^###/.test(line)) {
      // top-level ## section that isn't a candidate
      currentName = null;
      inTable = false;
      entry = null;
      continue;
    }

    // Candidate heading: ### Name  (optionally: ### Name | D2, D8)
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      // save previous entry
      if (entry) entries.push(entry);
      // Strip " | D2, D8" style district annotations from register headings
      currentName = h3[1].replace(/\s*\|.*$/, "").trim();
      inTable = false;
      entry = {
        name: currentName,
        conflictEmoji: null,
        conflictReason: "",
        conflictLinks: [],
        declarationText: "",
        declarationLinks: [],
      };
      continue;
    }

    if (!entry) continue;

    // Detect table header row
    if (/Category.*Detail.*Sources/i.test(line)) {
      inTable = true;
      continue;
    }
    // Skip separator
    if (/^\|[-| ]+\|$/.test(line.trim())) continue;

    if (inTable && line.trim().startsWith("|")) {
      const cells = line.split("|").map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
      if (cells.length < 2) continue;

      const [cat, detail, sourcesCell = ""] = cells;
      const catClean = cat.replace(/\*\*/g, "").trim().toLowerCase();

      // Collect all links from this row
      const links = extractLinks(sourcesCell).concat(extractLinks(detail));

      if (catClean === "conflict rating") {
        // Detect emoji in detail cell
        if (detail.includes("🔴")) entry.conflictEmoji = "🔴";
        else if (detail.includes("🟡")) entry.conflictEmoji = "🟡";
        else if (detail.includes("🟢")) entry.conflictEmoji = "🟢";
        else entry.conflictEmoji = "⬜";

        // Reason is in sourcesCell (3rd column of the conflict rating row)
        entry.conflictReason = sourcesCell.replace(/^[🔴🟡🟢⬜\s]+/, "").trim();
        // Links from conflict row itself (if any in sourcesCell as markdown)
        entry.conflictLinks.push(...extractLinks(sourcesCell));
      } else if (catClean.startsWith("asset declaration")) {
        entry.declarationText = detail.trim();
        entry.declarationLinks.push(...links);
      } else {
        // All other rows: add links to conflictLinks
        entry.conflictLinks.push(...links);
      }
    } else if (inTable && !line.trim().startsWith("|")) {
      inTable = false;
    }
  }

  // Save last entry
  if (entry) entries.push(entry);

  return entries.filter(e => e.conflictEmoji !== null);
}

function mapConflictRating(emoji: "🔴" | "🟡" | "🟢" | "⬜" | null): string {
  if (emoji === "🔴") return "High";
  if (emoji === "🟡") return "Medium";
  if (emoji === "🟢") return "Low";
  return "Unknown";
}

// ─── Candidate file matching ──────────────────────────────────────────────────

function loadCandidateSlugs(): Map<string, string> {
  // Returns Map<normalised-name, slug>
  const map = new Map<string, string>();
  for (const f of fs.readdirSync(CANDIDATES_DIR).filter(f => f.endsWith(".md"))) {
    const slug = f.replace(/\.md$/, "");
    const content = fs.readFileSync(path.join(CANDIDATES_DIR, f), "utf-8");
    const h1 = content.match(/^#\s+(.+)/m);
    if (h1) {
      map.set(normalise(h1[1]), slug);
    } else {
      // fallback: derive name from slug
      map.set(normalise(slug.replace(/-/g, " ")), slug);
    }
  }
  return map;
}

// ─── Section builder ──────────────────────────────────────────────────────────

function buildSection(entry: RegisterEntry): string {
  const conflictRating = mapConflictRating(entry.conflictEmoji);

  // Deduplicate links by URL
  const seenConflict = new Set<string>();
  const uniqueConflict = entry.conflictLinks.filter(l => {
    if (seenConflict.has(l.url)) return false;
    seenConflict.add(l.url);
    return true;
  });

  const seenDecl = new Set<string>();
  const uniqueDecl = entry.declarationLinks.filter(l => {
    if (seenDecl.has(l.url)) return false;
    seenDecl.add(l.url);
    return true;
  });

  let section = `\n## Business Interests\n`;
  section += `<!-- conflict-rating: ${conflictRating} -->\n`;
  section += `<!-- transparency-rating: Unknown -->\n`;

  const hasConflict = entry.conflictReason.length > 0;
  const hasTransparency = entry.declarationText.length > 0;

  if (!hasConflict && !hasTransparency) {
    return section;
  }

  section += `| Type | Summary | Sources |\n`;
  section += `|------|---------|----------|\n`;

  if (hasConflict) {
    const summary = escapeCell(entry.conflictReason);
    const sources = formatSources(uniqueConflict);
    section += `| Conflict | ${summary} | ${escapeCell(sources)} |\n`;
  }

  if (hasTransparency) {
    const summary = escapeCell(entry.declarationText);
    const sources = formatSources(uniqueDecl);
    section += `| Transparency | ${summary} | ${escapeCell(sources)} |\n`;
  }

  return section;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(REGISTER_PATH)) {
    console.error(`Register file not found: ${REGISTER_PATH}`);
    process.exit(1);
  }

  const registerContent = fs.readFileSync(REGISTER_PATH, "utf-8");
  const entries = parseRegister(registerContent);
  console.log(`\nParsed ${entries.length} entries from register`);
  if (DRY_RUN) console.log("[dry-run mode — no files will be written]\n");

  const slugMap = loadCandidateSlugs();
  console.log(`${slugMap.size} candidate files found\n`);

  let matched = 0;
  let skipped = 0;
  let written = 0;
  const unmatched: string[] = [];

  for (const entry of entries) {
    // Try exact name match first, then slug-based match
    const key = normalise(entry.name);
    let slug = slugMap.get(key);

    if (!slug) {
      // Try partial match: first two words of name
      const parts = key.split(" ");
      if (parts.length >= 2) {
        const partial = `${parts[0]} ${parts[1]}`;
        for (const [k, v] of slugMap) {
          if (k.startsWith(partial)) { slug = v; break; }
        }
      }
    }

    if (!slug) {
      unmatched.push(entry.name);
      continue;
    }

    matched++;
    const filePath = path.join(CANDIDATES_DIR, `${slug}.md`);
    const content = fs.readFileSync(filePath, "utf-8");

    if (NO_OVERWRITE && content.includes("## Business Interests")) {
      skipped++;
      continue;
    }

    const section = buildSection(entry);
    const newContent = content.trimEnd() + "\n" + section;

    if (DRY_RUN) {
      console.log(`  [dry-run] Would update: ${slug}.md (conflict: ${mapConflictRating(entry.conflictEmoji)})`);
    } else {
      fs.writeFileSync(filePath, newContent, "utf-8");
      console.log(`  ✓ ${slug}.md — conflict: ${mapConflictRating(entry.conflictEmoji)}`);
      written++;
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`Matched:   ${matched} / ${entries.length}`);
  if (skipped > 0) console.log(`Skipped (already have section): ${skipped}`);
  console.log(`${DRY_RUN ? "[dry-run] Would write" : "Written"}: ${DRY_RUN ? matched - skipped : written}`);
  if (unmatched.length > 0) {
    console.log(`\nUnmatched (${unmatched.length}) — no candidates/*.md file found:`);
    unmatched.forEach(n => console.log(`  • ${n}`));
  }
}

main();
