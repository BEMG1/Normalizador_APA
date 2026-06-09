import { useState } from 'react';
import { useReferences, useCitationFormat, useLanguage } from '@/context/AppContext';
import { FORMAT_CONFIGS } from '@/utils/citationFormats';
import {
  Plus, Trash2, ChevronDown, ChevronUp,
  BookOpen, Copy, Check, ArrowUpDown,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type ReferenceType = 'book' | 'article' | 'website' | 'video';

export interface Reference {
  id: string;
  type: ReferenceType;
  author: string;
  year: string;
  title: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  siteName?: string;
  channel?: string;
}

export const getYear = (year: string, lang?: string): string => year.trim() || (lang === 'en' ? 'n.d.' : 's.f.');
const getYearError = (year: string): string | undefined => {
  const trimmed = year.trim();
  if (!trimmed) return undefined;
  // Match 4-digit years or "s.f.", optionally followed by date details in APA format
  const regex = /^(?:([12]\d{3})|s\.?\s*f\.?)(?:,.*)?$/i;
  const match = trimmed.match(regex);
  if (!match) {
    return 'Formato no válido (ej. 2023 o s.f.)';
  }
  const yearStr = match[1];
  if (yearStr) {
    const yearVal = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();
    if (yearVal > currentYear) {
      return `El año no puede ser superior al actual (${currentYear})`;
    }
  }
  return undefined;
};

/**
 * Returns a plain-text reference using the *default* APA 7 formatter.
 * Used in docxExport as a safe fallback and in legacy call sites.
 * For format-aware rendering, prefer `useCitationFormat().formatter.formatReference(ref)`.
 */
import { es, en } from '@/i18n';

const tText = (key: keyof typeof es, lang?: string): string => ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

export const getReferenceText = (ref: Reference, lang?: string): string => {
  const author = ref.author || tText('unknownAuthor', lang);
  const year = getYear(ref.year, lang);
  const title = ref.title || tText('unknownTitle', lang);

  switch (ref.type) {
    case 'book':
      return `${author} (${year}). ${title}. ${ref.publisher || `[${tText('publisher', lang)}]`}.`;
    case 'article': {
      const journal = ref.journal || `[${tText('journalName', lang)}]`;
      const volume = ref.volume || `[${tText('volume', lang)}]`;
      const issue = ref.issue ? `(${ref.issue})` : '';
      const pages = ref.pages ? `, ${ref.pages}` : '';
      const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
      return `${author} (${year}). ${title}. ${journal}, ${volume}${issue}${pages}.${doi}`;
    }
    case 'website':
      return `${author} (${year}). ${title}. ${ref.siteName || `[${tText('siteName', lang)}]`}. ${ref.url || '[URL]'}`;
    case 'video':
      return `${author} (${year}). ${title} [Video]. ${ref.channel || `[${tText('channelName', lang)}]`}. ${ref.url || '[URL]'}`;
    default:
      return tText('incompleteReferenceFallback', lang);
  }
};

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  colSpan?: boolean;
  error?: string;
}

