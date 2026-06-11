import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { FormatSelector } from './FormatSelector';
import { LanguageToggle } from './LanguageToggle';
import { ExportButton } from './ExportButton';
import { HeaderBrand } from './HeaderBrand';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 border-b" style={{ height: '56px', background: 'var(--bg)', borderColor: 'var(--border-soft)' }}>
      <div className="h-full px-6 flex justify-between items-center">
        {/* ── Brand ── */}
        <HeaderBrand />

        {/* ── Actions ── */}
        <div className="flex items-center space-x-3">
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
