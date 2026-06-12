import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/AppContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExportDocx,
  onExportPdf,
}) => {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl anim-scale-in"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)', fontFamily: 'var(--ui-font)' }}>
            {t('exportDocument')}
          </h2>
          <button 
            onClick={onClose}
            className="ib-nj"
            aria-label={t('cancel')}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* DOCX Option */}
          <button
            onClick={() => {
              onExportDocx();
              onClose();
            }}
            className="flex items-start gap-4 p-4 rounded-xl text-left transition-all group"
            style={{ 
              background: 'var(--surface-2)', 
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface-2)';
            }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold tracking-wider text-blue-500 border border-blue-500/20 bg-blue-500/10">
              DOCX
            </div>
            <div>
              <h3 className="font-bold mb-1 group-hover:text-blue-500 transition-colors" style={{ color: 'var(--text)' }}>
                {t('exportDocxTitle')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {t('exportDocxDesc')}
              </p>
            </div>
          </button>

          {/* PDF Option */}
          <button
            onClick={() => {
              onExportPdf();
              onClose();
            }}
            className="flex items-start gap-4 p-4 rounded-xl text-left transition-all group"
            style={{ 
              background: 'var(--surface-2)', 
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface-2)';
            }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold tracking-wider text-red-500 border border-red-500/20 bg-red-500/10">
              PDF
            </div>
            <div>
              <h3 className="font-bold mb-1 group-hover:text-red-500 transition-colors" style={{ color: 'var(--text)' }}>
                {t('exportPdfTitle')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {t('exportPdfDesc')}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
