import React, { useId } from 'react';
import { RotateCcw, FileImage, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { useCoverPage } from '@/context/AppContext';
import { useCitationFormat } from '@/context/AppContext';
import type { CoverPage } from '@/interfaces/ICoverPage';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CoverPagePreview from './CoverPagePreview';
import DatePickerField from './DatePickerField';

// ─── Field definitions per format ─────────────────────────────────────────────

interface FieldDef {
  key: keyof CoverPage;
  label: string;
  placeholder: string;
  required?: boolean;
  hint?: string;
  formats: ('apa7' | 'apa6' | 'ieee')[];
}

const FIELD_DEFS: FieldDef[] = [
  {
    key: 'title',
    label: 'Título del documento',
    placeholder: 'Ej: Análisis de redes neuronales convolucionales...',
    required: true,
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'subtitle',
    label: 'Subtítulo',
    placeholder: 'Subtítulo opcional',
    formats: ['apa7', 'apa6'],
  },
  {
    key: 'authors',
    label: 'Autor(es)',
    placeholder: 'Ej: Juan Pérez, María López',
    required: true,
    hint: 'Separa múltiples autores con coma',
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'institution',
    label: 'Institución / Universidad',
    placeholder: 'Ej: Universidad Nacional de Colombia',
    required: true,
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'faculty',
    label: 'Facultad / Departamento',
    placeholder: 'Ej: Facultad de Ingeniería de Sistemas',
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'course',
    label: 'Curso / Asignatura',
    placeholder: 'Ej: Fundamentos de Bases de Datos - Grupo 01',
    formats: ['apa7', 'apa6'],
  },
  {
    key: 'teacher',
    label: 'Docente',
    placeholder: 'Ej: Dr. Carlos Rodríguez',
    formats: ['apa7', 'apa6'],
  },
  {
    key: 'city',
    label: 'Ciudad',
    placeholder: 'Ej: Bogotá',
    formats: ['apa7', 'apa6', 'ieee'],
  },
  {
    key: 'date',
    label: 'Fecha',
    placeholder: '',
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
}

const FormField: React.FC<FormFieldProps> = ({ id, def, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {def.label}
      {def.required && (
        <span className="text-red-500 text-xs" aria-label="campo obligatorio">*</span>
      )}
      {def.hint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">
              <Info className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{def.hint}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={def.placeholder}
      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                 placeholder-gray-400 dark:placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                 focus:border-transparent transition-all duration-150"
    />
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────

const CoverPageForm: React.FC = () => {
  const { coverPage, updateField, resetCoverPage } = useCoverPage();
  const { citationFormat } = useCitationFormat();
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
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60
                      border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileImage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Incluir portada en la exportación
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Se añadirá como primera página del documento
            </p>
          </div>
        </div>
        <button
          id="cover-page-toggle"
          onClick={handleToggle}
          aria-pressed={coverPage.enabled}
          aria-label={coverPage.enabled ? 'Desactivar portada' : 'Activar portada'}
          className="flex-shrink-0 transition-all duration-200 rounded focus:outline-none
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {coverPage.enabled ? (
            <ToggleRight className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-gray-400 dark:text-gray-500" />
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
                  label={def.label}
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
              />
            );
          })}

          {/* Reset button */}
          <button
            id="cover-page-reset"
            onClick={resetCoverPage}
            className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500
                       hover:text-red-500 dark:hover:text-red-400 transition-colors self-start"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer campos
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
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50
                        border border-blue-100 dark:border-blue-900">
          <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            {citationFormat === 'ieee'
              ? 'La portada IEEE utiliza el título en mayúsculas y no incluye campos de curso ni docente.'
              : citationFormat === 'apa7'
              ? 'Formato APA 7ª Ed.: título en la mitad superior de la página, información del autor centrada, doble espacio (§2.3).'
              : 'Formato APA 6ª Ed.: portada con título, autor, institución, curso, docente y fecha centrados.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CoverPageForm;
