import React from 'react';
import { Download } from 'lucide-react';
import { useExport, useDocument } from '@/context/AppContext';

export const ExportButton: React.FC = () => {
  const { handleExportClick } = useExport();
  const { isExportDisabled } = useDocument();

  return (
    <button
      onClick={handleExportClick}
      disabled={isExportDisabled}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar a Word
    </button>
  );
};
