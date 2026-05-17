import { useRef, useState } from 'react';
import mammoth from 'mammoth';
import { Upload, Trash2 } from 'lucide-react';
import { useDocument } from '@/context/AppContext';

type FormatType = 'h1' | 'h2' | 'h3' | 'p';

const DocumentEditor: React.FC = () => {
  const {
    documentText: text,
    setDocumentText: setText,
    setUploadedFileName: onFileNameChange,
  } = useDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeFormat, setActiveFormat] = useState<FormatType>('p');

  // --- Format detection & application ---

  const detectFormat = (pos: number): FormatType => {
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
    const line = text.slice(lineStart);
    if (line.startsWith('### ')) return 'h3';
    if (line.startsWith('## ')) return 'h2';
    if (line.startsWith('# ')) return 'h1';
    return 'p';
  };

  const handleCursorChange = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    setActiveFormat(detectFormat(ta.selectionStart));
  };

  const applyFormat = (format: FormatType) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const pos = ta.selectionStart;
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = text.indexOf('\n', pos);
    const end = lineEnd === -1 ? text.length : lineEnd;

    const currentLine = text.slice(lineStart, end);
    const stripped = currentLine.replace(/^#{1,3} /, '');
    const prefixes: Record<FormatType, string> = { h1: '# ', h2: '## ', h3: '### ', p: '' };
    const newLine = prefixes[format] + stripped;

    setText(text.slice(0, lineStart) + newLine + text.slice(end));
    setActiveFormat(format);

    const newPos = Math.max(lineStart, pos + (newLine.length - currentLine.length));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // --- File handling ---

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      alert('Solo se aceptan archivos .docx');
      return;
    }
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const doc = new DOMParser().parseFromString(result.value, 'text/html');
      const lines: string[] = [];
      doc.body.childNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as Element;
        const text = el.textContent?.trim() || '';
        if (!text) return;
        switch (el.tagName.toLowerCase()) {
          case 'h1': lines.push(`# ${text}`); break;
          case 'h2': lines.push(`## ${text}`); break;
          case 'h3': lines.push(`### ${text}`); break;
          default: lines.push(text);
        }
      });
      setText(lines.join('\n\n'));
      const baseName = file.name.slice(0, -5); // remove '.docx'
      onFileNameChange?.(baseName);
    } catch (error) {
      console.error('Error extracting text from Word document', error);
      alert('Hubo un error al leer el documento de Word.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleClear = () => {
    if (confirm('¿Borrar todo el texto del documento?')) {
      setText('');
      onFileNameChange?.(null);
    }
  };

  // --- Toolbar helpers ---

  const btnBase = 'px-2 py-1 text-xs font-mono font-bold border rounded transition-colors';
  const btnIdle = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
  const btnActive = 'border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';

  const toolbarBtn = (label: string, format: FormatType) => (
    <button
      key={format}
      onMouseDown={(e) => { e.preventDefault(); applyFormat(format); }}
      className={`${btnBase} ${activeFormat === format ? btnActive : btnIdle}`}
      title={`Aplicar ${label}`}
    >
      {label}
    </button>
  );

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Upload row */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
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
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            {isLoading ? 'Cargando...' : 'Subir .docx'}
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            o arrastrá el archivo al editor
          </span>
        </div>

        {text && (
          <button
            onClick={handleClear}
            className="inline-flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors border border-red-200 dark:border-red-900"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Format toolbar */}
      <div className="mb-1 flex items-center gap-1">
        {toolbarBtn('H1', 'h1')}
        {toolbarBtn('H2', 'h2')}
        {toolbarBtn('H3', 'h3')}
        <span className="text-gray-300 dark:text-gray-600 select-none px-0.5">|</span>
        {toolbarBtn('¶', 'p')}
      </div>

      {/* Editor area */}
      <div className="relative flex-1">
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-blue-500 rounded-md bg-blue-50/80 dark:bg-blue-950/80 pointer-events-none">
            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
              Suelta el .docx aquí
            </p>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="w-full h-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-serif text-base leading-relaxed resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          placeholder="Escribe o edita el texto de tu documento aquí..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSelect={handleCursorChange}
          onClick={handleCursorChange}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between flex-wrap gap-1">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {wordCount} palabras · {charCount} caracteres
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          # Título 1 &nbsp;·&nbsp; ## Título 2 &nbsp;·&nbsp; ### Título 3
        </p>
      </div>
    </div>
  );
};

export default DocumentEditor;
