import type {
  BusinessInterests,
  Candidate,
  ConflictSeverity,
  Controversy,
  District,
  ElectabilitySymbol,
  IssueMatrix,
  IssueRow,
  Severity,
  SocialLink,
  SocialReach,
  Tier,
  TransparencyRating,
} from "./types";

const SEP_REGEX = /^\s*\|?[\s:|\-]+\|[\s:|\-]+$/;

interface ParsedTable {
  headers: string[];
  rows: Record<string, string>[];
}

function stripBold(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "$1");
}

function bracketAwareSplit(s: string, delim: string): string[] {
  const out: string[] = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "[") depth++;
    else if (c === "]") depth = Math.max(0, depth - 1);
    else if (c === "(" && depth > 0) depth++;
    else if (c === ")" && depth > 0) depth = Math.max(0, depth - 1);
    if (c === delim && depth === 0) {
      out.push(current);
      current = "";
      continue;
    }
    current += c;
  }
  out.push(current);
  return out;
}

function parseRow(line: string): string[] {
  const stripped = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return bracketAwareSplit(stripped, "|").map((c) => c.trim());
}

function parseTableAt(lines: string[], start: number): ParsedTable | null {
  if (!lines[start]?.trim().startsWith("|")) return null;
  const headers = parseRow(lines[start]).map((h) => stripBold(h).trim());
  let i = start + 1;
  if (i >= lines.length || !SEP_REGEX.test(lines[i])) return null;
  i++;
  const rows: Record<string, string>[] = [];
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    const cells = parseRow(lines[i]);
    if (cells.length === 0) {
      i++;
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
    i++;
  }
  return { headers, rows };
}

function skipTable(lines: string[], start: number): number {
  let i = start;
  if (SEP_REGEX.test(lines[i + 1] ?? "")) i += 2;
  else i++;
  while (i < lines.length && lines[i].trim().startsWith("|")) i++;
  return i;
}

// Catch-all placeholder rows used in controversy/social tables (e.g. "All others", "All remaining")
const PLACEHOLDER_RE = /^all\b/i;

function cleanName(raw: string): { name: string; isGovIncumbent: boolean; ballotName?: string } {
  let s = stripBold(raw).trim();
  const isGov = /🏛️\s*Gov\./.test(s);

  // Extract *(Official ballot name: X)* annotation
  let ballotName: string | undefined;
  const ballotMatch = s.match(/\*\(Official ballot name:\s*([^)]+)\)\*/);
  if (ballotMatch) {
    ballotName = ballotMatch[1].trim();
    s = s.replace(ballotMatch[0], "").trim();
  }

  s = s
    .replace(/🏛️\s*Gov\.?/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { name: s, isGovIncumbent: isGov, ballotName };
}

export function normalizeKey(name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseStars(s: string): number {
  const m = s.match(/⭐/g);
  return m ? m.length : 0;
}

function parseSeverity(s: string): Severity {
  if (s.includes("🔴")) return "High";
  if (s.includes("🟡")) return "Medium";
  if (s.includes("🟢")) {
    if (/none/i.test(s)) return "None";
    if (/low/i.test(s)) return "Low";
    return "None";
  }
  return "None";
}

function parseSocialReach(s: string): SocialReach {
  if (s.includes("📢")) return "High";
  if (s.includes("📡")) return "Moderate";
  if (s.includes("📶")) return "Low";
  if (s.includes("📵")) return "None";
  return "None";
}

function parseConflictSeverity(s: string): ConflictSeverity {
  const v = s.trim().toLowerCase();
  if (v === "high")   return "High";
  if (v === "medium") return "Medium";
  if (v === "low")    return "Low";
  if (v === "none")   return "None";
  return "Unknown";
}

function parseTransparencyRating(s: string): TransparencyRating {
  const v = s.trim().toLowerCase();
  if (v === "full")    return "Full";
  if (v === "partial") return "Partial";
  if (v === "poor")    return "Poor";
  return "Unknown";
}

function parseElectability(s: string): { symbol: ElectabilitySymbol; label: string } {
  let symbol: ElectabilitySymbol = "✗";
  if (s.includes("✅✅✅")) symbol = "✅✅✅";
  else if (s.includes("✅✅")) symbol = "✅✅";
  else if (s.includes("✅")) symbol = "✅";
  const label = s.replace(/[✗✅]/g, "").trim();
  return { symbol, label };
}

function parseLinks(cell: string): { text: string; url?: string }[] {
  const out: { text: string; url?: string }[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cell)) !== null) {
    out.push({ text: m[1], url: m[2] });
  }
  return out;
}

