import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Reference } from "@/utils/referenceUtils";
import type { IReferences } from "@/interfaces/IReferences";

const ReferencesContext = createContext<IReferences | undefined>(undefined);

const ReferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [references, setReferences] = useLocalStorage<Reference[]>("references", []);

  const value = useMemo(
    () => ({ references, setReferences }),
    [references, setReferences]
  );

  return (
    <ReferencesContext.Provider value={value}>
      {children}
    </ReferencesContext.Provider>
  );
};

export const useReferences = () => {
  const context = useContext(ReferencesContext);
  if (context === undefined) {
    throw new Error("useReferences must be used within a ReferencesProvider");
  }
  return context;
};

export default ReferencesProvider;
