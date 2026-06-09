import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Language, TranslationDictionary } from '../i18n';
import { es, en } from '../i18n';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <K extends keyof TranslationDictionary>(key: K) => TranslationDictionary[K];
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const dictionaries: Record<Language, TranslationDictionary> = { es, en };

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const savedLang = localStorage.getItem('normalizador_apa_lang') as Language;
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('normalizador_apa_lang', lang);
  };

  const t = <K extends keyof TranslationDictionary>(key: K): TranslationDictionary[K] => {
    const dict = dictionaries[language];
    return dict[key] ?? (key as unknown as TranslationDictionary[K]);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