function parseSocialLinks(cell: string): SocialLink[] {
  if (!cell || !cell.trim() || cell === "—") return [];
  const parts = bracketAwareSplit(cell, "·").map((p) => p.trim()).filter(Boolean);
  const links: SocialLink[] = [];
  for (const part of parts) {
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const label = part.replace(linkMatch[0], "").trim();
      links.push({
        platform: linkMatch[1],
        url: linkMatch[2],
        label: label || undefined,
      });
    } else {
      links.push({ platform: part });
    }
  }
  return links;
}

function getOrCreate(
  map: Map<string, Candidate>,
  key: string,
  name: string,
  district: number,
  tier: Tier
): Candidate {
  let c = map.get(key);
  if (c) return c;
  c = {
    id: `${district}-${slugify(name)}`,
    district,
    name,
    party: "",
    tier,
    isGovIncumbent: false,
    trackRecordStars: 0,
    controversies: [],
    controversySeverity: "None",
    socialLinks: [],
    socialReach: "None",
    conflictOfInterest:    "Unknown",
    financialTransparency: "Unknown",
    businessInterests:     { conflictSources: [], transparencySources: [] },
    electability: "",
    electabilitySymbol: "✗",
    electabilityLabel: "",
  };
  map.set(key, c);
  return c;
}

const SEVERITY_ORDER: Severity[] = ["None", "Low", "Medium", "High"];
function maxSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_ORDER.indexOf(a) >= SEVERITY_ORDER.indexOf(b) ? a : b;
}

