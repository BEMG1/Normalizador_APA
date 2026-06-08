import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { useDocument } from "./DocumentContext";
import { useReferences } from "./ReferencesContext";
import { useCitationFormat } from "./CitationFormatContext";
import { exportToDocx } from "@/utils/docxExport";
import type { IExport } from "@/interfaces/IExport";

const ExportContext = createContext<IExport | undefined>(undefined);

export const ExportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { documentText, uploadedFileName } = useDocument();
  const { references } = useReferences();
  const { formatter } = useCitationFormat();
  const [showExportWarning, setShowExportWarning] = useState(false);

  const handleExportClick = () => {
    const hasIncomplete = references.some(
      (ref) => !ref.author.trim() || !ref.title.trim(),
    );
    if (hasIncomplete) {
      setShowExportWarning(true);
    } else {
      const suggestedName = uploadedFileName
        ? `${uploadedFileName}_Normalizate_APA`
        : "File_Normalizate_APA";
      exportToDocx(documentText, references, suggestedName, formatter);
    }
  };

  const handleExportAnyway = async () => {
    setShowExportWarning(false);
    const suggestedName = uploadedFileName
      ? `${uploadedFileName}_Normalizate_APA`
      : "File_Normalizate_APA";
    await exportToDocx(documentText, references, suggestedName, formatter);
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

