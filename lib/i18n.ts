export type Lang = "en" | "mt";

const en = {
  // ── Header ──────────────────────────────────────────────────────────
  home: "Home",
  share: "Share",
  copied: "Copied!",
  highVis: "High vis",
  langSwitch: "MT",

  // ── Masthead ─────────────────────────────────────────────────────────
  tagline: "an independent voter guide",
  issueDate: "Vol. I · No. 1 · Saturday, 30 May 2026",

  // ── Hero ─────────────────────────────────────────────────────────────
  electionBrief: "The 2026 Election Brief",
  headlineLine1: "Vote like",
  headlineLine2Prefix: "you ",
  headlineLine2Bold: "know",
  headlineLine3: "them.",
  subhead:
    "Know who you’re really voting for. We break down every candidate in your district — their track record, documented controversies, and public stances on the issues that matter. Find out who’s here to represent you and who’s just making up the numbers.",
  inThisIssue: "In this issue",
  issueBlurb: (n: number) =>
    `A candidate-by-candidate read of the ${n} electoral districts — receipts, records, and reputations included.`,
  statCandidates: "Candidates",
  statDistricts: "Districts",
  statSeats: "Seats in parliament",
  statParties: "Political parties",
  onTheBallot: "On the ballot",
  pollsOpen: "Polls open",
  electionDateTime: "Saturday · 30 May 2026 · 07:00–22:00",
  scrollCueLabel: "The candidates",
  findYourCandidate: "Find your candidate",

  // ── Sources section ───────────────────────────────────────────────────
  sourcesSectionLabel: "Sources",
  sourcesHeading: "Built on journalism",
  sourcesCopy:
    "Every track record, controversy, and stance on this site traces back to reporting by Malta's journalists — people who show up every day to hold power to account. This guide exists because of their work.",

  // ── Landing district grid ─────────────────────────────────────────────
  electionLabel: "Malta General Election · 30 May 2026",
  electoralDistrictsTitle: (n: number) => `${n} electoral districts`,
  candidatesUnit: "candidates",
  notableUnit: "notable",
  secondTierUnit: "second-tier",
  fillersUnit: "fillers",

  // ── Districts page ────────────────────────────────────────────────────
  chooseYourDistrict: "Choose your district",
  allCandidatesTitle: "All candidates",
  viewAllCandidates: "View all candidates",

  // ── District page ──────────────────────────────────────────────────────
  backToDistricts: "← Districts",
  districtCandidates: "candidates",
  districtNotable: "notable",
  districtSecondTier: "second-tier",
  districtFillers: "list-fillers",
  districtContext: "District context",
  issueMatrixTitle: "Issue stance matrix",
  issueMatrixSubtext: (n: number) =>
    `Where each party stands across the issues most likely to drive votes in D${n}.`,

  // ── Candidate page ────────────────────────────────────────────────────
  backToDistrict: (n: number) => `← District ${n}`,
  districtLabel: "District",
  politicalAlignment: "Political alignment",
  trackRecordSection: "Track record",
  controversiesSection: (n: number) => `Controversies (${n})`,
  socialMediaSection: "Social media & campaign",
  interviewsSection: "Interviews & media",
  noControversies: "No controversies documented in the source report.",
  natureLabel: "Nature:",
  sourcesLabel: "Sources:",
  euGroupField: "EU Group",
  ideologicalPosition: "Ideological position",
  intraPartyStanding: "Intra-party standing",
  keyIssueFocus: "Key issue focus",
  abortionStance: "Abortion stance",
  priorOffice: "Prior office / role",
  keyAchievement: "Key documented achievement",
  principleGap: "Principle vs delivery gap",
  approxReach: "Approximate reach",
  campaignTone: "Campaign tone",
  campaignMessage: "Key campaign message",
  platforms: "Platforms",

  // ── Filter / search ───────────────────────────────────────────────────
  searchPlaceholder: "Search candidate name…",
  viewCards: "Cards",
  viewTable: "Table",
  filterDistrict: "DISTRICT",
  filterTier: "TIER",
  filterParty: "PARTY",
  candidatesCount: (n: number) => `${n} candidates`,

  // ── Tier labels ───────────────────────────────────────────────────────
  tierNotable: "Notable",
  tierSecondTier: "2nd tier",
  tierListFiller: "List-filler",

  // ── Gov badge ─────────────────────────────────────────────────────────
  govBadge: "Gov",

  // ── Card labels ───────────────────────────────────────────────────────
  cardTrackRecord: "Track record",
  cardControversy: "Controversy",
  cardSocialMedia: "Social media",

  // ── Interview formats ─────────────────────────────────────────────────
  watchLabel: "Watch",
  listenLabel: "Listen",
  readLabel: "Read",

  // ── Table column headers ──────────────────────────────────────────────
  colCandidate: "Candidate",
  colElectability: "Electability",

  // ── Footer ────────────────────────────────────────────────────────────
  footer:
    "Data compiled from public sources. Editorial assessments — not predictions.",
};

