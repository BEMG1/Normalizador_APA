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
    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)', fontFamily: 'var(--ui-font)' }}>
      {label}
      {hint && <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-3)' }}>{hint}</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full sm:text-sm rounded-md px-3 py-2 outline-none transition-colors"
      style={{
        border: `1px solid ${error ? 'var(--err)' : 'var(--border)'}`,
        background: 'var(--surface-2)',
        color: 'var(--text)',
        fontFamily: 'var(--ui-font)',
      }}
      placeholder={placeholder}
    />
    {error && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--err)' }}>{error}</p>}
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
          className="flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={{ border: '2px dashed var(--border)', background: 'var(--surface)', color: 'var(--text-2)', fontFamily: 'var(--ui-font)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
        >
          <Plus size={16} strokeWidth={1.6} className="mr-2" style={{ color: 'var(--text-3)' }} />
          {t('addReference')}
        </button>
        {references.length > 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsSorted(!isSorted)}
                className="btn-nj sm"
              style={isSorted ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' } : {}}
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
        <p className="text-xs mb-3 text-center" style={{ color: 'var(--accent)', fontFamily: 'var(--mono-font)' }}>
          {t('showingExportOrder')}
        </p>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {references.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-3)' }}>
            <BookOpen size={36} strokeWidth={1.4} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('noReferences')}</p>
            <p className="text-xs mt-1">{t('noReferencesHint')}</p>
          </div>
        ) : (
          displayRefs.map((ref, index) => {
            const isIncomplete = !ref.author.trim() || !ref.title.trim();
            return (
              <div
                key={ref.id}
                className="rounded-md overflow-hidden"
                style={{ border: `1px solid ${isIncomplete ? 'var(--warn)' : 'var(--border)'}`, background: 'var(--surface)' }}
              >
                <div
                  className="flex justify-between items-center px-4 py-3 cursor-pointer transition-colors"
                  style={{ background: 'var(--surface-2)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                  onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
                >
                  <div className="flex-1 truncate mr-2 min-w-0">
                    <span className="font-medium text-sm mr-2" style={{ color: 'var(--text-3)', fontFamily: 'var(--mono-font)' }}>
                      #{index + 1}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                      {ref.author ? `${ref.author} (${getYear(ref.year, language)})` : t('newReference')}
                    </span>
                    {isIncomplete && (
                      <span className="ml-2 text-xs font-medium" style={{ color: 'var(--warn)' }}>
                        {t('incompleteRef')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(ref); }} className="ib-nj" style={{ width: 28, height: 28 }}>
                          {copiedId === ref.id
                            ? <Check size={13} strokeWidth={1.6} style={{ color: 'var(--ok)' }} />
                            : <Copy size={13} strokeWidth={1.6} />
                          }
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('copyRefTooltip')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => { e.stopPropagation(); removeReference(ref.id); }} className="ib-nj" style={{ width: 28, height: 28 }}>
                          <Trash2 size={13} strokeWidth={1.6} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('deleteRefTooltip')}</p></TooltipContent>
                    </Tooltip>
                    {expandedId === ref.id
                      ? <ChevronUp size={16} strokeWidth={1.6} style={{ color: 'var(--text-3)' }} />
                      : <ChevronDown size={16} strokeWidth={1.6} style={{ color: 'var(--text-3)' }} />
                    }
                  </div>
                </div>

                {expandedId === ref.id && (
                  <div className="p-4 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)', fontFamily: 'var(--ui-font)' }}>
                        {t('sourceType')}
                      </label>
                      <select
                        value={ref.type}
                        onChange={(e) => updateReference(ref.id, 'type', e.target.value as ReferenceType)}
                        className="block w-full pl-3 pr-10 py-2 text-sm rounded-md outline-none transition-colors"
                        style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'var(--ui-font)' }}
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

                    <div className="mt-4 p-3 rounded-md" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)', fontFamily: 'var(--mono-font)' }}>
                        {t('preview')} · {FORMAT_CONFIGS[citationFormat].label}
                      </p>
                      <p className="text-sm" style={{ paddingLeft: '2em', textIndent: '-2em', color: 'var(--text)', fontFamily: 'var(--doc-font)' }}>
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
