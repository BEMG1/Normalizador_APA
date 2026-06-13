import { es, en } from '@/i18n';

export type ReferenceType = 'book' | 'article' | 'website' | 'video';

export interface Reference {
  id: string;
  type: ReferenceType;
  author: string;
  year: string;
  title: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  siteName?: string;
  channel?: string;
}

export const getYear = (year: string, lang?: string): string => year.trim() || (lang === 'en' ? 'n.d.' : 's.f.');

export const getYearError = (year: string): string | undefined => {
  const trimmed = year.trim();
  if (!trimmed) return undefined;
  // Match 4-digit years or "s.f.", optionally followed by date details in APA format
  const regex = /^(?:([12]\d{3})|s\.?\s*f\.?)(?:,.*)?$/i;
  const match = trimmed.match(regex);
  if (!match) {
    return 'Formato no válido (ej. 2023 o s.f.)';
  }
  const yearStr = match[1];
  if (yearStr) {
    const yearVal = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();
    if (yearVal > currentYear) {
      return `El año no puede ser superior al actual (${currentYear})`;
    }
  }
  return undefined;
};

const tText = (key: keyof typeof es, lang?: string): string => ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

export const getReferenceText = (ref: Reference, lang?: string): string => {
  const author = ref.author || tText('unknownAuthor', lang);
  const year = getYear(ref.year, lang);
  const title = ref.title || tText('unknownTitle', lang);

  switch (ref.type) {
    case 'book':
      return `${author} (${year}). ${title}. ${ref.publisher || `[${tText('publisher', lang)}]`}.`;
    case 'article': {
      const journal = ref.journal || `[${tText('journalName', lang)}]`;
      const volume = ref.volume || `[${tText('volume', lang)}]`;
      const issue = ref.issue ? `(${ref.issue})` : '';
      const pages = ref.pages ? `, ${ref.pages}` : '';
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
      return `${author} (${year}). ${title}. ${journal}, ${volume}${issue}${pages}.${doi}`;
    }
    case 'website':
      return `${author} (${year}). ${title}. ${ref.siteName || `[${tText('siteName', lang)}]`}. ${ref.url || '[URL]'}`;
    case 'video':
      return `${author} (${year}). ${title} [Video]. ${ref.channel || `[${tText('channelName', lang)}]`}. ${ref.url || '[URL]'}`;
    default:
      return tText('incompleteReferenceFallback', lang);
  }
};
