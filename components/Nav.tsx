import React from 'react';
import { WombaIcon } from './icons';

interface NavProps {
  activeView: 'generation' | 'rag';
  onViewChange: (view: 'generation' | 'rag') => void;
}

const Nav: React.FC<NavProps> = ({ activeView, onViewChange }) => {
  const NavButton: React.FC<{ view: 'generation' | 'rag'; children: React.ReactNode }> = ({ view, children }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => onViewChange(view)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <header className="bg-slate-900/70 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-800">
      <div className="container max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <WombaIcon className="w-8 h-8 text-indigo-500" />
          <h1 className="text-xl font-bold text-slate-100 hidden sm:block">
            <span className="text-indigo-400">Womba</span> Platform
          </h1>
        </div>
        <nav className="flex items-center space-x-2">
          <NavButton view="generation">Test Generation</NavButton>
          <NavButton view="rag">RAG Management</NavButton>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