const Field: React.FC<FieldProps> = ({ label, hint, value, onChange, placeholder, colSpan, error }) => (
  <div className={colSpan ? 'sm:col-span-2' : ''}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {hint && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">{hint}</span>
      )}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full sm:text-sm border rounded-md px-3 py-2 outline-none transition-colors ${
        error
          ? 'border-red-300 dark:border-red-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10 text-gray-900 dark:text-gray-100'
          : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }`}
      placeholder={placeholder}
    />
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">
        {error}
      </p>
    )}
  </div>
);

const ReferencesManager: React.FC = () => {
  const { references, setReferences } = useReferences();
  const { citationFormat, formatter } = useCitationFormat();
  const { language, t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSorted, setIsSorted] = useState(false);

  const addReference = () => {
    const newRef: Reference = {
      id: crypto.randomUUID(),
      type: 'book',
      author: '',
      year: '',
      title: '',
    };
    setReferences((prev) => [...prev, newRef]);
    setExpandedId(newRef.id);
  };

  const removeReference = (id: string) => {
    setReferences((prev) => prev.filter((ref) => ref.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateReference = (id: string, field: keyof Reference, value: string) => {
    setReferences((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, [field]: value } : ref))
    );
  };

  const handleCopy = async (ref: Reference) => {
    await navigator.clipboard.writeText(formatter.formatReference(ref, language));
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sort: alphabetical for APA, keep insertion order for IEEE
  const displayRefs =
    isSorted && formatter.sortMode === 'alphabetical'
      ? [...references].sort((a, b) => a.author.localeCompare(b.author, 'es'))
      : references;

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <button
          onClick={addReference}
          className="flex-1 flex justify-center items-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
          {t('addReference')}
        </button>
        {references.length > 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsSorted(!isSorted)}
                className={`flex items-center px-3 py-2 text-sm rounded-md border transition-colors ${
                  isSorted
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                {t('sortAZ')}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('sortAZTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {isSorted && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 text-center">
          {t('showingExportOrder')}
        </p>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {references.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-600">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('noReferences')}</p>
            <p className="text-xs mt-1">{t('noReferencesHint')}</p>
          </div>
        ) : (
          displayRefs.map((ref, index) => {
            const isIncomplete = !ref.author.trim() || !ref.title.trim();
            return (
              <div
                key={ref.id}
                className={`border rounded-md overflow-hidden bg-white dark:bg-gray-900 shadow-sm ${
                  isIncomplete
                    ? 'border-amber-300 dark:border-amber-800'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div
                  className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
                >
                  <div className="flex-1 truncate mr-2 min-w-0">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100 mr-2">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {ref.author ? `${ref.author} (${getYear(ref.year, language)})` : t('newReference')}
                    </span>
                    {isIncomplete && (
                      <span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                        {t('incompleteRef')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(ref); }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none rounded transition-colors"
                        >
                          {copiedId === ref.id
                            ? <Check className="h-4 w-4 text-green-500" />
                            : <Copy className="h-4 w-4" />
                          }
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('copyRefTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeReference(ref.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('deleteRefTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                    {expandedId === ref.id
                      ? <ChevronUp className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      : <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    }
                  </div>
                </div>

                {expandedId === ref.id && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('sourceType')}
                      </label>
                      <select
                        value={ref.type}
                        onChange={(e) => updateReference(ref.id, 'type', e.target.value as ReferenceType)}
                        className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md transition-colors"
                      >
                        <option value="book">{t('typeBook')}</option>
                        <option value="article">{t('typeArticle')}</option>
                        <option value="website">{t('typeWebsite')}</option>
                        <option value="video">{t('typeVideo')}</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label={t('authors')}
                        hint={t('authorsHint')}
                        value={ref.author}
                        onChange={(v) => updateReference(ref.id, 'author', v)}
                        placeholder={t('authorsPlaceholder')}
                        colSpan
                      />
                      <Field
                        label={t('year')}
                        value={ref.year}
                        onChange={(v) => updateReference(ref.id, 'year', v)}
                        placeholder={t('yearPlaceholder')}
                        error={getYearError(ref.year)}
                      />
                      <Field
                        label={t('title')}
                        value={ref.title}
                        onChange={(v) => updateReference(ref.id, 'title', v)}
                        placeholder={t('titlePlaceholder')}
                        colSpan
                      />

                      {ref.type === 'book' && (
                        <Field
                          label={t('publisher')}
                          value={ref.publisher || ''}
                          onChange={(v) => updateReference(ref.id, 'publisher', v)}
                          placeholder={t('publisherPlaceholder')}
                          colSpan
                        />
                      )}

                      {ref.type === 'article' && (
                        <>
                          <Field
                            label={t('journalName')}
                            value={ref.journal || ''}
                            onChange={(v) => updateReference(ref.id, 'journal', v)}
                            placeholder={t('journalPlaceholder')}
                            colSpan
                          />
                          <Field
                            label={t('volume')}
                            value={ref.volume || ''}
                            onChange={(v) => updateReference(ref.id, 'volume', v)}
                            placeholder="12"
                          />
                          <Field
                            label={t('issue')}
                            value={ref.issue || ''}
                            onChange={(v) => updateReference(ref.id, 'issue', v)}
                            placeholder="4"
                          />
                          <Field
                            label={t('pages')}
                            value={ref.pages || ''}
                            onChange={(v) => updateReference(ref.id, 'pages', v)}
                            placeholder="123-145"
                            colSpan
                          />
                          <Field
                            label={t('doi')}
                            hint={t('doiHint')}
                            value={ref.doi || ''}
                            onChange={(v) => updateReference(ref.id, 'doi', v)}
                            placeholder="10.1016/j.ejemplo.2024.01.001"
                            colSpan
                          />
                        </>
                      )}

                      {(ref.type === 'website' || ref.type === 'video') && (
                        <Field
                          label={t('url')}
                          value={ref.url || ''}
                          onChange={(v) => updateReference(ref.id, 'url', v)}
                          placeholder="https://..."
                          colSpan
                        />
                      )}

                      {ref.type === 'website' && (
                        <Field
                          label={t('siteName')}
                          value={ref.siteName || ''}
                          onChange={(v) => updateReference(ref.id, 'siteName', v)}
                          placeholder={t('siteNamePlaceholder')}
                          colSpan
                        />
                      )}

                      {ref.type === 'video' && (
                        <Field
                          label={t('channelName')}
                          value={ref.channel || ''}
                          onChange={(v) => updateReference(ref.id, 'channel', v)}
                          placeholder={t('channelPlaceholder')}
                          colSpan
                        />
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-md">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1">
                        {t('preview')} · {FORMAT_CONFIGS[citationFormat].label}
                      </p>
                      <p
                        className="text-sm text-gray-800 dark:text-gray-200 font-serif"
                        style={{ paddingLeft: '2em', textIndent: '-2em' }}
                      >
                        {formatter.formatReferenceJSX(ref, language)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReferencesManager;
