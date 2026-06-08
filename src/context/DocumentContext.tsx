import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IDocument } from "@/interfaces/IDocument";

const DocumentContext = createContext<IDocument | undefined>(undefined);

const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documentText, setDocumentText] = useLocalStorage<string>("documentText", "");
  const [uploadedFileName, setUploadedFileName] = useLocalStorage<string | null>(
    "uploadedFileName",
    null,
  );

  const isExportDisabled = !documentText.trim();

  const value = useMemo(
    () => ({
      documentText,
      setDocumentText,
      uploadedFileName,
      setUploadedFileName,
      isExportDisabled,
    }),
    [documentText, setDocumentText, uploadedFileName, setUploadedFileName, isExportDisabled]
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
