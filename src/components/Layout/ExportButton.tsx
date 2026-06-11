import React from 'react';
import { Download } from 'lucide-react';
import { useExport, useDocument, useLanguage } from '@/context/AppContext';

export const ExportButton: React.FC = () => {
  const { handleExportClick } = useExport();
  const { isExportDisabled } = useDocument();
  const { t } = useLanguage();

  return (
    <button
      onClick={handleExportClick}
      disabled={isExportDisabled}
      className="btn-nj primary"
    >
      <Download size={14} strokeWidth={1.8} />
      {t('exportWord')}
    </button>
  );
};
