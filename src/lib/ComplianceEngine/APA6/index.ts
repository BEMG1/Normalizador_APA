import type { NormEngine } from '../types';
import { allowedFontsRule } from '../APA7/FontRules';
import { correctMarginsRule, doubleSpacingRule } from '../APA7/PageRules';
import { headingHierarchyRule } from '../APA7/HeadingRules';
import { referenceListRule } from '../APA7/ReferenceRules';
import { coverPageRule } from '../APA7/CoverPageRules';
import { crossReferenceRule } from '../APA7/CrossReferenceRule';

// i18n keys used: 'apa6.font.name', 'apa6.font.desc', 'apa6.font.error'

export const apa6Engine: NormEngine = {
  format: 'apa6',
  rules: [
    {
      ...allowedFontsRule,
      id: 'apa6-font',
      name: 'apa6.font.name',
      description: 'apa6.font.desc',
      evaluate: (data) => {
        const hasTimesNewRoman = /times new roman/i.test(data.html);
        return {
          id: 'apa6-font',
          name: 'apa6.font.name',
          description: 'apa6.font.desc',
          status: hasTimesNewRoman ? 'compliant' : 'non-compliant',
          message: hasTimesNewRoman ? undefined : 'apa6.font.error',
          weight: 20
        };
      }
    },
    { ...correctMarginsRule, id: 'apa6-margins' },
    { ...doubleSpacingRule, id: 'apa6-spacing' },
    { ...headingHierarchyRule, id: 'apa6-headings' },
    { ...referenceListRule, id: 'apa6-references' },
    { ...coverPageRule, id: 'apa6-cover' },
    { ...crossReferenceRule, id: 'apa6-cross-reference' }
  ]
};
