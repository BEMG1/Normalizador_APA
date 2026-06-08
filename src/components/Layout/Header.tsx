import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { FormatSelector } from './FormatSelector';
import { ExportButton } from './ExportButton';
import { HeaderBrand } from './HeaderBrand';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* ── Brand ── */}
        <HeaderBrand />

        {/* ── Actions ── */}
        <div className="flex items-center space-x-3">
          <FormatSelector />
          <ThemeToggle />
          <ExportButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
