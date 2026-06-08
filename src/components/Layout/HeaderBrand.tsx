import React from 'react';
import { useCitationFormat } from '@/context/AppContext';
import { FORMAT_CONFIGS } from '@/utils/citationFormats';

export const HeaderBrand: React.FC = () => {
  const { citationFormat } = useCitationFormat();
  const activeConfig = FORMAT_CONFIGS[citationFormat];

  return (
    <div className="flex items-center space-x-2">
      <img src="images/logo.png" alt="Logo" className="h-8 w-8 shrink-0 object-contain" />
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          Normalizador APA
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
          {activeConfig.subtitle}
        </p>
      </div>
    </div>
  );
};
