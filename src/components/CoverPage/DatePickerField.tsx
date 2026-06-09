import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/context/AppContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formats a Date using the localized months array */
export const formatDateLocalized = (date: Date, months: string[]): string => {
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  // Using a universal format: "DD Month YYYY" vs "DD de Mes de YYYY"
  // For simplicity, we just use space separation which is generally understood, or match what es.ts uses if we want to be strict.
  // We'll stick to `${day} ${month} ${year}`
  return `${day} ${month} ${year}`;
};

/** Parses the formatted string back to a Date (returns null if unparseable) */
const parseFormattedDate = (value: string, months: string[]): Date | null => {
  if (!value) return null;
  // Try matching "DD Month YYYY" with optional " de " for backwards compatibility
  const match = value.match(/^(\d{1,2})(?: de )?\s+(\w+)(?: de )?\s+(\d{4})$/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthIdx = months.findIndex(
      (m) => m.toLowerCase() === match[2].toLowerCase(),
    );
    const year = parseInt(match[3], 10);
    if (monthIdx !== -1) {
      return new Date(year, monthIdx, day);
    }
  }
  return null;
};

/** Returns an array of Date objects for each day slot in the calendar grid */
const getCalendarDays = (year: number, month: number): (Date | null)[] => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = first.getDay(); // 0 = Sunday
  const days: (Date | null)[] = [];

  // Padding before the 1st
  for (let i = 0; i < startOffset; i++) days.push(null);
  // Actual days
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  // Pad to complete the last week row
  while (days.length % 7 !== 0) days.push(null);

  return days;
};

// ─── DatePickerField ──────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  id?: string;
  label: string;
  value: string;          // Formatted Spanish string ("DD de Mes de YYYY") or empty
  onChange: (value: string) => void;
  required?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required,
}) => {
  const { t } = useLanguage();
  const autoId = useId();
  const fieldId = id ?? autoId;

  const today = new Date();
  // Safe cast since we know months is string[]
  const months = t('months') as unknown as string[];
  const parsed = parseFormattedDate(value, months);

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [selected, setSelected] = useState<Date | null>(parsed);

  // Sync state when value changes externally (e.g. reset)
  useEffect(() => {
    const d = parseFormattedDate(value, months);
    setSelected(d);
    if (d) {
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [value]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }, [viewMonth]);

  const handleDayClick = (day: Date) => {
    setSelected(day);
    onChange(formatDateLocalized(day, months));
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange('');
  };

  const calendarDays = getCalendarDays(viewYear, viewMonth);

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isToday = (d: Date) => isSameDay(d, today);

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {/* Label */}
      <label
        htmlFor={fieldId}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 text-xs" aria-label="campo obligatorio">*</span>
        )}
      </label>

      {/* Trigger button */}
      <button
        id={fieldId}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border
                    transition-all duration-150 text-left
                    ${open
                      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30 dark:ring-blue-400/30'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }
                    bg-white dark:bg-gray-800`}
      >
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
          {value || t('selectDate')}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0 ml-2">
          {value && (
            <span
              role="button"
              tabIndex={0}
              aria-label={t('clearDate')}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400
                         hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <Calendar className={`h-4 w-4 ${open ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
        </span>
      </button>

      {/* Calendar popover */}
      {open && (
        <div
          role="dialog"
          aria-label={t('datePickerLabel')}
          className="absolute z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                     rounded-xl shadow-2xl p-4 w-72 select-none"
          style={{ marginTop: '0.25rem' }}
        >
          {/* Month / Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              aria-label={t('prevMonth')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500
                         dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-transparent
                           border-none outline-none cursor-pointer hover:text-blue-600 dark:hover:text-blue-400
                           transition-colors"
              >
                {months.map((m: string, i: number) => (
                  <option key={m} value={i} className="bg-white dark:bg-gray-900 font-normal">
                    {m}
                  </option>
                ))}
              </select>

              {/* Year input */}
              <input
                type="number"
                value={viewYear}
                min={1900}
                max={2100}
                onChange={(e) => {
                  const y = parseInt(e.target.value, 10);
                  if (!isNaN(y) && y >= 1900 && y <= 2100) setViewYear(y);
                }}
                className="w-16 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-transparent
                           border-none outline-none text-center hover:text-blue-600 dark:hover:text-blue-400
                           transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                           [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label={t('nextMonth')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500
                         dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {(t('daysShort') as unknown as string[]).map((d: string) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} />;
              }
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isTodayDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  aria-label={formatDateLocalized(day, months)}
                  aria-pressed={isSelected}
                  className={`relative flex items-center justify-center h-8 w-full rounded-lg text-sm
                              font-medium transition-all duration-100
                              ${isSelected
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                : isTodayDay
                                ? 'text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300'
                              }`}
                >
                  {day.getDate()}
                  {/* Today indicator dot */}
                  {isTodayDay && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer: jump to today */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                handleDayClick(today);
              }}
              className="w-full text-xs text-center text-blue-600 dark:text-blue-400 font-medium
                         hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1
                         hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
            >
              {t('goToToday')} — {formatDateLocalized(today, months)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
