import React, { useState } from 'react';
import { WombaIcon, BellIcon, BellSlashIcon, EyeIcon, EyeSlashIcon, ChevronLeftIcon } from './icons';

const quotes = [
    "It's not a bug, it's an undocumented feature.",
    "QA is 1% testing, 99% convincing developers they broke something.",
    "Why did the QA engineer cross the road? To test it, of course.",
    "To err is human; to blame the developer is QA.",
    "Found a bug. Closed as 'works on my machine'.",
    "Sleep is for the weak. And for people without release deadlines.",
    "One person's 'annoying' is another person's 'edge case'.",
    "I'm not saying you're wrong, I'm just saying the test case passed.",
    "If at first you don't succeed, call it version 1.0.",
    "The best way to get a bug fixed is to tell a developer it's their fault.",
    "QA Engineer: a person who looks for trouble, finds it everywhere, and gets paid for it."
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

interface HeaderProps {
    showNotifications?: boolean;
    onToggleNotifications?: () => void;
    highlightAssertions?: boolean;
    onToggleHighlightAssertions?: () => void;
    onBackToSearch?: () => void;
    hideActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    showNotifications, 
    onToggleNotifications, 
    highlightAssertions, 
    onToggleHighlightAssertions,
    onBackToSearch,
    hideActions = false 
}) => {
  const [quote] = useState(getRandomQuote);

  const TooltipButton: React.FC<{onClick: () => void; ariaLabel: string; tooltipText: string; children: React.ReactNode;}> = ({onClick, ariaLabel, tooltipText, children}) => (
    <div className="relative group">
        <button 
            onClick={onClick} 
            className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label={ariaLabel}
        >
            {children}
        </button>
        <span className="absolute whitespace-nowrap top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-700 text-slate-100 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltipText}
        </span>
    </div>
  );

  return (
    <header className="bg-slate-900/70 backdrop-blur-lg sticky top-0 z-10">
      <div className="container max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex-1">
            {onBackToSearch && (
                 <button onClick={onBackToSearch} className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>Back to Search</span>
                </button>
            )}
        </div>
        <div className="flex-1 flex justify-center">
            <div className="text-center">
                <div className="flex items-center justify-center space-x-3">
                    <WombaIcon className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-100">
                        <span className="text-indigo-400">Womba</span> Watcher
                    </h1>
                </div>
                <p className="text-xs text-slate-400 italic mt-1 hidden md:block">"{quote}"</p>
            </div>
        </div>
        <div className="flex-1 flex justify-end items-center space-x-2">
            {!hideActions && onToggleHighlightAssertions && (
                 <TooltipButton
                    onClick={onToggleHighlightAssertions}
                    ariaLabel={highlightAssertions ? "Disable assertion highlighting" : "Enable assertion highlighting"}
                    tooltipText={highlightAssertions ? "Disable Assertion Highlighting" : "Enable Assertion Highlighting"}
                >
                    {highlightAssertions ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                </TooltipButton>
            )}
            {!hideActions && onToggleNotifications && (
                <TooltipButton
                    onClick={onToggleNotifications}
                    ariaLabel={showNotifications ? "Disable notifications" : "Enable notifications"}
                    tooltipText={showNotifications ? "Disable Notifications" : "Enable Notifications"}
                >
                    {showNotifications ? <BellIcon className="w-5 h-5" /> : <BellSlashIcon className="w-5 h-5" />}
                </TooltipButton>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
