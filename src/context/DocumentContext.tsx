import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IDocument } from "@/interfaces/IDocument";

const DocumentContext = createContext<IDocument | undefined>(undefined);

const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documentText, setDocumentText] = useLocalStorage<string>("documentText", "");
  const [documentTitle, setDocumentTitle] = useLocalStorage<string>(
    "documentTitle",
    "Document_Citara",
  );

  const [complianceScore, setComplianceScore] = React.useState<number | null>(null);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = React.useState<boolean>(false);

  const isExportDisabled = !documentText.trim();

  const value = useMemo(
    () => ({
      documentText,
      setDocumentText,
      documentTitle,
      setDocumentTitle,
      isExportDisabled,
      complianceScore,
      setComplianceScore,
      isComplianceModalOpen,
      setIsComplianceModalOpen,
    }),
    [documentText, setDocumentText, documentTitle, setDocumentTitle, isExportDisabled, complianceScore, isComplianceModalOpen]
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
};

export default DocumentProvider;
