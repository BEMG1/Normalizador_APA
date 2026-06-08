import { type CitationFormat, type ICitationFormatter } from '@/utils/citationFormats';

export interface ICitationFormat {
  /** Currently active format id (e.g. 'apa7') */
  citationFormat: CitationFormat;
  /** Changes the active format and persists it to localStorage */
  setCitationFormat: (format: CitationFormat) => void;
  /** The formatter implementation for the active format */
  formatter: ICitationFormatter;
}
