import React, { useId } from 'react';
import { RotateCcw, FileImage, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { useCoverPage, useLanguage } from '@/context/AppContext';
import { useCitationFormat } from '@/context/AppContext';
import type { CoverPage } from '@/interfaces/ICoverPage';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CoverPagePreview from './CoverPagePreview';
import DatePickerField from './DatePickerField';

// ─── Field definitions per format ─────────────────────────────────────────────

interface FieldDef {
  key: keyof CoverPage;
  labelKey: keyof typeof import('@/i18n/locales/es').es;
  placeholderKey: keyof typeof import('@/i18n/locales/es').es;
  hintKey?: keyof typeof import('@/i18n/locales/es').es;
  required?: boolean;
  formats: ('apa7' | 'apa6' | 'ieee')[];
}

const FIELD_DEFS: FieldDef[] = [
  {
    key: 'title',
    labelKey: 'coverDocTitle',
    placeholderKey: 'coverDocTitlePlaceholder',
    required: true,
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'subtitle',
    labelKey: 'coverSubtitle',
    placeholderKey: 'coverSubtitlePlaceholder',
    formats: ['apa7', 'apa6'],
  },
  {
    key: 'authors',
    labelKey: 'coverAuthors',
    placeholderKey: 'coverAuthorsPlaceholder',
    required: true,
    hintKey: 'coverAuthorsHint',
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'institution',
    labelKey: 'coverInstitution',
    placeholderKey: 'coverInstitutionPlaceholder',
    required: true,
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'faculty',
    labelKey: 'coverFaculty',
    placeholderKey: 'coverFacultyPlaceholder',
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'course',
    labelKey: 'coverCourse',
    placeholderKey: 'coverCoursePlaceholder',
    formats: ['apa7', 'apa6'],
  },
  {
    key: 'teacher',
    labelKey: 'coverTeacher',
    placeholderKey: 'coverTeacherPlaceholder',
    formats: ['apa7', 'apa6'],
  },
  {
    key: 'city',
    labelKey: 'coverCity',
    placeholderKey: 'coverCityPlaceholder',
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'date',
    labelKey: 'coverDate',
    placeholderKey: 'coverDate', // Date does not have a real placeholder
    required: true,
    formats: ['apa7', 'apa6', 'ieee'],
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

interface FormFieldProps {
  id: string;
  def: FieldDef;
  value: string;
  onChange: (val: string) => void;
  t: any;
}

const FormField: React.FC<FormFieldProps> = ({ id, def, value, onChange, t }) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="flex items-center gap-1.5 text-sm font-medium"
      style={{ color: 'var(--text)' }}
    >
      {t(def.labelKey) as string}
      {def.required && (
        <span className="text-xs" style={{ color: 'var(--err)' }} aria-label="campo obligatorio">*</span>
      )}
      {def.hintKey && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">
              <Info className="h-3.5 w-3.5" style={{ color: 'var(--text-3)' }} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t(def.hintKey) as string}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t(def.placeholderKey) as string}
      className="input-nj"
    />
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────

const CoverPageForm: React.FC = () => {
  const { coverPage, updateField, resetCoverPage } = useCoverPage();
  const { citationFormat } = useCitationFormat();
  const { t } = useLanguage();
  const baseId = useId();

  const activeFields = FIELD_DEFS.filter((f) =>
    f.formats.includes(citationFormat as 'apa7' | 'apa6' | 'ieee'),
  );

  const handleToggle = () => {
    updateField('enabled', !coverPage.enabled);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Enable / disable toggle ── */}
      <div
        className="flex items-center justify-between p-3 rounded-lg"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {t('includeCoverPage')}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              {t('includeCoverPageDesc')}
            </p>
          </div>
        </div>
        <button
          id="cover-page-toggle"
          onClick={handleToggle}
          aria-pressed={coverPage.enabled}
          aria-label={coverPage.enabled ? t('disableCoverPage') : t('enableCoverPage')}
          className="flex-shrink-0 transition-all duration-200 rounded focus:outline-none"
        >
          {coverPage.enabled ? (
            <ToggleRight className="h-8 w-8" style={{ color: 'var(--accent)' }} />
          ) : (
            <ToggleLeft className="h-8 w-8" style={{ color: 'var(--text-3)' }} />
          )}
        </button>
      </div>

      {/* ── Form + Preview (two-column on medium+) ── */}
      <div className="flex flex-col xl:flex-row gap-5">

        {/* Form fields */}
        <div
          className={`relative flex-1 flex flex-col gap-3.5 transition-opacity duration-200 ${
            coverPage.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'
          }`}
        >
          {activeFields.map((def) => {
            const rawValue = coverPage[def.key];
            const value = typeof rawValue === 'string' ? rawValue : '';

            // Date field → custom calendar picker
            if (def.key === 'date') {
              return (
                <DatePickerField
                  key={def.key}
                  id={`${baseId}-${def.key}`}
                  label={t(def.labelKey) as string}
                  value={value}
                  required={def.required}
                  onChange={(val) => updateField('date', val)}
                />
              );
            }

            return (
              <FormField
                key={def.key}
                id={`${baseId}-${def.key}`}
                def={def}
                value={value}
                onChange={(val) => updateField(def.key, val as CoverPage[typeof def.key])}
                t={t}
              />
            );
          })}

          {/* Reset button */}
          <button
            id="cover-page-reset"
            onClick={resetCoverPage}
            className="mt-1 flex items-center gap-1.5 text-xs transition-colors self-start"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--err)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t('resetFields')}
          </button>
        </div>

        {/* Preview column */}
        <div
          className={`xl:w-[200px] flex-shrink-0 transition-opacity duration-200 ${
            coverPage.enabled ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <CoverPagePreview
            coverPage={coverPage}
            citationFormat={citationFormat as 'apa7' | 'apa6' | 'ieee'}
          />
        </div>
      </div>

      {/* Format notice */}
      {coverPage.enabled && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
            {citationFormat === 'ieee'
              ? t('ieeeCoverNotice')
              : citationFormat === 'apa7'
              ? t('apa7CoverNotice')
              : t('apa6CoverNotice')}
          </p>
        </div>
      )}
    </div>
  );
};

export default CoverPageForm;
