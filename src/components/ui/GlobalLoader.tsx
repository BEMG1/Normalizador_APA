import React from 'react';
import { Loader2 } from 'lucide-react';

const GlobalLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
      <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-2)' }}>
        Cargando recursos...
      </p>
    </div>
  );
};

export default GlobalLoader;
