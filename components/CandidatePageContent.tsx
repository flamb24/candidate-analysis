import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidate } from "@/lib/data";
import {
  ControversyBadge,
  ElectabilityBadge,
  GovBadge,
  PartyBadge,
  SocialReachBadge,
  Stars,
  TierBadge,
} from "@/components/Badges";
import { InterviewLinks } from "@/components/InterviewLinks";
import { getCandidateInterviews } from "@/lib/interviews";
import { getT } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export default function CandidatePageContent({
  districtNum,
  slug,
  lang,
}: {
  districtNum: number;
  slug: string;
  lang: Lang;
}) {
  const t = getT(lang);
  const candidate = getCandidate(districtNum, slug);
  if (!candidate) return notFound();

  const prefix = lang === "mt" ? "/mt" : "";

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-muted list-none p-0 m-0">
          <li>
            <Link href={`${prefix}/districts`} className="hover:text-foreground hover:underline">
              {t.districtsLabel}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`${prefix}/district/${districtNum}`} className="hover:text-foreground hover:underline">
              District {districtNum}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground font-medium truncate max-w-[16rem]" aria-current="page">
            {candidate.name}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PartyBadge party={candidate.party} />
          <TierBadge tier={candidate.tier} />
          {candidate.isGovIncumbent && <GovBadge />}
          <span className="text-xs text-muted">{t.districtLabel} {candidate.district}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {candidate.name}
        </h1>
        {candidate.ballotName && (
          <p className="text-sm text-muted -mt-1">Ballot name: {candidate.ballotName}</p>
        )}
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

      <InterviewLinks
        interviews={getCandidateInterviews(candidate.id)}
        lang={lang}
      />

      <section className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted-bg/40 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t.cardTrackRecord}
          </dt>
          <dd className="mt-1">
            <Stars count={candidate.trackRecordStars} />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t.cardControversy}
          </dt>
          <dd className="mt-1">
            <ControversyBadge severity={candidate.controversySeverity} />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t.cardSocialMedia}
          </dt>
          <dd className="mt-1">
            <SocialReachBadge reach={candidate.socialReach} />
          </dd>
        </div>
      </section>

      <Section title={t.politicalAlignment}>
        <Field label={t.euGroupField} value={candidate.euGroup} />
        <Field label={t.ideologicalPosition} value={candidate.ideology} />
        <Field label={t.intraPartyStanding} value={candidate.intraPartyStanding} />
        <Field label={t.keyIssueFocus} value={candidate.keyIssues} />
        <Field label={t.abortionStance} value={candidate.abortionStance} />
      </Section>

      <Section title={t.trackRecordSection}>
        <Field label={t.priorOffice} value={candidate.priorOffice} />
        <Field label={t.keyAchievement} value={candidate.achievement} />
        <Field label={t.principleGap} value={candidate.gap} muted />
      </Section>

      <Section title={t.controversiesSection(candidate.controversies.length)}>
        {candidate.controversies.length === 0 ? (
          <p className="text-sm text-muted">{t.noControversies}</p>
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
                    <span className="font-medium">{t.natureLabel}</span> {c.nature}
                  </p>
                )}
                {c.sources.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs">
                    <span className="text-muted">{t.sourcesLabel}</span>
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

      <Section title={t.socialMediaSection}>
        <Field label={t.approxReach} value={candidate.approxReach} />
        <Field label={t.campaignTone} value={candidate.campaignTone} />
        <Field label={t.campaignMessage} value={candidate.campaignMessage} />
        {candidate.socialLinks.length > 0 && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-wide text-muted">
              {t.platforms}
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
