import React from 'react';
import type { ICitationFormatter } from './types';
import type { Reference } from '@/utils/referenceUtils';
import { getYear } from '@/utils/referenceUtils';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const formatSingleAuthorSurname = (name: string): string => {
  const parts = name.split(',');
  return parts.length > 1 ? parts[0].trim() : name.trim();
};

const splitAuthors = (authorStr: string): string[] =>
  authorStr.split(/;| & | and | y /i).map((a) => a.trim()).filter(Boolean);

// ─── APA 6 Formatter ─────────────────────────────────────────────────────────
// Key differences from APA 7:
//   • In-text: et al. from 6+ authors (first citation lists all up to 5)
//              For simplicity we use et al. from 6+ on all citations
//   • DOI: written as "doi:XXXX" (not a URL)
//   • Alphabetical sort by first author surname
//   • References section heading: "Referencias"

import { es, en } from '@/i18n';

const tText = (key: keyof typeof es, lang?: string): string => ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

export const apa6Formatter: ICitationFormatter = {
  sortMode: 'alphabetical',
  sectionHeading: (lang?: string) => tText('referencesHeading', lang),

  // ── Plain-text reference ──────────────────────────────────────────────────
  formatReference(ref: Reference, lang?: string): string {
    const author = ref.author || tText('unknownAuthor', lang);
    const year = getYear(ref.year, lang);
    const title = ref.title || tText('unknownTitle', lang);
    const retrievedFrom = tText('retrievedFrom', lang);

    switch (ref.type) {
      case 'book':
        return `${author} (${year}). ${title}. ${ref.publisher || `[${tText('publisher', lang)}]`}.`;

      case 'article': {
        const journal = ref.journal || `[${tText('journalName', lang)}]`;
        const volume = ref.volume || `[${tText('volume', lang)}]`;
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        const doi = ref.doi ? ` doi:${ref.doi}` : '';
        return `${author} (${year}). ${title}. ${journal}, ${volume}${issue}${pages}.${doi}`;
      }

      case 'website':
        return `${author} (${year}). ${title}. ${ref.siteName || `[${tText('siteName', lang)}]`}. ${retrievedFrom} ${ref.url || '[URL]'}`;

      case 'video':
        return `${author} (${year}). ${title} [Archivo de video]. ${ref.channel || `[${tText('channelName', lang)}]`}. ${retrievedFrom} ${ref.url || '[URL]'}`;

      default:
        return tText('incompleteReferenceFallback', lang);
    }
  },

  // ── JSX preview ───────────────────────────────────────────────────────────
  formatReferenceJSX(ref: Reference, lang?: string): React.ReactElement {
    const author = ref.author || tText('unknownAuthor', lang);
    const year = getYear(ref.year, lang);
    const title = ref.title || tText('unknownTitle', lang);
    const retrievedFrom = tText('retrievedFrom', lang);

    switch (ref.type) {
      case 'book': {
        const publisher = ref.publisher || `[${tText('publisher', lang)}]`;
        return (
          <span>
            {author} ({year}). <em>{title}</em>. {publisher}.
          </span>
        );
      }

      case 'article': {
        const journal = ref.journal || `[${tText('journalName', lang)}]`;
        const volume = ref.volume || `[${tText('volume', lang)}]`;
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        const doi = ref.doi ? ` doi:${ref.doi}` : '';
        return (
          <span>
            {author} ({year}). {title}. <em>{journal}</em>, <em>{volume}</em>
            {issue}{pages}.{doi}
          </span>
        );
      }

      case 'website': {
        const siteName = ref.siteName || `[${tText('siteName', lang)}]`;
        const url = ref.url || '[URL]';
        return (
          <span>
            {author} ({year}). <em>{title}</em>. {siteName}. {retrievedFrom} {url}
          </span>
        );
      }

      case 'video': {
        const channel = ref.channel || `[${tText('channelName', lang)}]`;
        const videoUrl = ref.url || '[URL]';
        return (
          <span>
            {author} ({year}). <em>{title}</em> [Archivo de video]. {channel}. {retrievedFrom} {videoUrl}
          </span>
        );
      }

      default:
        return <span>{tText('incompleteReferenceFallback', lang)}</span>;
    }
  },

  // ── In-text citation ──────────────────────────────────────────────────────
  formatInTextCitation(ref: Reference, _index?: number, lang?: string): string {
    if (!ref) return '';
    const authorStr = ref.author?.trim() || tText('unknownAuthor', lang);
    const year = getYear(ref.year, lang);
    const authors = splitAuthors(authorStr);

    let formattedAuthors: string;
    if (authors.length === 1) {
      formattedAuthors = formatSingleAuthorSurname(authors[0]);
    } else if (authors.length >= 2 && authors.length <= 5) {
      const surnames = authors.map(formatSingleAuthorSurname);
      const last = surnames.pop()!;
      formattedAuthors =
        surnames.length > 0 ? `${surnames.join(', ')} & ${last}` : last;
    } else {
      formattedAuthors = `${formatSingleAuthorSurname(authors[0])} ${tText('etAl', lang)}`;
    }

    return ` (${formattedAuthors}, ${year})`;
  },
};