function buildCandidates(
  tables: Record<string, ParsedTable>,
  districtNumber: number,
  overrides?: Map<string, Partial<Candidate>>
): Candidate[] {
  const map = new Map<string, Candidate>();
  const tierLabels: Record<string, Tier> = {
    "1": "Notable",
    "2": "Second-tier",
    "3": "List-filler",
  };

  for (const tierNum of ["1", "2", "3"]) {
    const tier = tierLabels[tierNum];

    const t1 = tables[`T${tierNum}_1`];
    if (t1) {
      for (const row of t1.rows) {
        const { name, isGovIncumbent, ballotName } = cleanName(row["Candidate"] ?? "");
        if (!name || PLACEHOLDER_RE.test(name)) continue;
        const key = normalizeKey(name);
        const c = getOrCreate(map, key, name, districtNumber, tier);
        c.isGovIncumbent = c.isGovIncumbent || isGovIncumbent;
        if (ballotName) c.ballotName = ballotName;
        c.party = stripBold(row["Party"] ?? "") || c.party;
        c.euGroup = row["EU Group"] || undefined;
        c.ideology = row["Ideological Position"] || undefined;
        c.intraPartyStanding = row["Intra-Party Standing"] || undefined;
        c.keyIssues = row["Key Issue Focus"] || undefined;
        c.abortionStance = row["Abortion Stance"] || undefined;
        c.tier = tier;
      }
    }

    const t2 = tables[`T${tierNum}_2`];
    if (t2) {
      for (const row of t2.rows) {
        const { name, isGovIncumbent, ballotName } = cleanName(row["Candidate"] ?? "");
        if (!name || PLACEHOLDER_RE.test(name)) continue;
        const key = normalizeKey(name);
        const c = getOrCreate(map, key, name, districtNumber, tier);
        c.isGovIncumbent = c.isGovIncumbent || isGovIncumbent;
        if (ballotName) c.ballotName = ballotName;
        c.priorOffice = row["Prior Office/Role"] || undefined;
        c.achievement = row["Key Documented Achievement"] || undefined;
        c.gap = row["Principle vs Delivery Gap"] || undefined;
        const stars = parseStars(row["Rating"] ?? "");
        if (stars > 0) c.trackRecordStars = stars;
      }
    }

    const t3 = tables[`T${tierNum}_3`];
    if (t3) {
      for (const row of t3.rows) {
        const { name, isGovIncumbent, ballotName } = cleanName(row["Candidate"] ?? "");
        if (!name || PLACEHOLDER_RE.test(name)) continue;
        const key = normalizeKey(name);
        const c = getOrCreate(map, key, name, districtNumber, tier);
        c.isGovIncumbent = c.isGovIncumbent || isGovIncumbent;
        if (ballotName) c.ballotName = ballotName;
        const desc = row["Controversy"] ?? "";
        const sev = parseSeverity(row["Severity"] ?? "");
        if (!/none found|no documented|no major documented|^—$|^$/i.test(desc.trim())) {
          const sources = parseLinks(row["Source"] ?? "");
          c.controversies.push({
            description: desc,
            severity: sev,
            nature: row["Nature"] || undefined,
            sources: sources.map((l) => ({ text: l.text, url: l.url })),
          });
        }
        c.controversySeverity = maxSeverity(c.controversySeverity, sev);
      }
    }

    const t4 = tables[`T${tierNum}_4`];
    if (t4) {
      for (const row of t4.rows) {
        const { name, isGovIncumbent, ballotName } = cleanName(row["Candidate"] ?? "");
        if (!name || PLACEHOLDER_RE.test(name)) continue;
        const key = normalizeKey(name);
        const c = getOrCreate(map, key, name, districtNumber, tier);
        c.isGovIncumbent = c.isGovIncumbent || isGovIncumbent;
        if (ballotName) c.ballotName = ballotName;
        const platformCell = row["Platforms & Links"] ?? "";
        const parsed = parseSocialLinks(platformCell);
        if (parsed.length > 0) c.socialLinks = parsed;
        c.approxReach = row["Approx. Reach"] || undefined;
        c.campaignTone = row["Campaign Tone"] || undefined;
        c.campaignMessage = row["Key Campaign Message"] || undefined;
        c.socialReach = parseSocialReach(row["Rating"] ?? "");
      }
    }

    const t5 = tables[`T${tierNum}_5`];
    if (t5) {
      for (const row of t5.rows) {
        const { name, isGovIncumbent, ballotName } = cleanName(row["Candidate"] ?? "");
        if (!name || PLACEHOLDER_RE.test(name)) continue;
        const key = normalizeKey(name);
        const c = getOrCreate(map, key, name, districtNumber, tier);
        c.isGovIncumbent = c.isGovIncumbent || isGovIncumbent;
        if (ballotName) c.ballotName = ballotName;
        // Party may only be available here for Tier 3 candidates (no Table 1)
        c.party = stripBold(row["Party"] ?? "") || c.party;
        const electCell = row["Electability"] ?? "";
        const { symbol, label } = parseElectability(electCell);
        c.electability = electCell;
        c.electabilitySymbol = symbol;
        c.electabilityLabel = label;
        c.alignmentSummary = row["Alignment"] || undefined;
        const sev = parseSeverity(row["Controversy"] ?? "");
        c.controversySeverity = maxSeverity(c.controversySeverity, sev);
        c.socialReach = parseSocialReach(row["Social Media"] ?? "") || c.socialReach;
        const stars = parseStars(row["Track Record"] ?? "");
        if (stars > 0) c.trackRecordStars = stars;
      }
    }
  }

  // Merge in additional social URLs from Table 8 if present
  const t8 = tables["TABLE_8"];
  if (t8) {
    for (const row of t8.rows) {
      const { name } = cleanName(row["Candidate"] ?? "");
      if (!name) continue;
      const key = normalizeKey(name);
      const c = map.get(key);
      if (!c) continue;
      const platforms = ["Facebook", "Instagram", "X / Twitter", "Website / Other"];
      for (const p of platforms) {
        const cell = row[p];
        if (!cell || cell === "—") continue;
        const linkMatch = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (!linkMatch) continue;
        const exists = c.socialLinks.some((sl) => sl.url === linkMatch[2]);
        if (!exists) {
          c.socialLinks.push({
            platform: p === "Website / Other" ? linkMatch[1] : p,
            url: linkMatch[2],
          });
        }
      }
    }
  }

  // Merge candidate-file overrides (profile data wins over district-file data)
  if (overrides) {
    for (const c of map.values()) {
      const override = overrides.get(normalizeKey(c.name));
      if (override) Object.assign(c, override);
    }
  }

  return Array.from(map.values());
}

