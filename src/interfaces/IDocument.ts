import React from "react";

export interface IDocument {
  documentText: string;
  setDocumentText: React.Dispatch<React.SetStateAction<string>>;
  uploadedFileName: string | null;
  setUploadedFileName: React.Dispatch<React.SetStateAction<string | null>>;
  isExportDisabled: boolean;
}
