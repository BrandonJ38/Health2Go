import type { AvoidKey } from '../profile/options';

// Strong   = consistent findings from trials or large meta-analyses, or official guidelines
// Emerging = early or limited evidence (small trials, animal/lab studies)
// Debated  = credible studies disagree
export type EvidenceLevel = 'strong' | 'emerging' | 'debated';

export type Source = {
  title: string;
  publisher: string; // journal or organization
  year: number;
  url: string;
};

export type Claim = {
  text: string;
  evidence: EvidenceLevel;
  sources: string[]; // keys into SOURCES
};

export type Article = {
  slug: string;
  title: string;
  summary: string; // one line for lists
  readMinutes: number;
  avoid: AvoidKey[]; // avoid-list categories this article belongs to
  shortVersion: string;
  claims: Claim[]; // "How it affects the body"
  whereItHides: string[];
  labelNames?: string[]; // names to look for on ingredient lists
  swaps: string[];
  reviewed: boolean; // expert (RD/MD) review — required before any public launch
};
