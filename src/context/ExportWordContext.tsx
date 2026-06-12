import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { useDocument } from "./DocumentContext";
import { useReferences } from "./ReferencesContext";
import { useCitationFormat } from "./CitationFormatContext";
import { exportToDocx } from "@/utils/docxExport";
import { useCoverPage } from "./CoverPageContext";
import { useLanguage } from "./LanguageContext";
import type { IExportWord } from "@/interfaces/IExportWord";

const ExportWordContext = createContext<IExportWord | undefined>(undefined);

export const ExportWordProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { documentText, documentTitle } = useDocument();
  const { references } = useReferences();
  const { formatter } = useCitationFormat();
  const { coverPage } = useCoverPage();
  const { language } = useLanguage();
  const [showExportWarning, setShowExportWarning] = useState(false);

  const handleExportClick = () => {
    const hasIncomplete = references.some(
      (ref) => !ref.author.trim() || !ref.title.trim(),
    );
    if (hasIncomplete) {
      setShowExportWarning(true);
    } else {
      const suggestedName = `${documentTitle}_Citara` || "Document_Citara";
      exportToDocx(documentText, references, suggestedName, formatter, language, coverPage);
    }
  };

  const handleExportAnyway = async () => {
    setShowExportWarning(false);
    const suggestedName = `${documentTitle}_Citara` || "Document_Citara";
    await exportToDocx(documentText, references, suggestedName, formatter, language, coverPage);
  };

  const value = useMemo(
    () => ({
      showExportWarning,
      setShowExportWarning,
      handleExportClick,
      handleExportAnyway,
    }),
    [showExportWarning, setShowExportWarning, handleExportClick, handleExportAnyway]
  );

  return (
    <ExportWordContext.Provider value={value}>
      {children}
    </ExportWordContext.Provider>
  );
};

export const useExportWord = () => {
  const context = useContext(ExportWordContext);
  if (context === undefined) {
    throw new Error("useExportWord must be used within an ExportWordProvider");
  }
  return context;
};

export default ExportWordProvider;

