// ─── Barrel export for citation formatters ────────────────────────────────────

export type { CitationFormat, CitationFormatConfig, ICitationFormatter } from './types';

export { apa7Formatter } from './apa7.tsx';
export { apa6Formatter } from './apa6.tsx';
export { ieeeFormatter } from './ieee.tsx';

import type { CitationFormat, CitationFormatConfig, ICitationFormatter } from './types';
import { apa7Formatter } from './apa7.tsx';
import { apa6Formatter } from './apa6.tsx';
import { ieeeFormatter } from './ieee.tsx';

/**
 * Map of all available formatters keyed by their CitationFormat id.
 * Add new formats here to make them available throughout the app.
 */
export const CITATION_FORMATTERS: Record<CitationFormat, ICitationFormatter> = {
  apa7: apa7Formatter,
  apa6: apa6Formatter,
  ieee: ieeeFormatter,
};

/**
 * Display metadata for each format, used in UI selectors and the app header.
 */
export const FORMAT_CONFIGS: Record<CitationFormat, CitationFormatConfig> = {
  apa7: {
    label: 'APA 7ª Ed.',
    subtitle: '7ª Edición · Alfa',
    description: 'American Psychological Association, 7.ª edición (2020). Formato más reciente.',
  },
  apa6: {
    label: 'APA 6ª Ed.',
    subtitle: '6ª Edición',
    description: 'American Psychological Association, 6.ª edición (2009). Formato anterior al estándar actual.',
  },
  ieee: {
    label: 'IEEE',
    subtitle: 'IEEE · Numérico',
    description: 'Institute of Electrical and Electronics Engineers. Citas numéricas, orden de aparición.',
  },
};

/**
 * The default format used when no preference has been stored.
 */
export const DEFAULT_FORMAT: CitationFormat = 'apa7';
