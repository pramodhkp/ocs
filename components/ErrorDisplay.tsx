
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-lg shadow-md my-8" role="alert">
      <div className="flex items-center">
        <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <strong className="font-bold">Oops! Something went wrong.</strong>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="mt-4 text-right">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors duration-150"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};