import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { FormatSelector } from './FormatSelector';
import { LanguageToggle } from './LanguageToggle';
import { ExportButton } from './ExportButton';
import { HeaderBrand } from './HeaderBrand';
import { useDocument } from '@/context/DocumentContext';
import { useCitationFormat } from '@/context/AppContext';
import { FORMAT_CONFIGS } from '@/utils/citationFormats';

const Header: React.FC = () => {
  const { complianceScore, setIsComplianceModalOpen } = useDocument();
  const { citationFormat } = useCitationFormat();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10" style={{ background: 'var(--bg)', borderBottomColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-4 justify-between items-center">
        {/* ── Brand ── */}
        <div className="flex items-center gap-6">
          <HeaderBrand />
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center space-x-3">
          {complianceScore !== null && (
            <div 
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full shadow-sm animate-in fade-in duration-300 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
              onClick={() => setIsComplianceModalOpen(true)}
              title="Ver reporte de cumplimiento"
            >
              {/* Circular Progress */}
              <div className="relative w-4 h-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path 
                    strokeWidth="4.5" 
                    stroke="var(--surface-2)" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                  <path 
                    strokeDasharray={`${complianceScore}, 100`} 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    stroke="var(--accent)" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {complianceScore}%
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
                {FORMAT_CONFIGS[citationFormat]?.label || 'APA'}
              </span>
            </div>
          )}
          <FormatSelector />
          <LanguageToggle />
          <ThemeToggle />
          <ExportButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
