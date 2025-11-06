import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <div className="mt-8 flex items-center justify-center space-x-4">
        <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to previous page"
        >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Previous</span>
        </button>
        <span className="text-sm font-medium text-slate-400">
            Page {currentPage} of {totalPages}
        </span>
        <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to next page"
        >
            <span>Next</span>
            <ChevronRightIcon className="w-4 h-4" />
        </button>
    </div>
  );
};

export default Pagination;
