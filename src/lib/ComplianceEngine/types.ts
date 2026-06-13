import type { CitationFormat } from '@/utils/citationFormats';

export type ComplianceStatus = 'compliant' | 'non-compliant' | 'warning' | 'not-applicable';

export interface RuleResult {
  id: string;
  name: string;
  description: string;
  status: ComplianceStatus;
  message?: string;
  weight: number; // For score calculation, e.g., some rules are more critical
}

export interface DocumentData {
  html: string;
  text: string;
  arrayBuffer?: ArrayBuffer;
  isNormalized?: boolean;
  hasExtractedCoverPage?: boolean;
  hasExtractedReferences?: boolean;
  references?: import('@/utils/referenceUtils').Reference[];
  // We can add more extracted metadata here later (e.g., from docx or jszip)
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  weight: number;
  evaluate: (data: DocumentData) => RuleResult;
}

export interface NormEngine {
  format: CitationFormat;
  rules: Rule[];
}

export interface ComplianceReport {
  format: CitationFormat;
  score: number; // 0 to 100
  compliantElements: RuleResult[];
  missingElements: RuleResult[];
  warnings: RuleResult[];
  isNormalizable: boolean;
}
