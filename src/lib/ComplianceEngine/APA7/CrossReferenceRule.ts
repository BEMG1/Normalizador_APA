import type { Rule, DocumentData, RuleResult, ComplianceStatus } from '../types';

// i18n keys used in this rule (translated in ComplianceModal via t()):
// name:    'crossRef.name'
// msg ok:  'crossRef.ok'
// msg err: 'crossRef.bothMissing' | 'crossRef.orphanCitations' | 'crossRef.unusedRefs' | 'crossRef.empty'

export const crossReferenceRule: Rule = {
  id: 'apa7-cross-reference',
  name: 'crossRef.name',
  description: 'crossRef.desc',
  weight: 20,
  evaluate: (data: DocumentData): RuleResult => {
    const references = data.references || [];
    
    // Parse HTML to find all in-text citations
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.html, 'text/html');
    const marks = Array.from(doc.querySelectorAll('mark[data-reference-id]'));
    
    const citedIds = new Set(marks.map(m => m.getAttribute('data-reference-id')).filter(Boolean) as string[]);
    const refIds = new Set(references.map(r => r.id));

    const orphanCitations: string[] = [];
    for (const citedId of citedIds) {
      if (!refIds.has(citedId)) {
        orphanCitations.push(citedId);
      }
    }

    const unusedReferences: string[] = [];
    for (const ref of references) {
      if (!citedIds.has(ref.id)) {
        unusedReferences.push(ref.title || 'crossRef.untitled');
      }
    }

    let status: ComplianceStatus = 'compliant';
    let message = 'crossRef.ok';

    if (orphanCitations.length > 0 && unusedReferences.length > 0) {
      status = 'non-compliant';
      message = 'crossRef.bothMissing';
    } else if (orphanCitations.length > 0) {
      status = 'non-compliant';
      message = 'crossRef.orphanCitations';
    } else if (unusedReferences.length > 0) {
      status = 'warning';
      // Encode key + dynamic data separated by | so the modal can translate + append
      message = `crossRef.unusedRefs|${unusedReferences.join(', ')}`;
    } else if (citedIds.size === 0 && refIds.size === 0) {
      // No cites and no references — ReferenceRules will flag separately; mark as compliant here
      status = 'compliant';
      message = 'crossRef.empty';
    }

    return {
      id: 'apa7-cross-reference',
      name: 'crossRef.name',
      description: 'crossRef.desc',
      status,
      message,
      weight: 20
    };
  }
};
