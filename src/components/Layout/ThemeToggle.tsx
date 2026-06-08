import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/AppContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}</p>
      </TooltipContent>
    </Tooltip>
  );
};
