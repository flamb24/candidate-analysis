"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--cta)] flex items-center gap-3">
      <span className="inline-block w-5 h-px bg-[var(--cta)]" />
      {children}
    </p>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-muted-bg/40 p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

// ─── Candidate-not-party section ─────────────────────────────────────────────

const BALLOT_EXAMPLE = [
  { n: 1, name: "Candidate A",  party: "PN",     note: "Your true first choice" },
  { n: 2, name: "Candidate B",  party: "Labour",  note: "Best individual from another party" },
  { n: 3, name: "Candidate C",  party: "ADPD",    note: "Reform-minded smaller party" },
  { n: 4, name: "Candidate D",  party: "PN",      note: "Weak preference between remaining" },
];

const BALLOT_PARTY_CLS: Record<string, string> = {
  PN:     "bg-blue-50   text-blue-700",
  Labour: "bg-red-50    text-red-700",
  ADPD:   "bg-green-50  text-green-700",
};

const STRATEGY_TIPS = [
  "Give your 1 to the best individual candidate regardless of party — vote your conscience first",
  "Use 2, 3, 4 to support reform-minded or competent candidates from other parties, including ADPD and Momentum",
  "Use later numbers to express a weak preference between remaining candidates you find acceptable",
  "Leave bad actors unranked — an empty preference gives them nothing",
  "Candidates within the same party compete against each other for preferences — a sitting minister and a backbencher are rivals for the same pool of votes",
];

// ─── STV steps ───────────────────────────────────────────────────────────────

const STV_STEPS = [
  {
    n: 1,
    heading: "Number your preferences",
    body: "Write 1 next to your first choice, 2 next to your second, and so on. You don't have to rank every candidate — stop wherever you like.",
  },
  {
    n: 2,
    heading: "Your vote transfers",
    body: "If your first choice is eliminated or has already reached the quota, your vote moves to your next preference — at full or reduced value. No vote is wasted.",
  },
  {
    n: 3,
    heading: "Five seats per district",
    body: "You are electing five individual MPs, not just a party. Ranking candidates from different parties on the same ballot is entirely valid.",
  },
  {
    n: 4,
    heading: "Vote your true first preference",
    body: "The Single Transferable Vote is designed so that backing your genuine first choice never harms that candidate. Tactical voting is rarely necessary.",
  },
];

// ─── Competence / integrity items ────────────────────────────────────────────

const COMPETENCE = [
  "Specific, costed proposals",
  "Relevant expertise or professional track record",
  "History of following through on past commitments",
  "Willingness to answer direct, specific questions",
];

const INTEGRITY = [
  "Asset declarations consistent with known income",
  "Disclosed conflicts of interest on record",
  "Has publicly criticised own party when warranted",
  "No documented involvement in cronyism or patronage",
];

// ─── Red flags ───────────────────────────────────────────────────────────────

const RED_FLAGS = [
  {
    text: "Planning irregularities or documented benefit from ODZ development",
  },
  {
    text: "Opposition to transparency reform or suppression of public scrutiny",
  },
  {
    text: "Factually false campaign claims — verify at",
    link: { label: "FactCheck.mt", href: "https://factcheck.mt" },
  },
  {
    text: "AI-generated disinformation — this is Malta's first AI-era election",
  },
  {
    text: "Extremist or ethno-nationalist affiliation",
  },
];

// ─── Key issues ───────────────────────────────────────────────────────────────

const ISSUES = [
  {
    id: "economy",
    label: "Economy & wages",
    context:
      "Real-wage growth has lagged price increases since 2021. Cost-of-living relief measures have masked structural pressure on lower-income households. Fiscal surpluses have been large but unevenly distributed.",
    watchFor: "Vague promises without independent costing. Tax-cut pledges funded by unspecified borrowing.",
    lookFor: "Specific wage-floor proposals. Means-tested relief rather than blanket subsidies.",
  },
  {
    id: "governance",
    label: "Governance & rule of law",
    context:
      "Malta was greylisted by the FATF in 2021 and exited in 2022, but structural weaknesses in public procurement, judicial independence, and media freedom remain documented by the European Commission. Magisterial inquiries into political figures have stalled for years.",
    watchFor: "Candidates who voted against or publicly opposed transparency legislation while in office.",
    lookFor: "Concrete commitments to judicial independence and strengthening the Standards Commissioner's enforcement powers.",
  },
  {
    id: "planning",
    label: "Planning & environment",
    context:
      "Over-development and loss of open countryside have become electoral flashpoints. Planning Authority decisions continue to draw public controversy. Malta's ODZ (outside development zone) rules have been subject to repeated political override.",
    watchFor: "Candidates with direct or beneficial family interests in contested planning permits.",
    lookFor: "Support for independent planning oversight and binding environmental impact assessments.",
  },
  {
    id: "housing",
    label: "Housing",
    context:
      "Property prices and rents have risen faster than wages for a decade. The social housing stock is inadequate. Short-term rental platforms have reduced supply in urban areas.",
    watchFor: "Proposals that increase demand without addressing supply — these raise prices further.",
    lookFor: "Social housing targets with measurable timelines. Regulation of short-term rental stock.",
  },
  {
    id: "migration",
    label: "Population & migration",
    context:
      "Malta's population has grown rapidly through labour migration, straining infrastructure, housing, and public services. The public debate often conflates distinct issues: irregular arrivals, legal work permits, and long-term residency.",
    watchFor: "Rhetoric that scapegoats migrants for structural policy failures. Proposals that breach EU law.",
    lookFor: "Differentiated policy: workforce planning for legal migration, humane processing for asylum seekers.",
  },
];

