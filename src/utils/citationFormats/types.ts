import type { Reference } from '@/components/References/ReferencesManager';

// ─── Supported citation format identifiers ───────────────────────────────────
export type CitationFormat = 'apa7' | 'apa6' | 'ieee';

// ─── Display metadata for UI ─────────────────────────────────────────────────
export interface CitationFormatConfig {
  /** Short label shown in selectors and headers (e.g. "APA 7ª Ed.") */
  label: string;
  /** Subtitle shown in the app header (e.g. "7ª Edición · Alfa") */
  subtitle: string;
  /** Brief description for tooltips */
  description: string;
}

// ─── Formatter interface ──────────────────────────────────────────────────────

/**
 * Each citation format must implement this interface.
 * All methods receive a fully-typed Reference object.
 */
export interface ICitationFormatter {
  /**
   * Returns the full, plain-text reference string for use in the
   * references section (e.g. for clipboard copy).
   */
  formatReference(ref: Reference, lang?: string): string;

  /**
   * Returns a JSX element with appropriate italic/bold markup
   * for the in-editor preview panel.
   */
  formatReferenceJSX(ref: Reference, lang?: string): React.ReactElement;

  /**
   * Returns the in-text citation string to be appended when the user
   * associates a reference to a text selection.
   *
   * @param ref - The reference being cited.
   * @param index - 1-based position of the reference (used by IEEE).
   */
  formatInTextCitation(ref: Reference, index?: number, lang?: string): string;

  /**
   * Indicates whether references should be sorted alphabetically (APA)
   * or by order of appearance (IEEE).
   */
  sortMode: 'alphabetical' | 'appearance';

  /**
   * The display label for the references section heading in the exported
   * document (e.g. "Referencias" or "References").
   */
  sectionHeading: (lang?: string) => string;
}
