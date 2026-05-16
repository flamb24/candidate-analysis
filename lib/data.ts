import fs from "node:fs";
import path from "node:path";
import { parseDistrict } from "./parser";
import type { Candidate, District } from "./types";

const REPORTS_DIR = path.join(process.cwd(), "reports");

let cached: District[] | null = null;

export function getAllDistricts(): District[] {
  if (cached) return cached;
  if (!fs.existsSync(REPORTS_DIR)) {
    cached = [];
    return cached;
  }
  const files = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".md"));
  const districts: District[] = [];
  for (const file of files) {
    const m = file.match(/District(\d+)/i);
    if (!m) continue;
    const num = parseInt(m[1], 10);
    const md = fs.readFileSync(path.join(REPORTS_DIR, file), "utf-8");
    try {
      districts.push(parseDistrict(md, num));
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
