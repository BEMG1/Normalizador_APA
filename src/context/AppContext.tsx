import React, { type ReactNode } from "react";
import ThemeProvider from "./ThemeContext";
import DocumentProvider from "./DocumentContext";
import ReferencesProvider from "./ReferencesContext";
import ExportProvider from "./ExportContext";

export { useTheme } from "./ThemeContext";
export { useDocument } from "./DocumentContext";
export { useReferences } from "./ReferencesContext";
export { useExport } from "./ExportContext";

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <DocumentProvider>
        <ReferencesProvider>
          <ExportProvider>{children}</ExportProvider>
        </ReferencesProvider>
      </DocumentProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
