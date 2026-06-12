import React from 'react';
import type { CoverPage } from '@/interfaces/ICoverPage';
import type { CitationFormat } from '@/utils/citationFormats';
import { useLanguage } from '@/context/AppContext';

interface CoverPagePreviewProps {
  coverPage: CoverPage;
  citationFormat: CitationFormat;
}

/**
 * Renders a visual mini-preview of the cover page inside the form panel.
 * Simulates the look of a printed A4 page following each standard's layout:
 *
 * APA 7 / APA 6 (§2.3):
 *   - Page number "1" top-right in the header area.
 *   - Title block positioned in the UPPER HALF of the page (~top third).
 *   - Author/institution block below, centred.
 *
 * IEEE:
 *   - Compact centred layout, no page number header.
 */
const CoverPagePreview: React.FC<CoverPagePreviewProps> = ({ coverPage, citationFormat }) => {
  const isIEEE = citationFormat === 'ieee';
  const isAPA = !isIEEE;
  const { t } = useLanguage();

  const hasContent =
    coverPage.title.trim() ||
    coverPage.authors.trim() ||
    coverPage.institution.trim();

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold nj-text-3 uppercase tracking-wider mb-3">
        {t('preview')}
      </p>

      {/* A4 page simulation */}
      <div
        className="w-full max-w-[260px] nj-surface-input border nj-border
                   rounded-lg shadow-md overflow-hidden relative"
        style={{ aspectRatio: '210 / 297' }}
        aria-label={t('preview')}
      >
        {hasContent ? (
          <div className="flex flex-col h-full">

            {/* ── Header bar (page number for APA) ── */}
            <div className="flex items-center justify-end px-3 pt-2 pb-0.5 flex-shrink-0"
                 style={{ height: '10%' }}>
              {isAPA && (
                <span
                  className="nj-text-3 font-mono"
                  style={{ fontSize: '0.42rem' }}
                  title="Número de página (APA §2.3)"
                >
                  1
                </span>
              )}
            </div>

            {/* ── Upper half: title block ── */}
            {/* APA: title sits in the top ~45% of the usable area (upper half per §2.3) */}
            {/* IEEE: title is roughly centred */}
            <div
              className="flex flex-col items-center justify-end px-4 text-center flex-shrink-0"
              style={{ height: isIEEE ? '48%' : '40%' }}
            >
              {coverPage.title && (
                <p
                  className="font-bold nj-text leading-tight"
                  style={{ fontSize: '0.6rem' }}
                >
                  {isIEEE ? coverPage.title.toUpperCase() : coverPage.title}
                </p>
              )}
              {isAPA && coverPage.subtitle?.trim() && (
                <p className="nj-text-2 mt-0.5" style={{ fontSize: '0.52rem' }}>
                  {coverPage.subtitle}
                </p>
              )}
            </div>

            {/* ── Lower half: author / institution / course / date ── */}
            <div
              className="flex flex-col items-center justify-start px-4 text-center gap-0.5 flex-shrink-0"
              style={{ height: isIEEE ? '38%' : '40%' }}
            >
              {/* Extra spacing for APA between title block and authors */}
              {isAPA && <div style={{ height: '1rem' }} />}

              {coverPage.authors && (
                <p className="nj-text" style={{ fontSize: '0.5rem' }}>
                  {coverPage.authors}
                </p>
              )}
              {coverPage.institution && (
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.48rem' }}>
                  {coverPage.institution}
                </p>
              )}
              {coverPage.faculty && (
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.48rem' }}>
                  {coverPage.faculty}
                </p>
              )}
              {!isIEEE && coverPage.course && (
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.46rem' }}>
                  {coverPage.course}
                </p>
              )}
              {!isIEEE && coverPage.teacher && (
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '0.46rem' }}>
                  {coverPage.teacher}
                </p>
              )}
              {(coverPage.city || coverPage.date) && (
                <p className="nj-text-3 mt-0.5" style={{ fontSize: '0.46rem' }}>
                  {[coverPage.city, coverPage.date].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            {/* ── Bottom flex fill ── */}
            <div className="flex-1" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
            <div className="w-12 h-0.5 nj-surface-3 rounded" />
            <div className="w-16 h-0.5 nj-surface-3 rounded" />
            <div className="w-10 h-0.5 nj-surface-3 rounded" />
            <p className="nj-text-3 text-center mt-3" style={{ fontSize: '0.48rem' }}>
              {t('fillFieldsToPreview')}
            </p>
          </div>
        )}
      </div>

      {/* APA layout hint */}
      {hasContent && isAPA && (
        <p className="mt-1.5 nj-text-3 text-center leading-tight" style={{ fontSize: '0.6rem' }}>
          {t('apaHint')}
        </p>
      )}

      {/* Format badge */}
      <div className="mt-2 px-2 py-0.5 rounded-full nj-bg-accent-s border nj-border">
        <span className="text-xs nj-accent font-medium">
          {citationFormat === 'apa7' ? 'APA 7ª Ed.' : citationFormat === 'apa6' ? 'APA 6ª Ed.' : 'IEEE'}
        </span>
      </div>
    </div>
  );
};

export default CoverPagePreview;
