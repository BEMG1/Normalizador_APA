import React, { Suspense, type ReactNode } from "react";
import ProviderComposer from "./ProviderComposer";
import GlobalLoader from "@/components/ui/GlobalLoader";

// Exportamos los hooks para mantener la API limpia para los consumidores
export { useTheme } from "./ThemeContext";
export { useDocument } from "./DocumentContext";
export { useReferences } from "./ReferencesContext";
export { useExport } from "./ExportContext";
export { useCitationFormat } from "./CitationFormatContext";
export { useLanguage } from "./LanguageContext";
export { useCoverPage } from "./CoverPageContext";

// Cargamos los proveedores a demanda (Lazy Loading)
const ThemeProvider = React.lazy(() => import("./ThemeContext"));
const DocumentProvider = React.lazy(() => import("./DocumentContext"));
const ReferencesProvider = React.lazy(() => import("./ReferencesContext"));
const ExportProvider = React.lazy(() => import("./ExportContext"));
const ConfigProvider = React.lazy(() => import("./ConfigContext"));
const CitationFormatProvider = React.lazy(() => import("./CitationFormatContext"));
import { LanguageProvider } from "./LanguageContext";
const CoverPageProvider = React.lazy(() => import("./CoverPageContext"));

// Lista plana de proveedores (El orden importa: de más global a más específico)
const providers = [
  LanguageProvider,
  ConfigProvider,
  ThemeProvider,
  CitationFormatProvider,
  CoverPageProvider,
  DocumentProvider,
  ReferencesProvider,
  ExportProvider,
];

const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <ProviderComposer providers={providers}>
        {children}
      </ProviderComposer>
    </Suspense>
  );
};

export default AppProviders;
