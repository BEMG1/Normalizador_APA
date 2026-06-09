import React from 'react';
import { useLanguage } from '@/context/AppContext';
import { Languages } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          aria-label={t('languageToggle')}
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('languageToggle')}</span>
          <span className="ml-1 text-xs font-semibold uppercase">{language}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('languageToggle')}</p>
      </TooltipContent>
    </Tooltip>
  );
};
