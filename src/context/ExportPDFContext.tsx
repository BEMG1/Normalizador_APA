import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { useDocument } from "./DocumentContext";
import { useReferences } from "./ReferencesContext";
import { useCitationFormat } from "./CitationFormatContext";
import { exportToPdf } from "@/utils/pdfExport";
import { useCoverPage } from "./CoverPageContext";
import { useLanguage } from "./LanguageContext";

interface IExportPDF {
  showExportPdfWarning: boolean;
  setShowExportPdfWarning: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportPdfClick: () => void;
  handleExportPdfAnyway: () => Promise<void>;
  isExportingPdf: boolean;
}

const ExportPDFContext = createContext<IExportPDF | undefined>(undefined);

export const ExportPDFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { documentText, documentTitle } = useDocument();
  const { references } = useReferences();
  const { formatter } = useCitationFormat();
  const { coverPage } = useCoverPage();
  const { language } = useLanguage();
  
  const [showExportPdfWarning, setShowExportPdfWarning] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdfClick = () => {
    const hasIncomplete = references.some(
      (ref) => !ref.author.trim() || !ref.title.trim(),
    );
    if (hasIncomplete) {
      setShowExportPdfWarning(true);
    } else {
      executePdfExport();
    }
  };

  const handleExportPdfAnyway = async () => {
    setShowExportPdfWarning(false);
    await executePdfExport();
  };

  const executePdfExport = async () => {
    setIsExportingPdf(true);
    try {
      const suggestedName = `${documentTitle}_Citara` || "Document_Citara";
      await exportToPdf(documentText, references, suggestedName, formatter, language, coverPage);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const value = useMemo(
    () => ({
      showExportPdfWarning,
      setShowExportPdfWarning,
      handleExportPdfClick,
      handleExportPdfAnyway,
      isExportingPdf,
    }),
    [showExportPdfWarning, setShowExportPdfWarning, handleExportPdfClick, handleExportPdfAnyway, isExportingPdf]
  );

  return (
    <ExportPDFContext.Provider value={value}>
      {children}
    </ExportPDFContext.Provider>
  );
};

export const useExportPDF = () => {
  const context = useContext(ExportPDFContext);
  if (context === undefined) {
    throw new Error("useExportPDF must be used within an ExportPDFProvider");
  }
  return context;
};

export default ExportPDFProvider;
