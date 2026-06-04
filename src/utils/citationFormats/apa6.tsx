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

// ─── APA 6 Formatter ─────────────────────────────────────────────────────────
// Key differences from APA 7:
//   • In-text: et al. from 6+ authors (first citation lists all up to 5)
//              For simplicity we use et al. from 6+ on all citations
//   • DOI: written as "doi:XXXX" (not a URL)
//   • Alphabetical sort by first author surname
//   • References section heading: "Referencias"

export const apa6Formatter: ICitationFormatter = {
  sortMode: 'alphabetical',
  sectionHeading: 'Referencias',

  // ── Plain-text reference ──────────────────────────────────────────────────
  formatReference(ref: Reference): string {
    const author = ref.author || '[Autor]';
    const year = getYear(ref.year);
    const title = ref.title || '[Título]';

    switch (ref.type) {
      case 'book':
        // APA 6 books optionally include location; we omit it when not provided
        return `${author} (${year}). ${title}. ${ref.publisher || '[Editorial]'}.`;

      case 'article': {
        const journal = ref.journal || '[Revista]';
        const volume = ref.volume || '[Volumen]';
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        // APA 6: DOI formatted as "doi:XXXX" (no URL prefix)
        const doi = ref.doi ? ` doi:${ref.doi}` : '';
        return `${author} (${year}). ${title}. ${journal}, ${volume}${issue}${pages}.${doi}`;
      }

      case 'website':
        // APA 6: "Recuperado de URL"
        return `${author} (${year}). ${title}. ${ref.siteName || '[Nombre del Sitio]'}. Recuperado de ${ref.url || '[URL]'}`;

      case 'video':
        return `${author} (${year}). ${title} [Archivo de video]. ${ref.channel || '[Canal]'}. Recuperado de ${ref.url || '[URL]'}`;

      default:
        return 'Referencia incompleta';
    }
  },

  // ── JSX preview ───────────────────────────────────────────────────────────
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
        const doi = ref.doi ? ` doi:${ref.doi}` : '';
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
            {author} ({year}). <em>{title}</em>. {siteName}. Recuperado de {url}
          </span>
        );
      }

      case 'video': {
        const channel = ref.channel || '[Canal]';
        const videoUrl = ref.url || '[URL]';
        return (
          <span>
            {author} ({year}). <em>{title}</em> [Archivo de video]. {channel}. Recuperado de {videoUrl}
          </span>
        );
      }

      default:
        return <span>Referencia incompleta</span>;
    }
  },

  // ── In-text citation ──────────────────────────────────────────────────────
  // APA 6: 1 author   → (Surname, year)
  //        2-5 authors → (Surname, Surname, ..., & Surname, year)
  //        6+ authors  → (Surname et al., year)
  formatInTextCitation(ref: Reference): string {
    if (!ref) return '';
    const authorStr = ref.author?.trim() || 'Autor desconocido';
    const year = getYear(ref.year);
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
      // 6+ authors
      formattedAuthors = `${formatSingleAuthorSurname(authors[0])} et al.`;
    }

    return ` (${formattedAuthors}, ${year})`;
  },
};
