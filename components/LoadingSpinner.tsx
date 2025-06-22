
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin-slow border-brand-blue">
      </div>
      <p className="mt-4 text-xl text-app-text-primary">Generating Summary...</p>
      <p className="text-sm text-app-text-secondary">Please wait while we process the insights.</p>
    </div>
  );
};