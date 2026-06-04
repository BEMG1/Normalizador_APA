import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import {
  type CitationFormat,
  type ICitationFormatter,
  CITATION_FORMATTERS,
  DEFAULT_FORMAT,
} from '@/utils/citationFormats';

const STORAGE_KEY = 'citation_format';

interface CitationFormatContextType {
  /** Currently active format id (e.g. 'apa7') */
  citationFormat: CitationFormat;
  /** Changes the active format and persists it to localStorage */
  setCitationFormat: (format: CitationFormat) => void;
  /** The formatter implementation for the active format */
  formatter: ICitationFormatter;
}

const CitationFormatContext = createContext<CitationFormatContextType | undefined>(undefined);

export const CitationFormatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [citationFormat, setCitationFormatState] = useState<CitationFormat>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in CITATION_FORMATTERS) {
      return stored as CitationFormat;
    }
    return DEFAULT_FORMAT;
  });

  const setCitationFormat = (format: CitationFormat) => {
    localStorage.setItem(STORAGE_KEY, format);
    setCitationFormatState(format);
  };

  const formatter = useMemo(
    () => CITATION_FORMATTERS[citationFormat],
    [citationFormat],
  );

  return (
    <CitationFormatContext.Provider value={{ citationFormat, setCitationFormat, formatter }}>
      {children}
    </CitationFormatContext.Provider>
  );
};

export const useCitationFormat = (): CitationFormatContextType => {
  const context = useContext(CitationFormatContext);
  if (context === undefined) {
    throw new Error('useCitationFormat must be used within a CitationFormatProvider');
  }
  return context;
};

export default CitationFormatProvider;
