import React from 'react';
import { LoadingSpinner } from './icons';

interface ActionBarProps {
  selectedCount: number;
  onUpload: () => void;
  isUploading: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({ selectedCount, onUpload, isUploading }) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 z-20">
      <div className="container max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`transition-all duration-200 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${hasSelection ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {selectedCount}
          </div>
          <span className="font-medium text-slate-300">
            test case{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          onClick={onUpload}
          disabled={!hasSelection || isUploading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-400 shadow-lg hover:shadow-indigo-500/50 disabled:shadow-none disabled:translate-y-0"
        >
          {isUploading ? (
            <>
              <LoadingSpinner className="w-5 h-5 mr-2" />
              Uploading...
            </>
          ) : (
            'Configure Test Cycle'
          )}
        </button>
      </div>
    </div>
  );
};

export default ActionBar;