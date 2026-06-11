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
        <button onClick={toggleLanguage} className="ib-nj" style={{ width: 'auto', padding: '0 8px', gap: 4 }} aria-label={t('languageToggle')}>
          <Languages size={14} strokeWidth={1.6} />
          <span style={{ fontFamily: 'var(--mono-font)', fontSize: 11, fontWeight: 500 }}>{language.toUpperCase()}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('languageToggle')}</p>
      </TooltipContent>
    </Tooltip>
  );
};
