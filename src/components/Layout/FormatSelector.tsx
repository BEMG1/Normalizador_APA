import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useCitationFormat } from '@/context/AppContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FORMAT_CONFIGS, type CitationFormat } from '@/utils/citationFormats';

const FORMAT_ORDER: CitationFormat[] = ['apa7', 'apa6', 'ieee'];

export const FormatSelector: React.FC = () => {
  const { citationFormat, setCitationFormat } = useCitationFormat();
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const formatDropdownRef = useRef<HTMLDivElement>(null);

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
  );
};