// ─── Practical checklist ─────────────────────────────────────────────────────

const CHECKLIST = [
  {
    text: "Look up your electoral district and confirm your polling station at",
    link: { label: "electoral.gov.mt", href: "https://electoral.gov.mt" },
  },
  { text: "Watch or read coverage of district-level candidate debates" },
  { text: "Check incumbents' parliamentary voting record — it's public" },
  { text: "Verify viral content before sharing: screenshots lie, check primary sources" },
  {
    text: "Use later preferences (2, 3, 4…) for reform-minded candidates you'd otherwise leave blank",
  },
  { text: "Confirm your polling station address in the days before the election" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function VotingGuideContent() {
  const [openIssue, setOpenIssue] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2">
        <SectionLabel>Malta General Election · 30 May 2026</SectionLabel>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How to Vote</h1>
        <p className="text-base text-muted leading-relaxed max-w-lg">
          A non-partisan guide to casting your vote well on 30 May 2026.
        </p>
      </header>

      {/* ── Candidate not party ──────────────────────────────────────────── */}
      <section aria-labelledby="candidate-not-party-heading">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SectionLabel>How your vote works</SectionLabel>
            <h2 id="candidate-not-party-heading" className="text-xl font-bold tracking-tight">
              Your vote goes to the candidate — not the party
            </h2>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            In Malta's Single Transferable Vote system, your preference vote goes to an individual candidate, not to a party.
            You can rank candidates from different parties in any order — your ballot is fully valid and every preference counts.
          </p>

          {/* Example ballot */}
          <Card>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-4">
              Example of a valid cross-party ballot
            </p>
            <ol className="flex flex-col gap-2">
              {BALLOT_EXAMPLE.map((row) => (
                <li
                  key={row.n}
                  className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2.5"
                >
                  <span className="shrink-0 w-7 h-7 rounded border-2 border-[var(--cta)] flex items-center justify-center font-bold text-[var(--cta)] text-base leading-none">
                    {row.n}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{row.name}</span>
                    <span
                      className={`shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        BALLOT_PARTY_CLS[row.party] ?? "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {row.party}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted text-right hidden sm:block max-w-[12rem]">
                    {row.note}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted leading-relaxed border-t border-border pt-4">
              When your first-choice candidate is eliminated or already elected with surplus votes, your ballot transfers
              to your next preference — party affiliation is irrelevant to the transfer. Leave any candidate you consider
              a bad actor unranked — an unranked candidate receives nothing from you under any circumstances.
            </p>
          </Card>

          {/* Indirect party effect */}
          <div className="rounded-md border border-border bg-muted-bg/60 px-4 py-3 text-sm text-muted leading-relaxed">
            <span className="font-semibold text-foreground">One indirect party effect: </span>
            If a party wins a majority of first-preference votes nationally but still doesn't get a parliamentary
            majority, it receives bonus seats via a constitutional correction mechanism. Your first preference
            carries a faint party-level signal in this specific edge case — but it doesn't change how your vote
            is counted or transferred in the normal seat-allocation process.
          </div>

          {/* Strategic tips */}
          <Card>
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">
              Strategic use of your ranking
            </h3>
            <ul className="flex flex-col gap-2.5">
              {STRATEGY_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-[var(--cta)]/50"
                    aria-hidden
                  />
                  <span className="leading-relaxed text-muted">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ── How STV works ────────────────────────────────────────────────── */}
      <section aria-labelledby="stv-heading">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SectionLabel>The voting system</SectionLabel>
            <h2 id="stv-heading" className="text-xl font-bold tracking-tight">How the voting system works</h2>
          </div>
          <Card>
            <ol className="flex flex-col divide-y divide-border">
              {STV_STEPS.map((step) => (
                <li key={step.n} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="font-mono text-2xl font-bold text-[var(--cta)] leading-none w-6 shrink-0 mt-0.5">
                    {step.n}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-sm">{step.heading}</p>
                    <p className="text-sm text-muted leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>

      {/* ── What to look for ─────────────────────────────────────────────── */}
      <section aria-labelledby="signals-heading">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SectionLabel>Candidate evaluation</SectionLabel>
            <h2 id="signals-heading" className="text-xl font-bold tracking-tight">What to look for</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Competence */}
            <Card>
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">Competence signals</h3>
              <ul className="flex flex-col gap-2.5">
                {COMPETENCE.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <span className="text-emerald-600 text-[10px] font-bold leading-none">✓</span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            {/* Integrity */}
            <Card>
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-3">Integrity signals</h3>
              <ul className="flex flex-col gap-2.5">
                {INTEGRITY.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <span className="text-emerald-600 text-[10px] font-bold leading-none">✓</span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Red flags ────────────────────────────────────────────────────── */}
      <section aria-labelledby="flags-heading">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SectionLabel>Disqualifying behaviours</SectionLabel>
            <h2 id="flags-heading" className="text-xl font-bold tracking-tight">Red flags</h2>
          </div>
          <Card>
            <ul className="flex flex-col gap-3">
              {RED_FLAGS.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-red-500" aria-hidden />
                  <span className="leading-relaxed text-muted">
                    {flag.text}
                    {flag.link && (
                      <>
                        {" "}
                        <a
                          href={flag.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
                        >
                          {flag.link.label}
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ── Key issues ───────────────────────────────────────────────────── */}
      <section aria-labelledby="issues-heading">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SectionLabel>Context</SectionLabel>
            <h2 id="issues-heading" className="text-xl font-bold tracking-tight">Key issues</h2>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            {ISSUES.map((issue, idx) => {
              const isOpen = openIssue === issue.id;
              return (
                <div key={issue.id} className={idx > 0 ? "border-t border-border" : ""}>
                  <button
                    onClick={() => setOpenIssue(isOpen ? null : issue.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted-bg/60 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-sm">{issue.label}</span>
                    <span
                      className="shrink-0 font-mono text-lg text-muted leading-none transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 flex flex-col gap-3 border-t border-border bg-muted-bg/40">
                      <p className="text-sm text-muted leading-relaxed pt-4">{issue.context}</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2.5 text-sm">
                          <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-red-500" aria-hidden />
                          <span className="text-muted"><span className="font-medium text-foreground">Watch for:</span> {issue.watchFor}</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
                          <span className="text-muted"><span className="font-medium text-foreground">Look for:</span> {issue.lookFor}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Asset declarations ───────────────────────────────────────────── */}
      <section aria-labelledby="declarations-heading">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SectionLabel>Financial transparency</SectionLabel>
            <h2 id="declarations-heading" className="text-xl font-bold tracking-tight">Asset declarations</h2>
          </div>
          <Card>
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
              <p>
                MP asset declarations are technically public but are filed with the Speaker's office and are{" "}
                <strong className="text-foreground font-semibold">not available online</strong>.
                You must submit a formal request to access them.
              </p>
              <p>
                Ministerial declarations — which were publicly tabled for 30 years — were{" "}
                <strong className="text-foreground font-semibold">rolled back in 2025</strong>.
                The Standards Commissioner publicly objected to the change.
              </p>
              <p>
                The most accessible research route is investigative journalism.{" "}
                <a
                  href="https://timesofmalta.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
                >
                  Times of Malta
                </a>{" "}
                and{" "}
                <a
                  href="https://theshiftnews.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
                >
                  The Shift News
                </a>{" "}
                have documented asset-related controversies for individual politicians.
              </p>
              <p>
                Standards Commissioner:{" "}
                <a
                  href="https://standardscommissioner.mt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
                >
                  standardscommissioner.mt
                </a>
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Practical checklist ──────────────────────────────────────────── */}
      <section aria-labelledby="checklist-heading">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SectionLabel>Before polling day</SectionLabel>
            <h2 id="checklist-heading" className="text-xl font-bold tracking-tight">Practical checklist</h2>
          </div>
          <Card>
            <ul className="flex flex-col gap-3">
              {CHECKLIST.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded border border-border bg-background flex items-center justify-center" aria-hidden>
                    <span className="w-1.5 h-1.5 rounded-sm bg-border" />
                  </span>
                  <span className="leading-relaxed text-muted">
                    {item.text}
                    {item.link && (
                      <>
                        {" "}
                        <a
                          href={item.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
                        >
                          {item.link.label}
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ── Find your candidate CTA ──────────────────────────────────────── */}
      <section aria-label="Find your candidate">
        <div className="rounded-lg border border-border bg-muted-bg/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--cta)]">Ready?</p>
            <p className="font-bold text-lg tracking-tight">Find your candidate</p>
            <p className="text-sm text-muted">Browse every candidate in your district — track record, controversies, electability.</p>
          </div>
          <Link
            href="/districts"
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cta)] text-white px-5 py-3 font-serif font-bold text-sm -tracking-[0.005em] hover:-translate-y-px transition-all duration-150 shadow-[0_4px_20px_-4px_var(--cta)]"
          >
            Choose your district
            <span aria-hidden className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs">→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <p className="text-xs text-muted text-center border-t border-border pt-6">
        Data compiled from public sources. This guide is non-partisan and editorially independent.
      </p>

    </div>
  );
}
