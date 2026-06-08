import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import type { ITheme } from "@/interfaces/ITheme";

const ThemeContext = createContext<ITheme | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  const value = useMemo(
    () => ({ isDark, toggleDarkMode }),
    [isDark, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
