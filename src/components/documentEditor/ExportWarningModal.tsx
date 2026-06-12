import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useExport, useLanguage } from '@/context/AppContext';

const ExportWarningModal: React.FC = () => {
  const { showExportWarning, setShowExportWarning, handleExportAnyway } = useExport();
  const { t } = useLanguage();

  if (!showExportWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="rounded-lg shadow-xl p-6 max-w-md w-full mx-4 anim-scale-in"
        style={{ background: 'var(--surface)', border: '1px solid var(--warn)' }}
      >
        <div className="flex items-start space-x-3 mb-4">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--warn)' }} />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {t('warningTitle')}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
              {t('warningMessage')}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setShowExportWarning(false)} className="btn-nj">
            {t('cancel')}
          </button>
          <button onClick={handleExportAnyway} className="btn-nj accent">
            {t('exportAnyway')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportWarningModal;
