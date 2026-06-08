import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { IConfig } from "@/interfaces/IConfig";

const ConfigContext = createContext<IConfig | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [style, setStyleState] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => { 
    const loadConfig = async () => {
      // 1. Priority: localStorage
      const sessionStyle = localStorage.getItem('app_style');
      if (sessionStyle) {
        applyStyle(sessionStyle);
        setIsLoading(false);
        return;
      } else {
        localStorage.setItem('app_style', "");
      }

      // 2. Priority: config.json
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}config.json`);
        if (response.ok) {
          const config = await response.json();
          if (config.style) {
            applyStyle(config.style);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading config.json:', error);
      }

      // 3. Priority: default
      applyStyle('default');
      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const applyStyle = (newStyle: string) => {
    setStyleState(newStyle);
    if (newStyle.toLowerCase() === 'dani') {
      document.body.classList.add('theme-dani');
    } else {
      document.body.classList.remove('theme-dani');
    }
  };

  const setStyle = (newStyle: string) => {
    localStorage.setItem('app_style', newStyle);
    applyStyle(newStyle);
  };

  const value = useMemo(
    () => ({ style, setStyle, isLoading }),
    [style, isLoading]
  );

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
