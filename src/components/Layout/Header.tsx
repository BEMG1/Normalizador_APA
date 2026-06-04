import React, { useState, useRef, useEffect } from 'react';
import { Download, Moon, Sun, ChevronDown, Check } from 'lucide-react';
import { useTheme, useExport, useDocument, useCitationFormat } from '@/context/AppContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FORMAT_CONFIGS, type CitationFormat } from '@/utils/citationFormats';

const FORMAT_ORDER: CitationFormat[] = ['apa7', 'apa6', 'ieee'];

export const Header: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme();
  const { handleExportClick } = useExport();
  const { isExportDisabled } = useDocument();
  const { citationFormat, setCitationFormat } = useCitationFormat();

  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const formatDropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isFormatDropdownOpen &&
        formatDropdownRef.current &&
        !formatDropdownRef.current.contains(e.target as Node)
      ) {
        setIsFormatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFormatDropdownOpen]);

  const activeConfig = FORMAT_CONFIGS[citationFormat];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* ── Brand ── */}
        <div className="flex items-center space-x-2">
          <img src="images/logo.png" alt="Logo" className="h-8 w-8 shrink-0 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Normalizador APA
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {activeConfig.subtitle}
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center space-x-3">
          {/* Format selector */}
          <div className="relative" ref={formatDropdownRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  id="citation-format-selector"
                  onClick={() => setIsFormatDropdownOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    isFormatDropdownOpen
                      ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-semibold">{activeConfig.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isFormatDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cambiar formato de citación</p>
              </TooltipContent>
            </Tooltip>

            {/* Dropdown panel */}
            {isFormatDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900/60 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Formato de Citación
                  </p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  {FORMAT_ORDER.map((fmt) => {
                    const cfg = FORMAT_CONFIGS[fmt];
                    const isActive = fmt === citationFormat;
                    return (
                      <button
                        key={fmt}
                        id={`format-option-${fmt}`}
                        onClick={() => {
                          setCitationFormat(fmt);
                          setIsFormatDropdownOpen(false);
                        }}
                        className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <span
                            className={`block text-sm font-semibold ${
                              isActive
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {cfg.label}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                            {cfg.description}
                          </span>
                        </div>
                        {isActive && (
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
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

          {/* Export button */}
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
