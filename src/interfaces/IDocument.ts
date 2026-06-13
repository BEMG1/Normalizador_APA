import React from "react";

export interface IDocument {
  documentText: string;
  setDocumentText: React.Dispatch<React.SetStateAction<string>>;
  documentTitle: string;
  setDocumentTitle: React.Dispatch<React.SetStateAction<string>>;
  isExportDisabled: boolean;
  complianceScore: number | null;
  setComplianceScore: React.Dispatch<React.SetStateAction<number | null>>;
  isComplianceModalOpen: boolean;
  setIsComplianceModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