function parseIssueMatrix(table?: ParsedTable): IssueMatrix | undefined {
  if (!table) return undefined;
  const partyHeaders = table.headers.slice(1);
  const issueHeader = table.headers[0];
  const rows: IssueRow[] = [];
  for (const row of table.rows) {
    const issue = stripBold(row[issueHeader] ?? "");
    const stances: Record<string, string> = {};
    for (const h of partyHeaders) {
      stances[h] = row[h] ?? "";
    }
    rows.push({ issue, stances });
  }
  return { partyHeaders, rows };
}

/**
 * Parse a per-candidate markdown file (candidates/{slug}.md) into a Partial<Candidate>.
 * Only the fields present in the file are populated; district-specific fields
 * (id, district, tier, electability, alignmentSummary) are intentionally excluded
 * so they remain sourced from the district report.
 */
export function parseCandidateFile(md: string, _slug: string): Partial<Candidate> {
  const lines = md.split("\n");
  const result: Partial<Candidate> = {};

  // H1 → canonical name
  const titleLine = lines.find((l) => l.startsWith("# "));
  if (titleLine) result.name = titleLine.replace(/^#\s+/, "").trim();

  // HTML comments for structured metadata
  for (const line of lines) {
    const partyMatch = line.match(/<!--\s*party:\s*(.+?)\s*-->/);
    if (partyMatch) result.party = partyMatch[1].trim();
    const govMatch = line.match(/<!--\s*gov-incumbent:\s*(true|false)\s*-->/i);
    if (govMatch) result.isGovIncumbent = govMatch[1].toLowerCase() === "true";
    const ballotMatch = line.match(/<!--\s*ballot-name:\s*(.+?)\s*-->/);
    if (ballotMatch) result.ballotName = ballotMatch[1].trim();
    const conflictMatch = line.match(/<!--\s*conflict-rating:\s*(.+?)\s*-->/);
    if (conflictMatch) result.conflictOfInterest = parseConflictSeverity(conflictMatch[1]);
    const transparencyMatch = line.match(/<!--\s*transparency-rating:\s*(.+?)\s*-->/);
    if (transparencyMatch) result.financialTransparency = parseTransparencyRating(transparencyMatch[1]);
  }

  // Section-level table parsing
  let currentSection: string | null = null;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      currentSection = h2[1].trim();
      i++;
      continue;
    }
    if (line.trim().startsWith("|") && currentSection) {
      const table = parseTableAt(lines, i);
      if (table) {
        switch (currentSection) {
          case "Political Alignment": {
            const r = table.rows[0];
            if (r) {
              result.euGroup = r["EU Group"] || undefined;
              result.ideology = r["Ideological Position"] || undefined;
              result.intraPartyStanding = r["Intra-Party Standing"] || undefined;
              result.keyIssues = r["Key Issues"] || undefined;
              result.abortionStance = r["Abortion Stance"] || undefined;
            }
            break;
          }
          case "Track Record": {
            const r = table.rows[0];
            if (r) {
              result.priorOffice = r["Prior Office"] || undefined;
              result.achievement = r["Achievement"] || undefined;
              result.gap = r["Gap"] || undefined;
              const stars = parseStars(r["Rating"] ?? "");
              if (stars > 0) result.trackRecordStars = stars;
            }
            break;
          }
          case "Controversies": {
            result.controversies = [];
            result.controversySeverity = "None";
            for (const r of table.rows) {
              const desc = r["Controversy"] ?? "";
              const sev = parseSeverity(r["Severity"] ?? "");
              if (!/none found|no documented|no major documented|^—$|^$/i.test(desc.trim())) {
                const sources = parseLinks(r["Source"] ?? "");
                result.controversies.push({
                  description: desc,
                  severity: sev,
                  nature: r["Nature"] || undefined,
                  sources: sources.map((l) => ({ text: l.text, url: l.url })),
                });
                result.controversySeverity = maxSeverity(
                  result.controversySeverity as Severity,
                  sev
                );
              }
            }
            break;
          }
          case "Social Media": {
            const r = table.rows[0];
            if (r) {
              const platformCell = r["Platforms & Links"] ?? "";
              const parsed = parseSocialLinks(platformCell);
              if (parsed.length > 0) result.socialLinks = parsed;
              result.approxReach = r["Approx. Reach"] || undefined;
              result.campaignTone = r["Campaign Tone"] || undefined;
              result.campaignMessage = r["Key Campaign Message"] || undefined;
              result.socialReach = parseSocialReach(r["Rating"] ?? "");
            }
            break;
          }
          case "Business Interests": {
            const bi: BusinessInterests = { conflictSources: [], transparencySources: [] };
            for (const r of table.rows) {
              const type = (r["Type"] ?? "").trim().toLowerCase();
              if (type === "conflict") {
                bi.conflictSummary = r["Summary"] || undefined;
                bi.conflictSources = parseLinks(r["Sources"] ?? "").map(l => ({ text: l.text, url: l.url }));
              } else if (type === "transparency") {
                bi.transparencySummary = r["Summary"] || undefined;
                bi.transparencySources = parseLinks(r["Sources"] ?? "").map(l => ({ text: l.text, url: l.url }));
              }
            }
            result.businessInterests = bi;
            break;
          }
        }
        i = skipTable(lines, i);
        currentSection = null;
        continue;
      }
    }
    i++;
  }

  return result;
}

