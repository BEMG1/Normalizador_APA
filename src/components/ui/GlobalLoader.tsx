import React from 'react';
import { Loader2 } from 'lucide-react';

const GlobalLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
      <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
        Cargando recursos...
      </p>
    </div>
  );
};

export default GlobalLoader;
