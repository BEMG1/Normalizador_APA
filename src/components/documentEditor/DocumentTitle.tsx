import React, { useState, useRef, useEffect } from 'react';
import { useDocument } from '@/context/AppContext';
import { FileText, Edit2 } from 'lucide-react';
import { useLanguage } from '@/context/AppContext';

const DocumentTitle: React.FC = () => {
  const { documentTitle, setDocumentTitle } = useDocument();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(documentTitle);
  }, [documentTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempTitle.trim()) {
      setDocumentTitle(tempTitle.trim());
    } else {
      setTempTitle(documentTitle); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempTitle(documentTitle);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 shrink-0 group">
      <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="text-lg font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full max-w-sm"
        />
      ) : (
        <div 
          className="flex items-center cursor-pointer max-w-sm"
          onClick={() => setIsEditing(true)}
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {documentTitle || t('documentTitle')}
          </h2>
          <Edit2 className="h-4 w-4 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
};

export default DocumentTitle;
