import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export type ReferenceType = 'book' | 'article' | 'website' | 'video';

export interface Reference {
  id: string;
  type: ReferenceType;
  author: string;
  year: string;
  title: string;
  publisher?: string; // For book
  journal?: string; // For article
  volume?: string; // For article
  issue?: string; // For article
  pages?: string; // For article
  url?: string; // For website/video
  siteName?: string; // For website
  channel?: string; // For video
}

interface ReferencesManagerProps {
  references: Reference[];
  setReferences: (refs: Reference[] | ((prev: Reference[]) => Reference[])) => void;
}

const ReferencesManager: React.FC<ReferencesManagerProps> = ({ references, setReferences }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const generatePreview = (ref: Reference) => {
    // Basic APA 7th Edition preview (simplified)
    const author = ref.author || '[Autor]';
    const year = ref.year || '[Año]';
    const title = ref.title || '[Título]';

    if (ref.type === 'book') {
      const publisher = ref.publisher || '[Editorial]';
      return (
        <span>
          {author} ({year}). <em>{title}</em>. {publisher}.
        </span>
      );
    } else if (ref.type === 'article') {
      const journal = ref.journal || '[Revista]';
      const volume = ref.volume ? `<i>${ref.volume}</i>` : '[Volumen]';
      const issue = ref.issue ? `(${ref.issue})` : '';
      const pages = ref.pages ? `, ${ref.pages}` : '';
      return (
        <span dangerouslySetInnerHTML={{
          __html: `${author} (${year}). ${title}. <em>${journal}</em>, ${volume}${issue}${pages}.`
        }} />
      );
    } else if (ref.type === 'website') {
      const siteName = ref.siteName || '[Nombre del Sitio]';
      const url = ref.url || '[URL]';
      return (
        <span>
          {author} ({year}). <em>{title}</em>. {siteName}. {url}
        </span>
      );
    } else if (ref.type === 'video') {
      const channel = ref.channel || '[Canal]';
      const videoUrl = ref.url || '[URL]';
      return (
        <span>
          {author} ({year}). <em>{title}</em> [Video]. {channel}. {videoUrl}
        </span>
      );
    } else {
      return <span>Referencia incompleta</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={addReference}
        className="w-full flex justify-center items-center px-4 py-2 border-2 border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2 text-gray-400" />
        Agregar Referencia
      </button>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {references.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No hay referencias aún. Haz clic en el botón arriba para comenzar a agregar.
          </div>
        ) : (
          references.map((ref, index) => (
            <div key={ref.id} className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
              <div 
                className="flex justify-between items-center px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
              >
                <div className="flex-1 truncate mr-4">
                  <span className="font-medium text-sm text-gray-900 mr-2">#{index + 1}</span>
                  <span className="text-sm text-gray-600 truncate">
                    {ref.author ? `${ref.author} (${ref.year || '?'})` : 'Nueva referencia'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeReference(ref.id); }}
                    className="p-1 text-gray-400 hover:text-red-500 focus:outline-none rounded"
                    title="Eliminar referencia"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {expandedId === ref.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === ref.id && (
                <div className="p-4 border-t border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Fuente</label>
                    <select
                      value={ref.type}
                      onChange={(e) => updateReference(ref.id, 'type', e.target.value as ReferenceType)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                    >
                      <option value="book">Libro</option>
                      <option value="article">Artículo de Revista</option>
                      <option value="website">Página Web</option>
                      <option value="video">Video (YouTube, etc.)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Autor(es) <span className="text-xs text-gray-500 font-normal">(Ej. Apellido, A., & Apellido, B.)</span></label>
                      <input
                        type="text"
                        value={ref.author}
                        onChange={(e) => updateReference(ref.id, 'author', e.target.value)}
                        className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                        placeholder="Pérez, J."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                      <input
                        type="text"
                        value={ref.year}
                        onChange={(e) => updateReference(ref.id, 'year', e.target.value)}
                        className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                        placeholder="2023"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={ref.title}
                        onChange={(e) => updateReference(ref.id, 'title', e.target.value)}
                        className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                        placeholder="Título del trabajo"
                      />
                    </div>

                    {ref.type === 'book' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
                        <input
                          type="text"
                          value={ref.publisher || ''}
                          onChange={(e) => updateReference(ref.id, 'publisher', e.target.value)}
                          className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                          placeholder="Nombre de la Editorial"
                        />
                      </div>
                    )}

                    {ref.type === 'article' && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Revista</label>
                          <input
                            type="text"
                            value={ref.journal || ''}
                            onChange={(e) => updateReference(ref.id, 'journal', e.target.value)}
                            className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            placeholder="Revista de Psicología"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Volumen</label>
                          <input
                            type="text"
                            value={ref.volume || ''}
                            onChange={(e) => updateReference(ref.id, 'volume', e.target.value)}
                            className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            placeholder="12"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Número (Issue)</label>
                          <input
                            type="text"
                            value={ref.issue || ''}
                            onChange={(e) => updateReference(ref.id, 'issue', e.target.value)}
                            className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            placeholder="4"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Páginas</label>
                          <input
                            type="text"
                            value={ref.pages || ''}
                            onChange={(e) => updateReference(ref.id, 'pages', e.target.value)}
                            className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            placeholder="123-145"
                          />
                        </div>
                      </>
                    )}

                    {(ref.type === 'website' || ref.type === 'video') && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                        <input
                          type="text"
                          value={ref.url || ''}
                          onChange={(e) => updateReference(ref.id, 'url', e.target.value)}
                          className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    {ref.type === 'website' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Sitio Web</label>
                        <input
                          type="text"
                          value={ref.siteName || ''}
                          onChange={(e) => updateReference(ref.id, 'siteName', e.target.value)}
                          className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                          placeholder="Wikipedia, OMS, etc."
                        />
                      </div>
                    )}

                    {ref.type === 'video' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Canal o Autor del Video</label>
                        <input
                          type="text"
                          value={ref.channel || ''}
                          onChange={(e) => updateReference(ref.id, 'channel', e.target.value)}
                          className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                          placeholder="Nombre del canal de YouTube"
                        />
                      </div>
                    )}
                  </div>

                  {/* Preview Box */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Vista previa APA</p>
                    <p className="text-sm text-gray-800 font-serif" style={{ paddingLeft: '2em', textIndent: '-2em' }}>
                      {generatePreview(ref)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReferencesManager;
