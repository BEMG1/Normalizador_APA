import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { CoverPage, ICoverPage } from '@/interfaces/ICoverPage';

// ─── Default values ────────────────────────────────────────────────────────────

const DEFAULT_COVER_PAGE: CoverPage = {
  enabled: false,
  title: '',
  subtitle: '',
  authors: '',
  institution: '',
  faculty: '',
  course: '',
  teacher: '',
  city: '',
  date: '',
};

// ─── Context ───────────────────────────────────────────────────────────────────

const CoverPageContext = createContext<ICoverPage | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const CoverPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coverPage, setCoverPage] = useLocalStorage<CoverPage>(
    'cover_page',
    DEFAULT_COVER_PAGE,
  );

  const updateField = useCallback(
    <K extends keyof CoverPage>(field: K, value: CoverPage[K]) => {
      setCoverPage((prev) => ({ ...prev, [field]: value }));
    },
    [setCoverPage],
  );

  const resetCoverPage = useCallback(() => {
    setCoverPage(DEFAULT_COVER_PAGE);
  }, [setCoverPage]);

  const value = useMemo(
    () => ({ coverPage, updateField, resetCoverPage }),
    [coverPage, updateField, resetCoverPage],
  );

  return (
    <CoverPageContext.Provider value={value}>
      {children}
    </CoverPageContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCoverPage = (): ICoverPage => {
  const context = useContext(CoverPageContext);
  if (context === undefined) {
    throw new Error('useCoverPage must be used within a CoverPageProvider');
  }
  return context;
};

export default CoverPageProvider;
