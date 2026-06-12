import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useExportWord, useDocument, useLanguage, useExportPDF } from '@/context/AppContext';
import { ExportModal } from './ExportModal';

export const ExportButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleExportClick } = useExportWord();
  const { handleExportPdfClick, isExportingPdf } = useExportPDF();
  const { isExportDisabled } = useDocument();
  const { t } = useLanguage();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isExportDisabled || isExportingPdf}
        className="btn-nj primary"
      >
        <Download size={14} strokeWidth={1.8} />
        {isExportingPdf ? t('loading') : t('exportBtn')}
      </button>

      <ExportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExportDocx={() => handleExportClick()}
        onExportPdf={() => handleExportPdfClick()}
      />
    </>
  );
};
