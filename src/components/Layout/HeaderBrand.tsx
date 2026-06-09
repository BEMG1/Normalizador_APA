import React from 'react';
import { useCitationFormat, useLanguage } from '@/context/AppContext';

export const HeaderBrand: React.FC = () => {
  const { citationFormat } = useCitationFormat();
  const { t } = useLanguage();

  let subtitleKey = 'appSubtitle';
  if (citationFormat === 'apa7') subtitleKey = 'formatAPA7';
  if (citationFormat === 'apa6') subtitleKey = 'formatAPA6';
  if (citationFormat === 'ieee') subtitleKey = 'formatIEEE';

  return (
    <div className="flex items-center space-x-2">
      <img src="images/logo.png" alt="Logo" className="h-8 w-8 shrink-0 object-contain" />
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {t('appTitle')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
          {t(subtitleKey as any)}
        </p>
      </div>
    </div>
  );
};
