import React, { useState, useEffect } from 'react';
import { WombaIcon, DatabaseIcon, UploadIcon } from './icons';

interface SidebarProps {
  activeView: 'generation' | 'rag' | 'config' | 'stats';
  onViewChange: (view: 'generation' | 'rag' | 'config' | 'stats') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  // Load collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };
  const SidebarButton: React.FC<{ 
    view: 'generation' | 'rag' | 'config' | 'stats'; 
    icon: React.ReactNode;
    children: React.ReactNode 
  }> = ({ view, icon, children }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => onViewChange(view)}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 text-sm font-medium transition-all duration-300 relative group ${
          isActive
            ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500'
            : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 border-l-4 border-transparent'
        }`}
        title={isCollapsed ? String(children) : ''}
      >
        <span className="w-5 h-5 flex-shrink-0">{icon}</span>
        {!isCollapsed && <span>{children}</span>}
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-slate-200 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {children}
          </div>
        )}
      </button>
    );
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col z-30 transition-all duration-300`}>
      {/* Branding & Toggle */}
      <div className="p-4 border-b border-slate-800">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <WombaIcon className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="text-lg font-bold text-slate-100">
                  <span className="text-indigo-400">Womba</span>
                </h1>
                <p className="text-xs text-slate-400">AI Test Platform</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <WombaIcon className="w-6 h-6 text-indigo-500" />
          )}
          
          {/* Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="mt-3 w-full p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <SidebarButton 
          view="generation" 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          Test Generation
        </SidebarButton>
        
        <SidebarButton 
          view="rag" 
          icon={<DatabaseIcon className="w-5 h-5" />}
        >
          RAG Management
        </SidebarButton>
        
        <SidebarButton 
          view="stats" 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        >
          Statistics
        </SidebarButton>
        
        <SidebarButton 
          view="config" 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          Configuration
        </SidebarButton>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        {!isCollapsed && (
          <p className="text-xs text-slate-500 text-center">
            Powered by AI
          </p>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
