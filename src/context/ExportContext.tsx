import React, { createContext, useContext, useState, type ReactNode } from "react";
import { useDocument } from "./DocumentContext";
import { useReferences } from "./ReferencesContext";
import { exportToDocx } from "@/utils/docxExport";

interface ExportContextType {
  showExportWarning: boolean;
  setShowExportWarning: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportClick: () => void;
  handleExportAnyway: () => Promise<void>;
}

const ExportContext = createContext<ExportContextType | undefined>(undefined);

export const ExportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { documentText, uploadedFileName } = useDocument();
  const { references } = useReferences();
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
      exportToDocx(documentText, references, suggestedName);
    }
  };

  const handleExportAnyway = async () => {
    setShowExportWarning(false);
    const suggestedName = uploadedFileName
      ? `${uploadedFileName}_Normalizate_APA`
      : "File_Normalizate_APA";
    await exportToDocx(documentText, references, suggestedName);
  };

  return (
    <ExportContext.Provider
      value={{
        showExportWarning,
        setShowExportWarning,
        handleExportClick,
        handleExportAnyway,
      }}
    >
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
