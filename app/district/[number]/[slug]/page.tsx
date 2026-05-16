import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllDistricts, getCandidate } from "@/lib/data";
import {
  ControversyBadge,
  ElectabilityBadge,
  GovBadge,
  PartyBadge,
  SocialReachBadge,
  Stars,
  TierBadge,
} from "@/components/Badges";

export function generateStaticParams() {
  return getAllDistricts().flatMap((d) =>
    d.candidates.map((c) => ({
      number: String(d.number),
      slug: c.id.replace(/^\d+-/, ""),
    }))
  );
}

interface Props {
  params: Promise<{ number: string; slug: string }>;
}

export default async function CandidatePage({ params }: Props) {
  const { number, slug } = await params;
  const districtNum = parseInt(number, 10);
  const candidate = getCandidate(districtNum, slug);
  if (!candidate) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm">
        <Link
          href={`/district/${districtNum}`}
          className="text-muted hover:text-foreground hover:underline"
        >
          ← District {districtNum}
        </Link>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PartyBadge party={candidate.party} />
          <TierBadge tier={candidate.tier} />
          {candidate.isGovIncumbent && <GovBadge />}
          <span className="text-xs text-muted">District {candidate.district}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {candidate.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <ElectabilityBadge
            symbol={candidate.electabilitySymbol}
            label={candidate.electabilityLabel}
          />
          {candidate.ideology && (
            <span className="text-sm text-muted">{candidate.ideology}</span>
          )}
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted-bg/40 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            Track record
          </dt>
          <dd className="mt-1">
            <Stars count={candidate.trackRecordStars} />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            Controversy
          </dt>
          <dd className="mt-1">
            <ControversyBadge severity={candidate.controversySeverity} />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            Social media
          </dt>
          <dd className="mt-1">
            <SocialReachBadge reach={candidate.socialReach} />
          </dd>
        </div>
      </section>

      <Section title="Political alignment">
        <Field label="EU Group" value={candidate.euGroup} />
        <Field label="Ideological position" value={candidate.ideology} />
        <Field label="Intra-party standing" value={candidate.intraPartyStanding} />
        <Field label="Key issue focus" value={candidate.keyIssues} />
        <Field label="Abortion stance" value={candidate.abortionStance} />
      </Section>

      <Section title="Track record">
        <Field label="Prior office / role" value={candidate.priorOffice} />
        <Field
          label="Key documented achievement"
          value={candidate.achievement}
        />
        <Field
          label="Principle vs delivery gap"
          value={candidate.gap}
          muted
        />
      </Section>

      <Section title={`Controversies (${candidate.controversies.length})`}>
        {candidate.controversies.length === 0 ? (
          <p className="text-sm text-muted">
            No controversies documented in the source report.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {candidate.controversies.map((c, idx) => (
              <li
                key={idx}
                className="rounded-md border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="flex-1 text-sm leading-6">{c.description}</p>
                  <ControversyBadge severity={c.severity} />
                </div>
                {c.nature && (
                  <p className="mt-2 text-xs text-muted">
                    <span className="font-medium">Nature:</span> {c.nature}
                  </p>
                )}
                {c.sources.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs">
                    <span className="text-muted">Sources:</span>
                    {c.sources.map((s, i) => (
                      <span key={i}>
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            {s.text}
                          </a>
                        ) : (
                          <span className="text-muted">{s.text}</span>
                        )}
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Social media & campaign">
        <Field label="Approximate reach" value={candidate.approxReach} />
        <Field label="Campaign tone" value={candidate.campaignTone} />
        <Field label="Key campaign message" value={candidate.campaignMessage} />
        {candidate.socialLinks.length > 0 && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-wide text-muted">
              Platforms
            </dt>
            <dd className="flex flex-wrap gap-2">
              {candidate.socialLinks.map((l, i) => (
                <span key={i}>
                  {l.url ? (
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-sm hover:border-foreground/40 hover:text-accent"
                    >
                      {l.platform}
                      <span aria-hidden className="text-muted">↗</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-md border border-dashed border-border px-2.5 py-1 text-sm text-muted">
                      {l.platform}
                    </span>
                  )}
                </span>
              ))}
            </dd>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  muted,
}: {
  label: string;
  value?: string;
  muted?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd
        className={`mt-1 text-sm leading-6 ${muted ? "text-muted" : "text-foreground"}`}
      >
        {value}
      </dd>
    </div>
  );
}
