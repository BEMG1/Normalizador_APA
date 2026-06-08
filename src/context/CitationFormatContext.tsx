import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import {
  type CitationFormat,
  CITATION_FORMATTERS,
  DEFAULT_FORMAT,
} from '@/utils/citationFormats';
import type { ICitationFormat } from '@/interfaces/ICitationFormat';

const STORAGE_KEY = 'citation_format';

const CitationFormatContext = createContext<ICitationFormat | undefined>(undefined);

const CitationFormatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const value = useMemo(
    () => ({ citationFormat, setCitationFormat, formatter }),
    [citationFormat, formatter]
  );

  return (
    <CitationFormatContext.Provider value={value}>
      {children}
    </CitationFormatContext.Provider>
  );
};

export const useCitationFormat = (): ICitationFormat => {
  const context = useContext(CitationFormatContext);
  if (context === undefined) {
    throw new Error('useCitationFormat must be used within a CitationFormatProvider');
  }
  return context;
};

export default CitationFormatProvider;
