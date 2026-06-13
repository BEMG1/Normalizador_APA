import React from 'react';
import type { ComplianceReport } from '@/lib/ComplianceEngine/types';
import { useLanguage } from '@/context/AppContext';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ComplianceModalProps {
  report: ComplianceReport | null;
  isOpen: boolean;
  onClose: () => void;
  onNormalize?: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ report, isOpen, onClose, onNormalize }) => {
  const { t } = useLanguage();

  if (!isOpen || !report) return null;

  // Formatting norm name
  const normName = report.format === 'apa7' ? 'APA 7' : report.format === 'apa6' ? 'APA 6' : 'IEEE';
  const normText = (t('complianceEvalNorm' as any) as string).replace('{norm}', normName);

  // SVG Circular progress bar
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.score / 100) * circumference;

  const getTranslatedMessage = (message: string | undefined) => {
    if (!message) return '';
    const [key, data] = message.split('|');
    const translated = (t(key as any) as string) || key;
    return data ? `${translated}${data}` : translated;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
      >

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-semibold tracking-wide" style={{ color: 'var(--text)' }}>
            {t('complianceEvalTitle' as any)}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-thin">

          {/* Top Score Box */}
          <div 
            className="border rounded-lg p-6 flex flex-col items-center justify-center relative shadow-sm"
            style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            <h4 className="text-sm font-medium mb-6" style={{ color: 'var(--text-2)' }}>{normText}</h4>

            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="var(--surface-2)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{report.score}%</span>
              </div>
            </div>
            <p className="text-xs mt-4" style={{ color: 'var(--text-3)' }}>{t('complianceEvalScore' as any)}</p>
          </div>

          {/* Missing items for normalization (moved to top) */}
          {!report.isNormalizable && (
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <h5 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t('missingForNormTitle' as any)}</h5>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{t('missingForNormDesc' as any)}</p>
                </div>
              </div>
              <ul className="p-4 space-y-2 list-disc list-inside text-sm marker:text-orange-500/50" style={{ color: 'var(--text-2)' }}>
                <li>{t('missingNormTitle' as any)}</li>
                <li>{t('missingNormHeadings' as any)}</li>
                <li>{t('missingNormRefs' as any)}</li>
                <li>{t('missingNormCover' as any)}</li>
                <li>{t('missingNormCitations' as any)}</li>
              </ul>
            </div>
          )}

          {/* Compliant Elements */}
          {report.compliantElements.length > 0 && (
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                <h5 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t('complianceElementsOk' as any)}</h5>
              </div>
              <ul className="p-4 space-y-2" style={{ background: 'var(--surface-1)' }}>
                {report.compliantElements.map(el => (
                  <li key={el.id} className="flex items-start text-sm" style={{ color: 'var(--text-2)' }}>
                    <Check className="h-4 w-4 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{(t(el.name as any) as string) || el.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Elements */}
          {report.missingElements.length > 0 && report.isNormalizable && (
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                <h5 className="text-sm font-medium text-rose-600 dark:text-rose-400">{t('complianceElementsMissing' as any)}</h5>
              </div>
              <ul className="p-4 space-y-2" style={{ background: 'var(--surface-1)' }}>
                {report.missingElements.map(el => (
                  <li key={el.id} className="flex items-start text-sm" style={{ color: 'var(--text-2)' }}>
                    <X className="h-4 w-4 mr-2 text-rose-500 shrink-0 mt-0.5" />
                    <span>{(t(el.name as any) as string) || el.name} <span className="text-xs block mt-0.5" style={{ color: 'var(--text-3)' }}>{getTranslatedMessage(el.message)}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                <h5 className="text-sm font-medium text-amber-600 dark:text-amber-500">{t('complianceElementsWarning' as any)}</h5>
              </div>
              <ul className="p-4 space-y-2" style={{ background: 'var(--surface-1)' }}>
                {report.warnings.map(el => (
                  <li key={el.id} className="flex items-start text-sm" style={{ color: 'var(--text-2)' }}>
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 shrink-0 mt-0.5" />
                    <span>{(t(el.name as any) as string) || el.name} <span className="text-xs block mt-0.5" style={{ color: 'var(--text-3)' }}>{getTranslatedMessage(el.message)}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors border"
            style={{ 
              background: 'var(--surface-2)', 
              color: 'var(--text)',
              borderColor: 'var(--border)'
            }}
          >
            {t('close' as any)}
          </button>
          {report.isNormalizable && report.score < 100 && onNormalize && (
            <button
              onClick={() => {
                onNormalize();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-2 shadow-sm"
            >
              {t('normalizeBtn' as any) || 'Normalizar Automáticamente'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm"
          >
            {t('reviewMyDocument' as any)}
          </button>
        </div>
      </div>
    </div>
  );
};
