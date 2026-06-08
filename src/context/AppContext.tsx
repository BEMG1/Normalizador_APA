import React, { Suspense, type ReactNode } from "react";
import ProviderComposer from "./ProviderComposer";
import GlobalLoader from "@/components/ui/GlobalLoader";

// Exportamos los hooks para mantener la API limpia para los consumidores
export { useTheme } from "./ThemeContext";
export { useDocument } from "./DocumentContext";
export { useReferences } from "./ReferencesContext";
export { useExport } from "./ExportContext";
export { useConfig } from "./ConfigContext";
export { useCitationFormat } from "./CitationFormatContext";

// Cargamos los proveedores a demanda (Lazy Loading)
const ThemeProvider = React.lazy(() => import("./ThemeContext").then(m => ({ default: m.ThemeProvider })));
const DocumentProvider = React.lazy(() => import("./DocumentContext").then(m => ({ default: m.DocumentProvider })));
const ReferencesProvider = React.lazy(() => import("./ReferencesContext").then(m => ({ default: m.ReferencesProvider })));
const ExportProvider = React.lazy(() => import("./ExportContext").then(m => ({ default: m.ExportProvider })));
const ConfigProvider = React.lazy(() => import("./ConfigContext").then(m => ({ default: m.ConfigProvider })));
const CitationFormatProvider = React.lazy(() => import("./CitationFormatContext").then(m => ({ default: m.CitationFormatProvider })));

// Lista plana de proveedores (El orden importa: de más global a más específico)
const providers = [
  ConfigProvider,
  ThemeProvider,
  CitationFormatProvider,
  DocumentProvider,
  ReferencesProvider,
  ExportProvider,
];

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <ProviderComposer providers={providers}>
        {children}
      </ProviderComposer>
    </Suspense>
  );
};

export default AppProviders;
