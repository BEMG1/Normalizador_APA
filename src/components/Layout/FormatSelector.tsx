import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useCitationFormat, useLanguage } from '@/context/AppContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { type CitationFormat } from '@/utils/citationFormats';

const FORMAT_ORDER: CitationFormat[] = ['apa7', 'apa6', 'ieee'];

export const FormatSelector: React.FC = () => {
  const { citationFormat, setCitationFormat } = useCitationFormat();
  const { t } = useLanguage();
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

  const getFormatKey = (fmt: CitationFormat) => {
    if (fmt === 'apa7') return { label: 'formatAPA7', desc: 'formatAPA7Desc' };
    if (fmt === 'apa6') return { label: 'formatAPA6', desc: 'formatAPA6Desc' };
    if (fmt === 'ieee') return { label: 'formatIEEE', desc: 'formatIEEEDesc' };
    return { label: 'formatAPA7', desc: 'formatAPA7Desc' };
  };

  const activeKeys = getFormatKey(citationFormat);

  return (
    <div className="relative" ref={formatDropdownRef}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            id="citation-format-selector"
            onClick={() => setIsFormatDropdownOpen((prev) => !prev)}
            className="btn-nj"
            style={isFormatDropdownOpen ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' } : {}}
          >
            <span style={{ fontWeight: 600 }}>{t(activeKeys.label as any)}</span>
            <ChevronDown size={14} strokeWidth={1.6} className={`transition-transform duration-200 ${isFormatDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-3)' }} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('formatSelectorTitle')}</p>
        </TooltipContent>
      </Tooltip>

      {isFormatDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl z-50 overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-popover)' }}>
          <div className="px-4 py-2.5" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)', fontFamily: 'var(--mono-font)' }}>
              {t('formatSelectorTitle')}
            </p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {FORMAT_ORDER.map((fmt) => {
              const keys = getFormatKey(fmt);
              const isActive = fmt === citationFormat;
              return (
                <button
                  key={fmt}
                  id={`format-option-${fmt}`}
                  onClick={() => { setCitationFormat(fmt); setIsFormatDropdownOpen(false); }}
                  className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold" style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                      {t(keys.label as any)}
                    </span>
                    <span className="block text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-2)' }}>
                      {t(keys.desc as any)}
                    </span>
                  </div>
                  {isActive && <Check size={14} strokeWidth={1.6} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
