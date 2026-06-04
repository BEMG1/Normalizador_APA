import React from 'react';
import { Download, Moon, Sun } from 'lucide-react';
import { useTheme, useExport, useDocument } from '@/context/AppContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const Header: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme();
  const { handleExportClick } = useExport();
  const { isExportDisabled } = useDocument();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="images/logo.png" alt="Logo" className="h-8 w-8 shrink-0 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Normalizador APA
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              7ª Edición · Alfa
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
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
          <button
            onClick={handleExportClick}
            disabled={isExportDisabled}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar a Word
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
