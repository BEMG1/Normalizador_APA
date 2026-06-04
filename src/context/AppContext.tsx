import React, { type ReactNode } from "react";
import ThemeProvider from "./ThemeContext";
import DocumentProvider from "./DocumentContext";
import ReferencesProvider from "./ReferencesContext";
import ExportProvider from "./ExportContext";
import { ConfigProvider } from "./ConfigContext";
import CitationFormatProvider from "./CitationFormatContext";

export { useTheme } from "./ThemeContext";
export { useDocument } from "./DocumentContext";
export { useReferences } from "./ReferencesContext";
export { useExport } from "./ExportContext";
export { useConfig } from "./ConfigContext";
export { useCitationFormat } from "./CitationFormatContext";

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <CitationFormatProvider>
          <DocumentProvider>
            <ReferencesProvider>
              <ExportProvider>{children}</ExportProvider>
            </ReferencesProvider>
          </DocumentProvider>
        </CitationFormatProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default AppProviders;
