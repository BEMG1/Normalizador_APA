import React from "react";

export interface IDocument {
  documentText: string;
  setDocumentText: React.Dispatch<React.SetStateAction<string>>;
  documentTitle: string;
  setDocumentTitle: React.Dispatch<React.SetStateAction<string>>;
  isExportDisabled: boolean;
}
