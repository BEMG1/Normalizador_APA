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

import { es, en } from '@/i18n';

const tText = (key: keyof typeof es, lang?: string): string => ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

export const ieeeFormatter: ICitationFormatter = {
  sortMode: 'appearance',
  sectionHeading: (lang?: string) => tText('referencesHeading', lang),

  // ── Plain-text reference ──────────────────────────────────────────────────
  formatReference(ref: Reference, lang?: string): string {
    const authors = splitAuthors(ref.author || '');
    const formattedAuthors =
      authors.length > 0
        ? authors.map(formatIEEEAuthor).join(', ')
        : tText('unknownAuthor', lang);

    const year = getYear(ref.year, lang);
    const title = ref.title || tText('unknownTitle', lang);

    switch (ref.type) {
      case 'book': {
        const publisher = ref.publisher || `[${tText('publisher', lang)}]`;
        return `${formattedAuthors}, "${title}," ${publisher}, ${year}.`;
      }

      case 'article': {
        const journal = ref.journal || `[${tText('journalName', lang)}]`;
        const volume = ref.volume ? `vol. ${ref.volume}` : '';
        const issue = ref.issue ? `, no. ${ref.issue}` : '';
        const pages = ref.pages ? `, pp. ${ref.pages}` : '';
        const doi = ref.doi ? `, doi: ${ref.doi}` : '';
        const parts = [volume, issue, pages, `, ${year}`, doi].filter(Boolean).join('');
        return `${formattedAuthors}, "${title}," ${journal}${parts ? ', ' + parts : ''}.`;
      }

      case 'website': {
        const siteName = ref.siteName || `[${tText('siteName', lang)}]`;
        const url = ref.url || '[URL]';
        return `${formattedAuthors}, "${title}," ${siteName}. [Online]. Available: ${url}. Accessed: ${year}.`;
      }

      case 'video': {
        const channel = ref.channel || `[${tText('channelName', lang)}]`;
        const url = ref.url || '[URL]';
        return `${formattedAuthors}, "${title}" [Video]. ${channel}, ${year}. Available: ${url}.`;
      }

      default:
        return tText('incompleteReferenceFallback', lang);
    }
  },

  // ── JSX preview ───────────────────────────────────────────────────────────
  formatReferenceJSX(ref: Reference, lang?: string): React.ReactElement {
    const authors = splitAuthors(ref.author || '');
    const formattedAuthors =
      authors.length > 0
        ? authors.map(formatIEEEAuthor).join(', ')
        : tText('unknownAuthor', lang);

    const year = getYear(ref.year, lang);
    const title = ref.title || tText('unknownTitle', lang);

    switch (ref.type) {
      case 'book': {
        const publisher = ref.publisher || `[${tText('publisher', lang)}]`;
        return (
          <span>
            {formattedAuthors}, &ldquo;{title},&rdquo; {publisher}, {year}.
          </span>
        );
      }

      case 'article': {
        const journal = ref.journal || `[${tText('journalName', lang)}]`;
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
        const siteName = ref.siteName || `[${tText('siteName', lang)}]`;
        const url = ref.url || '[URL]';
        return (
          <span>
            {formattedAuthors}, &ldquo;{title},&rdquo; {siteName}. [Online]. Available:{' '}
            {url}. Accessed: {year}.
          </span>
        );
      }

      case 'video': {
        const channel = ref.channel || `[${tText('channelName', lang)}]`;
        const url = ref.url || '[URL]';
        return (
          <span>
            {formattedAuthors}, &ldquo;{title}&rdquo; [Video]. {channel}, {year}. Available: {url}.
          </span>
        );
      }

      default:
        return <span>{tText('incompleteReferenceFallback', lang)}</span>;
    }
  },

  // ── In-text citation ──────────────────────────────────────────────────────
  formatInTextCitation(_ref: Reference, index = 1, _lang?: string): string {
    return ` [${index}]`;
  },
};
