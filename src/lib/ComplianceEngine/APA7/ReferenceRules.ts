import type { Rule, DocumentData, RuleResult } from '../types';

export const referenceListRule: Rule = {
  id: 'apa7-references-exist',
  name: 'Referencias bibliográficas',
  description: 'Verifica la existencia de una sección de Referencias al final del documento.',
  weight: 30,
  evaluate: (data: DocumentData): RuleResult => {
    // Heuristic: Check if "Referencias" or "References" exists as a heading or near the end.
    const referencesRegex = /(?:<h[1-3][^>]*>)\s*(?:Referencias|References)\s*(?:<\/h[1-3]>)/i;
    
    // If the intelligent extractor already pulled them out, or we find a formal heading
    if (data.hasExtractedReferences || referencesRegex.test(data.html)) {
      return {
        id: 'apa7-references-exist',
        name: 'Referencias bibliográficas',
        description: 'Sección de referencias.',
        status: 'compliant',
        weight: 30
      };
    }

    // Fallback heuristic: check if word appears in the text
    if (/(Referencias|References)\b/i.test(data.text)) {
      return {
        id: 'apa7-references-exist',
        name: 'Referencias bibliográficas',
        description: 'Sección de referencias.',
        status: 'warning',
        message: 'Se mencionan referencias, pero no parece haber una sección con encabezado formal.',
        weight: 30
      };
    }

    return {
      id: 'apa7-references-exist',
      name: 'Referencias bibliográficas',
      description: 'Sección de referencias.',
      status: 'non-compliant',
      message: 'No se encontró la sección de Referencias.',
      weight: 30
    };
  }
};
