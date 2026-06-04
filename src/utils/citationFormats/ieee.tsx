import React from 'react';
import type { ICitationFormatter } from './types';
import type { Reference } from '@/components/References/ReferencesManager';
import { getYear } from '@/components/References/ReferencesManager';

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Formats an author string to IEEE initials style.
 * Input:  "García López, Juan Carlos"  →  "J. C. García López"
 * Input:  "Juan García"                →  "J. García"
 */
const formatIEEEAuthor = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return '';

  // Check "Surname, Firstname" format (APA style)
  const commaIdx = trimmed.indexOf(',');
  if (commaIdx !== -1) {
    const surname = trimmed.slice(0, commaIdx).trim();
    const firstNames = trimmed.slice(commaIdx + 1).trim();
    const initials = firstNames
      .split(/\s+/)
      .map((part) => (part ? `${part[0].toUpperCase()}.` : ''))
      .filter(Boolean)
      .join(' ');
    return initials ? `${initials} ${surname}` : surname;
  }

  // Assume "Firstname Surname" format
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const surname = parts.pop()!;
  const initials = parts.map((p) => `${p[0].toUpperCase()}.`).join(' ');
  return `${initials} ${surname}`;
};

const splitAuthors = (authorStr: string): string[] =>
  authorStr.split(/;| & | and | y /i).map((a) => a.trim()).filter(Boolean);

// ─── IEEE Formatter ───────────────────────────────────────────────────────────
// Key rules:
//   • In-text: numeric citation [n] by order of appearance
//   • References: numbered list [1], [2], ...
//   • Sort mode: 'appearance' (order references appear in the document)
//   • Author format: Initials Surname (e.g. "J. C. García")
//   • References section heading: "References"

export const ieeeFormatter: ICitationFormatter = {
  sortMode: 'appearance',
  sectionHeading: 'References',

  // ── Plain-text reference ──────────────────────────────────────────────────
  // IEEE does NOT prepend the [n] number here; that is the responsibility of
  // the export layer which knows the ordering.
  formatReference(ref: Reference): string {
    const authors = splitAuthors(ref.author || '');
    const formattedAuthors =
      authors.length > 0
        ? authors.map(formatIEEEAuthor).join(', ')
        : '[Autor]';

    const year = getYear(ref.year);
    const title = ref.title || '[Título]';

    switch (ref.type) {
      case 'book': {
        const publisher = ref.publisher || '[Editorial]';
        return `${formattedAuthors}, "${title}," ${publisher}, ${year}.`;
      }

      case 'article': {
        const journal = ref.journal || '[Revista]';
        const volume = ref.volume ? `vol. ${ref.volume}` : '';
        const issue = ref.issue ? `, no. ${ref.issue}` : '';
        const pages = ref.pages ? `, pp. ${ref.pages}` : '';
        const doi = ref.doi ? `, doi: ${ref.doi}` : '';
        const parts = [volume, issue, pages, `, ${year}`, doi].filter(Boolean).join('');
        return `${formattedAuthors}, "${title}," ${journal}${parts ? ', ' + parts : ''}.`;
      }

      case 'website': {
        const siteName = ref.siteName || '[Nombre del Sitio]';
        const url = ref.url || '[URL]';
        return `${formattedAuthors}, "${title}," ${siteName}. [Online]. Available: ${url}. Accessed: ${year}.`;
      }

      case 'video': {
        const channel = ref.channel || '[Canal]';
        const url = ref.url || '[URL]';
        return `${formattedAuthors}, "${title}" [Video]. ${channel}, ${year}. Available: ${url}.`;
      }

      default:
        return 'Referencia incompleta';
    }
  },

  // ── JSX preview ───────────────────────────────────────────────────────────
  formatReferenceJSX(ref: Reference): React.ReactElement {
    const authors = splitAuthors(ref.author || '');
    const formattedAuthors =
      authors.length > 0
        ? authors.map(formatIEEEAuthor).join(', ')
        : '[Autor]';

    const year = getYear(ref.year);
    const title = ref.title || '[Título]';

    switch (ref.type) {
      case 'book': {
        const publisher = ref.publisher || '[Editorial]';
        return (
          <span>
            {formattedAuthors}, &ldquo;{title},&rdquo; {publisher}, {year}.
          </span>
        );
      }

      case 'article': {
        const journal = ref.journal || '[Revista]';
        const volume = ref.volume ? `vol. ${ref.volume}` : '';
        const issue = ref.issue ? `, no. ${ref.issue}` : '';
        const pages = ref.pages ? `, pp. ${ref.pages}` : '';
        const doi = ref.doi ? `, doi: ${ref.doi}` : '';
        const extras = [volume, issue, pages, `, ${year}`, doi].filter(Boolean).join('');
        return (
          <span>
            {formattedAuthors}, &ldquo;{title},&rdquo; <em>{journal}</em>
            {extras ? `, ${extras}` : ''}.
          </span>
        );
      }

      case 'website': {
        const siteName = ref.siteName || '[Nombre del Sitio]';
        const url = ref.url || '[URL]';
        return (
          <span>
            {formattedAuthors}, &ldquo;{title},&rdquo; {siteName}. [Online]. Available:{' '}
            {url}. Accessed: {year}.
          </span>
        );
      }

      case 'video': {
        const channel = ref.channel || '[Canal]';
        const url = ref.url || '[URL]';
        return (
          <span>
            {formattedAuthors}, &ldquo;{title}&rdquo; [Video]. {channel}, {year}. Available: {url}.
          </span>
        );
      }

      default:
        return <span>Referencia incompleta</span>;
    }
  },

  // ── In-text citation ──────────────────────────────────────────────────────
  // IEEE: [n] where n is the 1-based index of the reference in appearance order.
  // The index is provided by the export layer / editor layer.
  formatInTextCitation(_ref: Reference, index = 1): string {
    return ` [${index}]`;
  },
};
