import fs from "node:fs";
import path from "node:path";
import { parseDistrict, parseCandidateFile, normalizeKey } from "./parser";
import type { Candidate, CandidateAggregate, CandidateDistrictView, District } from "./types";

const REPORTS_DIR = path.join(process.cwd(), "reports");
const CANDIDATES_DIR = path.join(process.cwd(), "candidates");

let cached: District[] | null = null;

/** Load all per-candidate markdown overrides from candidates/*.md */
function loadCandidateOverrides(): Map<string, Partial<Candidate>> {
  const map = new Map<string, Partial<Candidate>>();
  if (!fs.existsSync(CANDIDATES_DIR)) return map;
  const files = fs.readdirSync(CANDIDATES_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const md = fs.readFileSync(path.join(CANDIDATES_DIR, file), "utf-8");
    try {
      const partial = parseCandidateFile(md, slug);
      const key = normalizeKey(partial.name ?? slug.replace(/-/g, " "));
      map.set(key, partial);
    } catch (e) {
      console.error(`Failed to parse candidates/${file}:`, e);
    }
  }
  return map;
}

export function getAllDistricts(): District[] {
  if (cached) return cached;
  if (!fs.existsSync(REPORTS_DIR)) {
    cached = [];
    return cached;
  }
  const overrides = loadCandidateOverrides();
  const files = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".md"));
  const districts: District[] = [];
  for (const file of files) {
    const m = file.match(/District(\d+)/i);
    if (!m) continue;
    const num = parseInt(m[1], 10);
    const md = fs.readFileSync(path.join(REPORTS_DIR, file), "utf-8");
    try {
      districts.push(parseDistrict(md, num, overrides));
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e);
    }
  }
  districts.sort((a, b) => a.number - b.number);
  cached = districts;
  return cached;
}

export function getDistrict(num: number): District | undefined {
  return getAllDistricts().find((d) => d.number === num);
}

export function getAllCandidates(): Candidate[] {
  return getAllDistricts().flatMap((d) => d.candidates);
}

export function getCandidate(district: number, slug: string): Candidate | undefined {
  const d = getDistrict(district);
  return d?.candidates.find((c) => c.id === `${district}-${slug}`);
}

export function candidateSlug(candidate: Candidate): string {
  return candidate.id.replace(/^\d+-/, "");
}

/**
 * Aggregate all district appearances of a candidate by slug and return a
 * CandidateAggregate — the full profile plus per-district electability views.
 * Returns undefined when no district contains the slug.
 */
export function getCandidateBySlug(slug: string): CandidateAggregate | undefined {
  const districts = getAllDistricts();
  const appearances: Array<{ candidate: Candidate; district: District }> = [];

  for (const d of districts) {
    const c = d.candidates.find((cand) => cand.id === `${d.number}-${slug}`);
    if (c) appearances.push({ candidate: c, district: d });
  }

  if (appearances.length === 0) return undefined;

  // Use the first appearance as the base profile (overrides have already been
  // merged in by buildCandidates, so all appearances share the same profile data)
  const base = appearances[0].candidate;

  const allDistrictViews: CandidateDistrictView[] = appearances.map(
    ({ candidate: c, district: d }) => ({
      district: d.number,
      tier: c.tier,
      electability: c.electability,
      electabilitySymbol: c.electabilitySymbol,
      electabilityLabel: c.electabilityLabel,
      alignmentSummary: c.alignmentSummary,
    })
  );

  return {
    ...base,
    canonicalSlug: slug,
    allDistricts: allDistrictViews,
  };
}
