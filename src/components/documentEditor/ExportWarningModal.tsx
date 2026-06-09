import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useExport, useLanguage } from '@/context/AppContext';

const ExportWarningModal: React.FC = () => {
  const { showExportWarning, setShowExportWarning, handleExportAnyway } = useExport();
  const { t } = useLanguage();

  if (!showExportWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-amber-300 dark:border-amber-700">
        <div className="flex items-start space-x-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('warningTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('warningMessage')}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowExportWarning(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleExportAnyway}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            {t('exportAnyway')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportWarningModal;
