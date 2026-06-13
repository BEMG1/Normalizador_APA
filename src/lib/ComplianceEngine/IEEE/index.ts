import type { NormEngine, Rule, DocumentData, RuleResult } from '../types';

// i18n keys used: 'ieee.general.name', 'ieee.general.desc', 'ieee.general.twoCol', 'ieee.general.warning'

const ieeeGeneralRule: Rule = {
  id: 'ieee-general',
  name: 'ieee.general.name',
  description: 'ieee.general.desc',
  weight: 100,
  evaluate: (_data: DocumentData): RuleResult => {
    return {
      id: 'ieee-general',
      name: 'ieee.general.twoCol',
      description: 'ieee.general.desc',
      status: 'warning',
      message: 'ieee.general.warning',
      weight: 100
    };
  }
};

export const ieeeEngine: NormEngine = {
  format: 'ieee',
  rules: [ieeeGeneralRule]
};
