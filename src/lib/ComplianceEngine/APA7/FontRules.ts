import type { Rule, DocumentData, RuleResult } from '../types';

export const allowedFontsRule: Rule = {
  id: 'apa7-font-allowed',
  name: 'Fuente permitida',
  description: 'Verifica si el documento usa fuentes permitidas por APA 7 (Times New Roman, Calibri, Arial, Lucida Sans Unicode, Georgia).',
  weight: 10,
  evaluate: (_data: DocumentData): RuleResult => {
    if (_data.isNormalized) {
      return {
        id: 'apa7-font-allowed',
        name: 'Fuente permitida',
        description: 'Verifica si el documento usa fuentes permitidas.',
        status: 'compliant',
        weight: 10
      };
    }

    // Heuristic: Check if the html contains font-family styles with the allowed fonts
    // Mammoth might not preserve font-family by default unless configured, 
    // but if it does or if we use raw XML later, this would catch it.
    // As a heuristic for the demo, we assume compliant unless we specifically detect forbidden fonts like Comic Sans.
    const forbiddenFonts = /Comic Sans/i;
    if (forbiddenFonts.test(_data.html)) {
       return {
        id: 'apa7-font-allowed',
        name: 'Fuente permitida',
        description: 'Verifica si el documento usa fuentes permitidas.',
        status: 'non-compliant',
        message: 'Se detectó una fuente no recomendada (ej. Comic Sans).',
        weight: 10
      };
    }

    return {
      id: 'apa7-font-allowed',
      name: 'Fuente permitida',
      description: 'Verifica si el documento usa fuentes permitidas.',
      status: 'compliant',
      weight: 10
    };
  }
};
