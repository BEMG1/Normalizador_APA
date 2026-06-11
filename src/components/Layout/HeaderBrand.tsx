import React from 'react';
import { useLanguage } from '@/context/AppContext';

export const HeaderBrand: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo */}
      <img
        src="images/citara-icon-512-amber.png"
        alt="Citara"
        className="shrink-0 select-none"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          boxShadow: '0 0 0 1.5px var(--border), 0 0 0 3px var(--surface-2)',
        }}
      />

      {/* App name */}
      <span
        style={{
          fontFamily: 'var(--brand-font)',
          fontSize: 19,
          letterSpacing: '-.01em',
          color: 'var(--text)',
        }}
      >
        {t('appTitle')}
      </span>
    </div>
  );
};
