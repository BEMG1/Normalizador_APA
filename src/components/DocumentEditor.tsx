import { useRef, useState } from 'react';
import mammoth from 'mammoth';
import { Upload } from 'lucide-react';

interface DocumentEditorProps {
  text: string;
  setText: (text: string) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ text, setText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setText(result.value);
    } catch (error) {
      console.error("Error extracting text from Word document", error);
      alert("Hubo un error al leer el documento de Word.");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  return (
    <div className="flex flex-col h-full flex-1">
      <div className="mb-4">
        <input
          type="file"
          accept=".docx"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="h-4 w-4 mr-2 text-gray-500" />
          {isLoading ? 'Cargando...' : 'Subir documento Word (.docx)'}
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Sube un archivo .docx existente para comenzar a editarlo, o escribe directamente abajo.
        </p>
      </div>

      <textarea
        className="flex-1 w-full min-h-[400px] p-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-serif text-base leading-relaxed resize-y"
        placeholder="Escribe o edita el texto de tu documento aquí..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          whiteSpace: 'pre-wrap',
        }}
      />
    </div>
  );
};

export default DocumentEditor;
