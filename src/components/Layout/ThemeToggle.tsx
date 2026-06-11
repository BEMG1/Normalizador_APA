import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme, useLanguage } from '@/context/AppContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={toggleDarkMode} className="ib-nj">
          {isDark ? <Sun size={15} strokeWidth={1.6} /> : <Moon size={15} strokeWidth={1.6} />}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isDark ? t('themeToggleLight') : t('themeToggleDark')}</p>
      </TooltipContent>
    </Tooltip>
  );
};
