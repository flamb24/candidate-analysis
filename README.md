# Malta 2026 — District Candidate Comparison

A mobile-friendly webapp for browsing and comparing candidates contesting the
Malta General Election 2026, organised by district. Built from your district
research reports.

- **Master comparison view** with toggle between cards (mobile-friendly) and a
  sortable table.
- **Filter** by district, party, and tier.
- **Drill-down candidate profiles** with full alignment, track record,
  controversies (with sources), and social media data.
- **Per-district pages** with district context and the issue stance matrix.
- **Drop-in markdown reports** — add a new file to `reports/` and rebuild.

## Adding a new district

1. Drop the markdown file into `reports/`. The filename must contain the
   district number (e.g. `District11_Comparison_Tables_Tiered.md`).
2. The report must follow the same structure as the existing two: tier
   definitions, T1/T2/T3 tables 1–5, plus all-tier Tables 6–8.
3. Rebuild: `npm run build`.

The parser keys candidate data across tables by the candidate's bolded name. No
manual data entry is required.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
```

## Production build

```bash
npm run build
npm run start
```

All routes are statically prerendered at build time. There is no database, no
API, no runtime data fetching.

## Deployment

### Vercel (one-click)

```bash
npm install -g vercel
vercel       # follow prompts; accept defaults
vercel --prod
```

Or push to GitHub and import the repo at <https://vercel.com/new>. Each new
district added to `reports/` ships on the next deploy.

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --build --prod
```

Build command: `npm run build` · Publish directory: `.next`.

### GitHub Pages / pure-static host

Add `output: "export"` to `next.config.ts`, then:

```bash
npm run build
# Static HTML lands in ./out
```

Upload `./out` to any static host.

## Project structure

```
reports/                      ← drop new district .md files here
lib/
  types.ts                    ← shared data types
  parser.ts                   ← markdown → structured data
  data.ts                     ← cached loader; lists districts & candidates
components/
  Badges.tsx                  ← party/tier/star/severity/social/electability badges
  MasterComparison.tsx        ← filters + table/card view (client component)
  IssueMatrix.tsx             ← horizontal-scroll issue stance table
app/
  layout.tsx                  ← header/footer shell
  page.tsx                    ← home: all candidates across all districts
  district/[number]/page.tsx  ← per-district overview + issue matrix
  district/[number]/[slug]/page.tsx  ← candidate profile
```

## Notes

- Editorial assessments (tier, electability, ratings) come from the source
  reports — they are judgements, not predictions.
- Social-media URLs are taken as-is from the reports. Re-verify before
  publishing externally.
- The parser is conservative: rows labelled "None found" in the source are not
  rendered as controversies, but their severity is reflected in the candidate's
  overall severity badge.
