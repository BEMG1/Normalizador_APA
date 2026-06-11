import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { useDocument } from "./DocumentContext";
import { useReferences } from "./ReferencesContext";
import { useCitationFormat } from "./CitationFormatContext";
import { exportToDocx } from "@/utils/docxExport";
import { useCoverPage } from "./CoverPageContext";
import { useLanguage } from "./LanguageContext";
import type { IExport } from "@/interfaces/IExport";

const ExportContext = createContext<IExport | undefined>(undefined);

const ExportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
    <ExportContext.Provider value={value}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExport = () => {
  const context = useContext(ExportContext);
  if (context === undefined) {
    throw new Error("useExport must be used within an ExportProvider");
  }
  return context;
};

export default ExportProvider;

