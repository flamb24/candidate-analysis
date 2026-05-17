export type Tier = "Notable" | "Second-tier" | "List-filler";
export type Severity = "None" | "Low" | "Medium" | "High";
export type SocialReach = "None" | "Low" | "Moderate" | "High";
export type ElectabilitySymbol = "✗" | "✅" | "✅✅" | "✅✅✅";

export interface Source {
  text: string;
  url?: string;
}

export interface Controversy {
  description: string;
  severity: Severity;
  nature?: string;
  sources: Source[];
}

export interface SocialLink {
  platform: string;
  url?: string;
  label?: string;
}

export interface Candidate {
  id: string;
  district: number;
  name: string;
  ballotName?: string;
  party: string;
  tier: Tier;
  isGovIncumbent: boolean;

  euGroup?: string;
  ideology?: string;
  intraPartyStanding?: string;
  keyIssues?: string;
  abortionStance?: string;

  priorOffice?: string;
  achievement?: string;
  gap?: string;
  trackRecordStars: number;

  controversies: Controversy[];
  controversySeverity: Severity;

  socialLinks: SocialLink[];
  approxReach?: string;
  campaignTone?: string;
  campaignMessage?: string;
  socialReach: SocialReach;

  electability: string;
  electabilitySymbol: ElectabilitySymbol;
  electabilityLabel: string;
  alignmentSummary?: string;
}

export interface IssueRow {
  issue: string;
  stances: Record<string, string>;
}

export interface IssueMatrix {
  partyHeaders: string[];
  rows: IssueRow[];
  notes?: string;
}

export interface District {
  number: number;
  title: string;
  subtitle: string;
  intro: string;
  localities: string;   // e.g. "Valletta, Floriana, Ħamrun …"
  electionDate: string;
  candidates: Candidate[];
  tierCounts: { Notable: number; "Second-tier": number; "List-filler": number };
  issueMatrix?: IssueMatrix;
}
