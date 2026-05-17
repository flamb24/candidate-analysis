/**
 * Live app data snapshot test
 *
 * Captures every field that CandidatePageContent and DistrictPageContent
 * actually render and freezes them as a Vitest snapshot.
 *
 * Purpose: verify that the candidate-centric architecture (candidates/*.md
 * files + stripped district T*_1-4 rows) produces a 1:1 data match with
 * what the app was serving before the architectural migration.
 *
 * To intentionally update the snapshot after a deliberate data change:
 *   node_modules/.bin/vitest run --update tests/live-app-match.test.ts
 */

import { describe, test, expect } from "vitest";
import { getAllDistricts } from "../lib/data";
import type { District, Candidate } from "../lib/types";

// ─── Normalise to only what the app actually renders ─────────────────────────

function normaliseCandidate(c: Candidate) {
  return {
    // Identity / header
    id:              c.id,
    district:        c.district,
    name:            c.name,
    ballotName:      c.ballotName ?? null,
    party:           c.party,
    tier:            c.tier,
    isGovIncumbent:  c.isGovIncumbent,

    // Electability badge (district-specific)
    electability:      c.electability,
    electabilitySymbol: c.electabilitySymbol,
    electabilityLabel:  c.electabilityLabel,
    alignmentSummary:   c.alignmentSummary ?? null,

    // Score summary row
    trackRecordStars:    c.trackRecordStars,
    controversySeverity: c.controversySeverity,
    socialReach:         c.socialReach,

    // Political alignment section
    euGroup:            c.euGroup            ?? null,
    ideology:           c.ideology           ?? null,
    intraPartyStanding: c.intraPartyStanding ?? null,
    keyIssues:          c.keyIssues          ?? null,
    abortionStance:     c.abortionStance     ?? null,

    // Track record section
    priorOffice: c.priorOffice ?? null,
    achievement: c.achievement ?? null,
    gap:         c.gap         ?? null,

    // Controversies section (full detail — app renders description, severity, nature, sources)
    controversies: c.controversies.map(con => ({
      description: con.description,
      severity:    con.severity,
      nature:      con.nature ?? null,
      sources:     con.sources.map(s => ({
        text: s.text,
        url:  s.url ?? null,
      })),
    })),

    // Social media section
    approxReach:     c.approxReach     ?? null,
    campaignTone:    c.campaignTone    ?? null,
    campaignMessage: c.campaignMessage ?? null,
    socialLinks: c.socialLinks.map(l => ({
      platform: l.platform,
      url:      l.url   ?? null,
      label:    l.label ?? null,
    })),

    // Business interests section
    conflictOfInterest:    c.conflictOfInterest,
    financialTransparency: c.financialTransparency,
    businessInterests: {
      conflictSummary:     c.businessInterests.conflictSummary     ?? null,
      conflictSources:     c.businessInterests.conflictSources.map(s => ({ text: s.text, url: s.url ?? null })),
      transparencySummary: c.businessInterests.transparencySummary ?? null,
      transparencySources: c.businessInterests.transparencySources.map(s => ({ text: s.text, url: s.url ?? null })),
    },
  };
}

function normaliseDistrict(d: District) {
  return {
    number:     d.number,
    title:      d.title,
    localities: d.localities,
    tierCounts: d.tierCounts,
    // Sort candidates by id so order doesn't matter
    candidates: [...d.candidates]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(normaliseCandidate),
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Live app data — 1:1 snapshot", () => {
  const districts = getAllDistricts();

  test("candidate count per district matches baseline", () => {
    const counts = Object.fromEntries(
      districts.map(d => [
        `D${d.number}`,
        { total: d.candidates.length, ...d.tierCounts },
      ])
    );
    expect(counts).toMatchSnapshot();
  });

  // One snapshot per district keeps diffs readable when a single district changes
  for (const d of districts) {
    test(`District ${d.number} candidate data matches baseline`, () => {
      expect(normaliseDistrict(d)).toMatchSnapshot();
    });
  }
});
