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
  headlineLine1: "Who will",
  headlineLine2Prefix: "",
  headlineLine2Bold: "represent",
  headlineLine3: "you?",
  subhead:
    "Too many unknown names, not enough time to research them all. Distrett profiles every candidate — track record, controversies, electability — so you can cut through the noise and vote for someone who actually represents you.",
  inThisIssue: "Who we are",
  issueBlurb: (_n: number) =>
    `No party. No hidden agenda. Just people who got tired of manually digging through years of coverage to figure out if a candidate was even worth voting for. Politicians across every party have long relied on a poorly-informed electorate to coast to re-election — it keeps them comfortable and unaccountable. This is our small attempt to change that.`,
  statCandidates: "Candidates",
  statDistricts: "Districts",
  statSeats: "Seats in parliament",
  statParties: "Political parties",
  onTheBallot: "On the ballot",
  pollsOpen: "Polls open",
  electionDateTime: "Saturday · 30 May 2026 · 07:00–22:00",
  heroSubline: "Get to know the candidates in your district.",
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
  districtsLabel: "Districts",
  backToDistricts: "← Districts",
  districtCandidates: "candidates",
  districtNotable: "notable",
  districtSecondTier: "second-tier",
  districtFillers: "list-fillers",
  districtContext: "Information about this district",
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
  sourcePending: "Source pending",
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
  localitySearchPlaceholder: "Search your locality…",
  localitySearchNoResults:   "No locality found",
  searchPlaceholder: "Search candidate name…",
  viewCards: "Cards",
  viewTable: "Table",
  filtersLabel: "Filters",
  filterDistrict: "District",
  filterTier: "Candidate public profile",
  filterParty: "Party",
  filterControversy: "Controversy",
  filterTrackRecord: "Track record",
  candidatesCount: (n: number) => `${n} candidates`,

  // ── Tier labels ───────────────────────────────────────────────────────
  tierNotable: "Notable",
  tierSecondTier: "2nd tier",
  tierListFiller: "List-filler",

  // ── Gov badge ─────────────────────────────────────────────────────────
  govBadge: "Gov",

  // ── Card labels ───────────────────────────────────────────────────────
  cardTrackRecord:  "Track record",
  cardControversy:  "Controversy",
  cardSocialMedia:  "Social media",
  cardConflict:     "Conflict",
  cardTransparency: "Transparency",

  // ── Business interests section ────────────────────────────────────────
  businessInterestsSection: "Business interests & transparency",
  conflictLabel:            "Conflict of interest",
  transparencyLabel:        "Financial transparency",

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
  headlineLine1: "Min se",
  headlineLine2Prefix: "",
  headlineLine2Bold: "jirrapreżentak",
  headlineLine3: "verament?",
  subhead:
    "Fil-jum tal-elezzjoni, il-biċċa l-kbira tal-ismijiet fuq il-ballot huma barranin — u hemm wisq biex tirriċerka minn daqshekk. Distrett jagħmel ix-xogħol tal-bażi: kull kandidat huwa proffilat, ivvalutat bil-preżenza fil-midja, u ttikkettat biex tifred malajr il-kandidati serji mill-mimlejn lista. Iffiltja biex issib dak li jgħodd, imbagħad iqdim. Aqra aktar. Agħmel għażla infurmata. Malta tistħoqqilha aħjar.",
  inThisIssue: "Min aħna",
  issueBlurb: (_n: number) =>
    `L-ebda partit. L-ebda aġenda moħbija. Sempliċement nies li qegudin jitħabtu jfittxu snin ta’ artikli biex jifhmu jekk kandidat jistħoqqilhomx il-vot. Il-politiċi ta’ kull partit ilhom jiddependu fuq elettorat li m’għandux informazzjoni biżżejjed — u dan iżommhom komdi u mhux responsabbli. Dan huwa t-tentattiv żgħir tagħna biex nibdlu dan.`,
  statCandidates: "Kandidati",
  statDistricts: "Distretti",
  statSeats: "Siġġijiet fil-Parlament",
  statParties: "Partiti Politiċi",
  onTheBallot: "Fuq il-Ballot",
  pollsOpen: "L-Urni Miftuħa",
  electionDateTime: "Is-Sibt · 30 ta’ Mejju 2026 · 07:00–22:00",
  heroSubline: "Kun af il-kandidati fid-distrett tiegħek.",
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
  districtsLabel: "Distretti",
  backToDistricts: "← Distretti",
  districtCandidates: "kandidati",
  districtNotable: "notevoli",
  districtSecondTier: "tieni livell",
  districtFillers: "mimlejn lista",
  districtContext: "Informazzjoni dwar dan id-Distrett",
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
  sourcePending: "Sors pendenti",
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
  localitySearchPlaceholder: "Fittex il-lokalità tiegħek…",
  localitySearchNoResults:   "Ma nstabet l-ebda lokalità",
  searchPlaceholder: "Fittex isem il-kandidat…",
  viewCards: "Karti",
  viewTable: "Tabella",
  filtersLabel: "Filtri",
  filterDistrict: "Distrett",
  filterTier: "Profil pubbliku tal-kandidat",
  filterParty: "Partit",
  filterControversy: "Kontroversja",
  filterTrackRecord: "Rekord",
  candidatesCount: (n: number) => `${n} kandidati`,

  // ── Tier labels ───────────────────────────────────────────────────────
  tierNotable: "Notevoli",
  tierSecondTier: "Tieni Livell",
  tierListFiller: "Mimli Lista",

  // ── Gov badge ─────────────────────────────────────────────────────────
  govBadge: "Gvern",

  // ── Card labels ───────────────────────────────────────────────────────
  cardTrackRecord:  "Rekord",
  cardControversy:  "Kontroversja",
  cardSocialMedia:  "Midja Soċjali",
  cardConflict:     "Kunflitt",
  cardTransparency: "Trasparenza",

  // ── Business interests section ────────────────────────────────────────
  businessInterestsSection: "Interessi kummerċjali u trasparenza",
  conflictLabel:            "Kunflitt ta' interess",
  transparencyLabel:        "Trasparenza finanzjarja",

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
