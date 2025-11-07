import React from 'react';
import { LoadingSpinner } from './icons';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = 'Generating test plan...' }) => {
  return (
    <div className="fixed top-6 right-6 z-40 animate-slide-in-right">
      <div className="bg-slate-800/90 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700 p-4 min-w-[200px]">
        <div className="flex items-center space-x-3">
          <LoadingSpinner className="w-5 h-5 text-indigo-400" />
          <div>
            <p className="text-sm font-medium text-slate-200">{message}</p>
            <p className="text-xs text-slate-400 mt-0.5">This may take a moment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;

