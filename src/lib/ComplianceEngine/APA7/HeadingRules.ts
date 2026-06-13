import type { Rule, DocumentData, RuleResult } from '../types';

export const headingHierarchyRule: Rule = {
  id: 'apa7-heading-hierarchy',
  name: 'Jerarquía de encabezados',
  description: 'Verifica el uso correcto de los niveles de encabezado (H1, H2, H3).',
  weight: 20,
  evaluate: (data: DocumentData): RuleResult => {
    // Heuristic: Check if there's any H1 or H2 in the HTML.
    // If there's an H2 but no H1, it's non-compliant.
    const hasH1 = /<h1/i.test(data.html);
    const hasH2 = /<h2/i.test(data.html);
    
    if (hasH2 && !hasH1) {
      return {
        id: 'apa7-heading-hierarchy',
        name: 'Jerarquía de encabezados',
        description: 'Verifica la jerarquía.',
        status: 'non-compliant',
        message: 'Se encontró un encabezado de nivel 2 sin un nivel 1 previo.',
        weight: 20
      };
    }
    
    if (!hasH1 && !hasH2) {
      return {
        id: 'apa7-heading-hierarchy',
        name: 'Jerarquía de encabezados',
        description: 'Verifica la jerarquía.',
        status: 'warning',
        message: 'No se encontraron encabezados en el documento.',
        weight: 20
      };
    }

    return {
      id: 'apa7-heading-hierarchy',
      name: 'Jerarquía de encabezados',
      description: 'Verifica la jerarquía.',
      status: 'compliant',
      weight: 20
    };
  }
};
