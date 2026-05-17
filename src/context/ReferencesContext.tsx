import React, { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Reference } from "@/components/References/ReferencesManager";

interface ReferencesContextType {
  references: Reference[];
  setReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
}

const ReferencesContext = createContext<ReferencesContextType | undefined>(undefined);

export const ReferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [references, setReferences] = useLocalStorage<Reference[]>("references", []);

  return (
    <ReferencesContext.Provider value={{ references, setReferences }}>
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
