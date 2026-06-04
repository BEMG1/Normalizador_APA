import React from 'react';
import type { ICitationFormatter } from './types';
import type { Reference } from '@/components/References/ReferencesManager';
import { getYear } from '@/components/References/ReferencesManager';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const formatSingleAuthorSurname = (name: string): string => {
  const parts = name.split(',');
  return parts.length > 1 ? parts[0].trim() : name.trim();
};

const splitAuthors = (authorStr: string): string[] =>
  authorStr.split(/;| & | and | y /i).map((a) => a.trim()).filter(Boolean);

// ─── APA 7 Formatter ─────────────────────────────────────────────────────────
// Key rules:
//   • In-text: et al. from 3+ authors
//   • DOI: https://doi.org/XXXX
//   • Alphabetical sort by first author surname
//   • References section heading: "Referencias"

export const apa7Formatter: ICitationFormatter = {
  sortMode: 'alphabetical',
  sectionHeading: 'Referencias',

  // ── Plain-text reference ──────────────────────────────────────────────────
  formatReference(ref: Reference): string {
    const author = ref.author || '[Autor]';
    const year = getYear(ref.year);
    const title = ref.title || '[Título]';

    switch (ref.type) {
      case 'book':
        return `${author} (${year}). ${title}. ${ref.publisher || '[Editorial]'}.`;

      case 'article': {
        const journal = ref.journal || '[Revista]';
        const volume = ref.volume || '[Volumen]';
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
        return `${author} (${year}). ${title}. ${journal}, ${volume}${issue}${pages}.${doi}`;
      }

      case 'website':
        return `${author} (${year}). ${title}. ${ref.siteName || '[Nombre del Sitio]'}. ${ref.url || '[URL]'}`;

      case 'video':
        return `${author} (${year}). ${title} [Video]. ${ref.channel || '[Canal]'}. ${ref.url || '[URL]'}`;

      default:
        return 'Referencia incompleta';
    }
  },

  // ── JSX preview (with italic markup) ─────────────────────────────────────
  formatReferenceJSX(ref: Reference): React.ReactElement {
    const author = ref.author || '[Autor]';
    const year = getYear(ref.year);
    const title = ref.title || '[Título]';

    switch (ref.type) {
      case 'book': {
        const publisher = ref.publisher || '[Editorial]';
        return (
          <span>
            {author} ({year}). <em>{title}</em>. {publisher}.
          </span>
        );
      }

      case 'article': {
        const journal = ref.journal || '[Revista]';
        const volume = ref.volume || '[Volumen]';
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
        return (
          <span>
            {author} ({year}). {title}. <em>{journal}</em>, <em>{volume}</em>
            {issue}{pages}.{doi}
          </span>
        );
      }

      case 'website': {
        const siteName = ref.siteName || '[Nombre del Sitio]';
        const url = ref.url || '[URL]';
        return (
          <span>
            {author} ({year}). <em>{title}</em>. {siteName}. {url}
          </span>
        );
      }

      case 'video': {
        const channel = ref.channel || '[Canal]';
        const videoUrl = ref.url || '[URL]';
        return (
          <span>
            {author} ({year}). <em>{title}</em> [Video]. {channel}. {videoUrl}
          </span>
        );
      }

      default:
        return <span>Referencia incompleta</span>;
    }
  },

  // ── In-text citation ──────────────────────────────────────────────────────
  // APA 7: 1 author → (Surname, year)
  //        2 authors → (Surname & Surname, year)
  //        3+ authors → (Surname et al., year)
  formatInTextCitation(ref: Reference): string {
    if (!ref) return '';
    const authorStr = ref.author?.trim() || 'Autor desconocido';
    const year = getYear(ref.year);
    const authors = splitAuthors(authorStr);

    let formattedAuthors: string;
    if (authors.length === 1) {
      formattedAuthors = formatSingleAuthorSurname(authors[0]);
    } else if (authors.length === 2) {
      formattedAuthors = `${formatSingleAuthorSurname(authors[0])} & ${formatSingleAuthorSurname(authors[1])}`;
    } else {
      formattedAuthors = `${formatSingleAuthorSurname(authors[0])} et al.`;
    }

    return ` (${formattedAuthors}, ${year})`;
  },
};
