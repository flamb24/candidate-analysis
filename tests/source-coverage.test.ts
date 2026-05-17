/**
 * Source coverage rule: every controversy entry that passes the parser filter
 * (i.e. is a real documented controversy, not a "no controversy" placeholder)
 * must have at least one source with a URL.
 *
 * This test runs as part of `npm test` and warns — it intentionally does NOT
 * hard-block the build, but any failures signal editorial debt that should be
 * resolved before the next deploy.
 */

import { describe, test, expect } from "vitest";
import { getAllDistricts } from "../lib/data";

describe("Source coverage — every real controversy must have at least one source link", () => {
  const districts = getAllDistricts();

  for (const district of districts) {
    for (const candidate of district.candidates) {
      for (const controversy of candidate.controversies) {
        const label = `D${district.number} · ${candidate.name} · "${controversy.description.slice(0, 60)}"`;

        test(label, () => {
          const hasLink = controversy.sources.some((s) => !!s.url);
          expect(
            hasLink,
            `Missing source URL — add a real link to the markdown report for this entry`,
          ).toBe(true);
        });
      }
    }
  }
});
