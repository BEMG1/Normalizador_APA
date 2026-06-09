import { useRef, useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { Upload, Trash2, Link as LinkIcon, Unlink, ChevronDown, BookOpen } from 'lucide-react';
import { useDocument, useReferences, useLanguage } from '@/context/AppContext';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { ReferenceMark } from './ReferenceMark';
import { getReferenceText, type Reference, getYear } from '@/components/References/ReferencesManager';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
const DocumentEditor: React.FC = () => {
  const {
    documentText: text,
    setDocumentText: setText,
    setUploadedFileName: onFileNameChange,
  } = useDocument();
  const { references } = useReferences();
  const { t, language } = useLanguage();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Tooltip state
  const [hoverInfo, setHoverInfo] = useState<{ ref: Reference; x: number; y: number } | null>(null);
  
  // Custom dropdown state for BubbleMenu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ReferenceMark,
    ],
    content: text,
    onUpdate: ({ editor }) => {
      setText(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4 text-gray-900 dark:text-gray-100 font-serif',
      },
    },
  });

  // Handle hover tooltips
  useEffect(() => {
    if (!editorContainerRef.current) return;
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const refMark = target.closest('[data-reference-id]');
      if (refMark) {
        const id = refMark.getAttribute('data-reference-id');
        const reference = references.find((r) => r.id === id);
        if (reference) {
          setHoverInfo({
            ref: reference,
            x: e.clientX,
            y: e.clientY,
          });
          return;
        }
      }
      setHoverInfo(null);
    };

    const el = editorContainerRef.current;
    el.addEventListener('mousemove', handleMouseOver);
    // Remove tooltip when mouse leaves the editor container
    const handleMouseLeave = () => setHoverInfo(null);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseOver);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [references]);

  // Clean up orphaned reference marks when references are deleted from the manager
  useEffect(() => {
    if (!editor) return;

    const currentRefIds = new Set(references.map((r) => r.id));
    const { tr } = editor.state;
    let hasChanges = false;

    editor.state.doc.descendants((node, pos) => {
      if (node.marks && node.marks.length > 0) {
        node.marks.forEach((mark) => {
          if (mark.type.name === 'reference') {
            const id = mark.attrs.id;
            if (id && !currentRefIds.has(id)) {
              tr.removeMark(pos, pos + node.nodeSize, mark);
              hasChanges = true;
            }
          }
        });
      }
    });

    if (hasChanges) {
      editor.view.dispatch(tr);
    }
  }, [references, editor]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown when selection changes
  useEffect(() => {
    if (!editor) return;
    const handleSelectionUpdate = () => {
      setIsDropdownOpen(false);
    };
    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // Handle external text updates (like from localStorage on load)
  useEffect(() => {
    if (editor && !editor.isDestroyed && text && editor.getHTML() !== text) {
      // Only set content if the editor is empty or on initial load to avoid jumping cursor
      if (editor.isEmpty) {
        editor.commands.setContent(text);
      }
    }
  }, [editor, text]);

  // --- File handling ---

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      alert(t('onlyDocxAllowed'));
      return;
    }
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Mammoth converts DOCX to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (editor) {
        editor.commands.setContent(result.value);
        setText(editor.getHTML());
      }
      
      const baseName = file.name.slice(0, -5); // remove '.docx'
      onFileNameChange?.(baseName);
    } catch (error) {
      console.error('Error extracting text from Word document', error);
      alert(t('errorReadingWord'));
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
    if (confirm(t('clearDocumentPrompt'))) {
      if (editor) {
        editor.commands.clearContent();
      }
      setText('');
      onFileNameChange?.(null);
    }
  };

  // --- Toolbar helpers ---

  const btnBase = 'px-2 py-1 text-xs font-mono font-bold border rounded transition-colors';
  const btnIdle = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
  const btnActive = 'border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';

  if (!editor) {
    return null;
  }

  // Bubble menu states
  const isActiveRef = editor.isActive('reference');

  return (
    <div className="flex flex-col h-full flex-1 relative" ref={editorContainerRef}>
      {/* Tooltip Quick View */}
      {hoverInfo && (
        <div
          className="fixed z-50 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm pointer-events-none transform -translate-x-1/2 translate-y-4"
          style={{ top: hoverInfo.y, left: hoverInfo.x }}
        >
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            {t('associatedSource')}
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-serif">
            {getReferenceText(hoverInfo.ref, language)}
          </p>
        </div>
      )}

      {/* Bubble Menu for Reference Association */}
      <BubbleMenu 
        editor={editor} 
        shouldShow={({ editor, state }) => editor.isFocused && !state.selection.empty}
        className="flex rounded-md shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 gap-1 items-center z-40"
      >
        {isActiveRef ? (
          <>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 flex items-center">
              <LinkIcon className="h-3 w-3 mr-1" />
              {t('linkedReference')}
            </span>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={() => editor.chain().focus().unsetReference().run()}
              className="flex items-center px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <Unlink className="h-3 w-3 mr-1" />
              {t('removeLink')}
            </button>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Keep editor focus
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <LinkIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              {t('associateReference')}
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-1.5 -left-2 sm:left-0 w-[280px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tracking-wider">
                    {t('availableSources')}
                  </span>
                </div>
                
                <div className="max-h-32 overflow-y-auto p-1.5 scrollbar-thin">
                  {references.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('noReferencesCreated')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('addSourcesFromPanel')}</p>
                    </div>
                  ) : (
                    references.map((ref) => (
                      <button
                        key={ref.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          editor.chain().focus().setReference(ref.id).run();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all flex flex-col gap-1 group border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50"
                      >
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 line-clamp-1">
                          {ref.author || t('noAuthor')} ({getYear(ref.year, language)})
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                          {ref.title || t('noTitle')}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </BubbleMenu>

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
            {isLoading ? t('loading') : t('uploadDocx')}
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('orDragDrop')}
          </span>
        </div>

        {editor.getText().trim() && (
          <button
            onClick={handleClear}
            className="inline-flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors border border-red-200 dark:border-red-900"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {t('clearDocument')}
          </button>
        )}
      </div>

      {/* Format toolbar */}
      <>
        <div className="mb-1 flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`${btnBase} ${editor.isActive('heading', { level: 1 }) ? btnActive : btnIdle}`}
              >
                H1
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('heading1')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? btnActive : btnIdle}`}
              >
                H2
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('heading2')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`${btnBase} ${editor.isActive('heading', { level: 3 }) ? btnActive : btnIdle}`}
              >
                H3
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('heading3')}</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-gray-300 dark:text-gray-600 select-none px-0.5">|</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`${btnBase} ${editor.isActive('paragraph') ? btnActive : btnIdle}`}
              >
                ¶
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('paragraph')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </>

      {/* Editor area */}
      <div 
        className="relative flex-1 max-h-[70vh] border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 overflow-y-auto scrollbar-thin"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-blue-500 rounded-md bg-blue-50/80 dark:bg-blue-950/80 pointer-events-none">
            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
              {t('dropDocxHere')}
            </p>
          </div>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
      
    </div>
  );
};

export default DocumentEditor;
