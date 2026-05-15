import { useState } from 'react';
import DocumentEditor from './components/DocumentEditor';
import ReferencesManager from './components/ReferencesManager';
import type { Reference } from './components/ReferencesManager';
import { exportToDocx } from './utils/docxExport';
import { BookOpen, FileText, Download } from 'lucide-react';

function App() {
  const [documentText, setDocumentText] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);

  const handleExport = async () => {
    await exportToDocx(documentText, references);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Formateador APA Pro</h1>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar a Word
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col">
            <div className="flex items-center space-x-2 mb-4 border-b pb-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Documento</h2>
            </div>
            <DocumentEditor text={documentText} setText={setDocumentText} />
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-1">
            <div className="flex items-center space-x-2 mb-4 border-b pb-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Referencias</h2>
            </div>
            <ReferencesManager references={references} setReferences={setReferences} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