export function parseDistrict(
  md: string,
  districtNumber: number,
  overrides?: Map<string, Partial<Candidate>>
): District {
  const lines = md.split("\n");
  const tables: Record<string, ParsedTable> = {};

  let currentKey: string | null = null;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const tierMatch = line.match(/^##\s+T([123])\s*[—-]\s*TABLE\s+(\d+)/);
    const allTierMatch = line.match(/^##\s+TABLE\s+(\d+)/);
    const tierDefMatch = line.match(/^##\s+TIER DEFINITIONS/);

    if (tierMatch) {
      currentKey = `T${tierMatch[1]}_${tierMatch[2]}`;
    } else if (allTierMatch) {
      currentKey = `TABLE_${allTierMatch[1]}`;
    } else if (tierDefMatch) {
      currentKey = "TIER_DEFS";
    } else if (line.startsWith("# ")) {
      currentKey = null;
    } else if (line.trim().startsWith("|") && currentKey) {
      const parsed = parseTableAt(lines, i);
      if (parsed) {
        tables[currentKey] = parsed;
        i = skipTable(lines, i);
        currentKey = null;
        continue;
      }
    }
    i++;
  }

  const candidates = buildCandidates(tables, districtNumber, overrides);

  const titleLine = lines.find((l) => l.startsWith("# ")) ?? "";
  const title = titleLine.replace(/^#\s+/, "").trim();
  const subtitleLine = lines.find((l) => /^\*\*Malta General Election/.test(l)) ?? "";
  const subtitle = subtitleLine.replace(/\*\*/g, "").trim();

  const introLines: string[] = [];
  for (const l of lines) {
    if (l.startsWith("## ") || l.startsWith("# TIER")) break;
    if (l.startsWith(">")) {
      introLines.push(l.replace(/^>\s?/, ""));
    }
  }
  const intro = introLines.join("\n").trim();

  // Extract locality list from two known formats:
  //   "District N covers: Loc1, Loc2, …"
  //   "District N covers the localities of **Loc1, Loc2, …**"
  const localitiesMatch = intro.match(
    /District\s+\d+\s+covers(?:\s+the\s+localities\s+of)?\s*:?\s*\*{0,2}([^*.\n]+)\*{0,2}/i
  );
  const localities = localitiesMatch ? localitiesMatch[1].trim() : "";

  const tierDefs = tables["TIER_DEFS"];
  const tierCounts = { Notable: 0, "Second-tier": 0, "List-filler": 0 };
  if (tierDefs) {
    for (const row of tierDefs.rows) {
      const tierName = stripBold(row["Tier"] ?? "").trim();
      const count = parseInt((row["Count"] ?? "").match(/\d+/)?.[0] ?? "0", 10);
      if (/^Notable/i.test(tierName)) tierCounts.Notable = count;
      else if (/Second-tier/i.test(tierName)) tierCounts["Second-tier"] = count;
      else if (/List-filler/i.test(tierName)) tierCounts["List-filler"] = count;
    }
  }
  // Fallback: derive counts from candidates if tier table missing
  if (tierCounts.Notable === 0 && tierCounts["Second-tier"] === 0 && tierCounts["List-filler"] === 0) {
    for (const c of candidates) {
      tierCounts[c.tier]++;
    }
  }

  const issueMatrix = parseIssueMatrix(tables["TABLE_6"]);

  return {
    number: districtNumber,
    title,
    subtitle,
    intro,
    localities,
    electionDate: "30 May 2026",
    candidates,
    tierCounts,
    issueMatrix,
  };
}
