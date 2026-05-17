import { useState, useEffect } from 'react';
import DocumentEditor from './components/DocumentEditor';
import ReferencesManager from './components/ReferencesManager';
import type { Reference } from './components/ReferencesManager';
import { exportToDocx } from './utils/docxExport';
import { BookOpen, FileText, Download, Moon, Sun, AlertTriangle } from 'lucide-react';

function App() {
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [documentText, setDocumentText] = useState<string>(() => {
    try { return localStorage.getItem('documentText') || ''; } catch { return ''; }
  });
  const [references, setReferences] = useState<Reference[]>(() => {
    try { return JSON.parse(localStorage.getItem('references') || '[]'); } catch { return []; }
  });
  const [showExportWarning, setShowExportWarning] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    try { localStorage.setItem('documentText', documentText); } catch {}
  }, [documentText]);

  useEffect(() => {
    try { localStorage.setItem('references', JSON.stringify(references)); } catch {}
  }, [references]);

  const handleExportClick = () => {
    const hasIncomplete = references.some(
      (ref) => !ref.author.trim() || !ref.title.trim()
    );
    if (hasIncomplete) {
      setShowExportWarning(true);
    } else {
      exportToDocx(documentText, references);
    }
  };

  const handleExportAnyway = async () => {
    setShowExportWarning(false);
    await exportToDocx(documentText, references);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {showExportWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-amber-300 dark:border-amber-700">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Referencias incompletas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Hay referencias sin autor o título. El documento exportado tendrá campos vacíos.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExportAnyway}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Exportar igual
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Normalizador APA
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                7ª Edición · Alfa
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleExportClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar a Word
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex-1 flex flex-col">
            <div className="flex items-center space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Documento</h2>
            </div>
            <DocumentEditor text={documentText} setText={setDocumentText} />
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex-1">
            <div className="flex items-center space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Referencias</h2>
            </div>
            <ReferencesManager references={references} setReferences={setReferences} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