const mt: typeof en = {
  // ── Header ──────────────────────────────────────────────────────────
  home: "Dar",
  share: "Aqsam",
  copied: "Ikkupjat!",
  highVis: "ViŻibbiltà",
  langSwitch: "EN",

  // ── Masthead ─────────────────────────────────────────────────────────
  tagline: "gwida indipendenti tal-votant",
  issueDate: "Vol. I · Nru. 1 · Is-Sibt, 30 ta’ Mejju 2026",

  // ── Hero ─────────────────────────────────────────────────────────────
  electionBrief: "Il-Brief Elettorali 2026",
  headlineLine1: "Ivvota bħal",
  headlineLine2Prefix: "li ",
  headlineLine2Bold: "tafhom",
  headlineLine3: "verament.",
  subhead:
    "Kun af min verament qed tivvota. Nibrew kull kandidat fid-distrett tiegħek — ir-rekord tagħhom, il-kontroversji dokumentati, u l-feħmiejt tagħhom fuq il-kwistjonijiet li jimpurtaw. Sib min hu hawn biex jirrapreżentak u min hu sempliċement ikollu n-numri.",
  inThisIssue: "F’din il-ħarġa",
  issueBlurb: (n: number) =>
    `Qari kandidat b’kandidat tat-${n} distrett elettorali — riċevuti, rekords, u reputazzjonijiet inkluŻi.`,
  statCandidates: "Kandidati",
  statDistricts: "Distretti",
  statSeats: "Siġġijiet fil-Parlament",
  statParties: "Partiti Politiċi",
  onTheBallot: "Fuq il-Ballot",
  pollsOpen: "L-Urni Miftuħa",
  electionDateTime: "Is-Sibt · 30 ta’ Mejju 2026 · 07:00–22:00",
  scrollCueLabel: "Il-Kandidati",
  findYourCandidate: "Sib il-Kandidat Tiegħek",

  // ── Sources section ───────────────────────────────────────────────────
  sourcesSectionLabel: "Sorsi",
  sourcesHeading: "Mibnija fuq il-ġurnaliżmu",
  sourcesCopy:
    "Kull rekord, kontroversja, u pożizzjoni f’dan is-sit jirrisaltu lura għar-rapportar tal-ġurnalisti ta’ Malta — nies li jidhru kuljum biex iżommu s-setgħa responsabbli. Dan il-gwida jeżisti minħabba x-xogħol tagħhom.",

  // ── Landing district grid ─────────────────────────────────────────────
  electionLabel: "L-EleŻzjoni Ġenerali ta’ Malta · 30 ta’ Mejju 2026",
  electoralDistrictsTitle: (n: number) => `${n} distretti elettorali`,
  candidatesUnit: "kandidati",
  notableUnit: "notevoli",
  secondTierUnit: "tieni livell",
  fillersUnit: "mimlejn lista",

  // ── Districts page ────────────────────────────────────────────────────
  chooseYourDistrict: "Agħžel id-Distrett Tiegħek",
  allCandidatesTitle: "Il-Kandidati Kollha",
  viewAllCandidates: "Ara l-kandidati kollha",

  // ── District page ──────────────────────────────────────────────────────
  backToDistricts: "← Distretti",
  districtCandidates: "kandidati",
  districtNotable: "notevoli",
  districtSecondTier: "tieni livell",
  districtFillers: "mimlejn lista",
  districtContext: "Kuntest tad-Distrett",
  issueMatrixTitle: "Matriċi tal-PoŻizzjonijiet",
  issueMatrixSubtext: (n: number) =>
    `Fejn jinsab kull partit fuq l-issues li aktarx se jmexxu l-voti fid-D${n}.`,

  // ── Candidate page ────────────────────────────────────────────────────
  backToDistrict: (n: number) => `← Distrett ${n}`,
  districtLabel: "Distrett",
  politicalAlignment: "Allinjament Politiċu",
  trackRecordSection: "Rekord",
  controversiesSection: (n: number) => `Kontroversji (${n})`,
  socialMediaSection: "Midja Soċjali & Kampanja",
  interviewsSection: "Intervisti & Midja",
  noControversies: "L-ebda kontroversja dokumentata fir-rapport.",
  natureLabel: "Natura:",
  sourcesLabel: "Sorsi:",
  euGroupField: "Grupp UE",
  ideologicalPosition: "PoŻizzjoni Ideoloġika",
  intraPartyStanding: "PoŻizzjoni fil-Partit",
  keyIssueFocus: "Kwistjonijiet Ewlenin",
  abortionStance: "PoŻizzjoni fuq l-Abort",
  priorOffice: "Kariga Preċedenti / Rwol",
  keyAchievement: "Kisba Dokumentata Ewlenija",
  principleGap: "Differenza bejn il-Prinċipji u l-EŻekuzzjoni",
  approxReach: "Medda Approssimattiva",
  campaignTone: "Ton tal-Kampanja",
  campaignMessage: "Messaġġ Ewlieni tal-Kampanja",
  platforms: "Pjattaformi",

  // ── Filter / search ───────────────────────────────────────────────────
  searchPlaceholder: "Fittex isem il-kandidat…",
  viewCards: "Karti",
  viewTable: "Tabella",
  filterDistrict: "DISTRETT",
  filterTier: "LIVELL",
  filterParty: "PARTIT",
  candidatesCount: (n: number) => `${n} kandidati`,

  // ── Tier labels ───────────────────────────────────────────────────────
  tierNotable: "Notevoli",
  tierSecondTier: "Tieni Livell",
  tierListFiller: "Mimli Lista",

  // ── Gov badge ─────────────────────────────────────────────────────────
  govBadge: "Gvern",

  // ── Card labels ───────────────────────────────────────────────────────
  cardTrackRecord: "Rekord",
  cardControversy: "Kontroversja",
  cardSocialMedia: "Midja Soċjali",

  // ── Interview formats ─────────────────────────────────────────────────
  watchLabel: "Ara",
  listenLabel: "Isma’",
  readLabel: "Aqra",

  // ── Table column headers ──────────────────────────────────────────────
  colCandidate: "Kandidat",
  colElectability: "Elettabbiltà",

  // ── Footer ────────────────────────────────────────────────────────────
  footer:
    "Data miġbura minn sorsi pubbliċi. Valutazzjonijiet editorjali — mhux previŻjonijiet.",
};

export type T = typeof en;

const translations: Record<Lang, T> = { en, mt };

export function getT(lang: Lang): T {
  return translations[lang];
}
