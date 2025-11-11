import React, { useState, useEffect, useCallback, useRef } from 'react';
import { JiraStory } from '../types';
import { searchJiraStories } from '../services/testCaseService';
import { useGeneration } from '../contexts/GenerationContext';
import Header from './Header';
import { SearchIcon, LoadingSpinner } from './icons';

const JiraSearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<JiraStory[]>([]);
    const [selectedStory, setSelectedStory] = useState<JiraStory | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [uploadToZephyr, setUploadToZephyr] = useState(false);
    const [projectKey, setProjectKey] = useState('');
    const [folderId, setFolderId] = useState('');
    
    const { startGeneration, isGenerating } = useGeneration();
    
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const dropdownContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!query.trim() || selectedStory?.title === query) {
            setResults([]);
            setIsDropdownVisible(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchJiraStories(query);
                setResults(data);
                setIsDropdownVisible(data.length > 0);
            } catch (error) {
                console.error("Failed to search Jira stories", error);
                setResults([]);
                setIsDropdownVisible(false);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error("Search error details:", errorMessage);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query, selectedStory]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOutside = 
                (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) &&
                (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node));
            
            if (isClickOutside) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedStory(null);
    };
    
    const handleSelectStory = (story: JiraStory) => {
        setSelectedStory(story);
        setQuery(story.title);
        setIsDropdownVisible(false);
    };

    const handleGenerate = async () => {
        if (!selectedStory || isGenerating) return;
        
        await startGeneration(
            selectedStory.id,
            selectedStory.title,
            uploadToZephyr,
            uploadToZephyr ? projectKey : undefined,
            folderId || undefined
        );
    };

    const renderMainButton = () => {
        const isDisabled = !selectedStory || isGenerating;
        const text = isGenerating ? 'Generating Test Plan...' : 'Generate Test Plan';

        return (
            <button
                onClick={handleGenerate}
                disabled={isDisabled}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center transition-all duration-200 ease-in-out hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed disabled:text-slate-200 dark:disabled:text-slate-400 disabled:shadow-none disabled:translate-y-0 text-lg"
            >
                {isGenerating && <LoadingSpinner className="w-5 h-5 mr-3" />}
                {text}
            </button>
        );
    };

    return (
        <>
            <Header hideActions />
            <main className="container max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">Find Jira Story</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Enter a Story ID or keyword to generate a test plan</p>
                </div>

                {/* Search Card with Dropdown */}
                <div className="relative">
                    {/* Search Card */}
                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
                        <div ref={searchContainerRef} className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                <SearchIcon className="w-7 h-7 text-slate-500 dark:text-slate-500" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={handleInputChange}
                                onFocus={() => query.trim() && results.length > 0 && setIsDropdownVisible(true)}
                                placeholder="e.g., PROJ-123 or 'User Authentication'"
                                autoComplete="off"
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl p-5 pl-14 pr-14 text-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                            />
                            {isSearching && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                                    <LoadingSpinner className="w-6 h-6 text-indigo-500" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Results Dropdown - Positioned below search box */}
                    {isDropdownVisible && (
                        <div ref={dropdownContainerRef} className="absolute left-0 right-0 top-[calc(100%+12px)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[100] max-h-96 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                            {/* Results Header */}
                            <div className="sticky top-0 bg-slate-100 dark:bg-slate-900 px-5 py-3 border-b border-slate-200 dark:border-slate-700 z-10">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Found {results.length} {results.length === 1 ? 'story' : 'stories'}
                                </p>
                            </div>

                            {/* Results Container with Scrollbar */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
                                {isSearching ? (
                                    <div className="flex justify-center items-center p-6">
                                        <LoadingSpinner className="w-6 h-6 text-indigo-500" />
                                    </div>
                                ) : results.length > 0 ? (
                                    <ul className="divide-y divide-slate-200 dark:divide-slate-700/50">
                                        {results.map(story => (
                                            <li
                                                key={story.id}
                                                onClick={() => handleSelectStory(story)}
                                                className="p-5 text-left cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-600/10 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{story.title}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                            {story.updated && story.updated !== '' ? new Date(story.updated).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Updated: Unknown'}
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={`https://plainid.atlassian.net/browse/${story.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-slate-400 hover:text-indigo-500 transition-colors relative group/jira ml-4 flex-shrink-0"
                                                        title="Open in Jira"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 0C5.4 0 0 5.4 0 12c0 6.6 5.4 12 12 12s12-5.4 12-12S18.6 0 12 0zm6.6 12c0 3.6-2.7 6.6-6.6 6.6S5.4 15.6 5.4 12c0-3.6 2.7-6.6 6.6-6.6s6.6 3 6.6 6.6z"/>
                                                        </svg>
                                                        <div className="hidden group-hover/jira:block absolute top-full right-0 mt-2 bg-slate-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap pointer-events-none shadow-lg z-[9999]">
                                                            Open in Jira
                                                        </div>
                                                    </a>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mb-2">{story.id}</p>
                                                {story.description && story.description.length > 0 ? (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 cursor-help" title={story.description}>
                                                        {story.description.substring(0, 150)}{story.description.length > 150 ? '...' : ''}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-500 dark:text-slate-500 italic">No description available</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="p-5 text-slate-500 dark:text-slate-500 text-center">No stories found.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Generate Button - Positioned below dropdown safely */}
                <div className="mt-8 mb-8">
                    {renderMainButton()}
                </div>

                {/* Zephyr Upload Options Card */}
                {selectedStory && !isGenerating && (
                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Zephyr Upload Options</h3>
                        <div className="space-y-5">
                            <div className="flex items-center space-x-3">
                                <input
                                    id="uploadToZephyr"
                                    type="checkbox"
                                    checked={uploadToZephyr}
                                    onChange={e => setUploadToZephyr(e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 focus:ring-2"
                                />
                                <label htmlFor="uploadToZephyr" className="text-base font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    Upload to Zephyr Scale immediately
                                </label>
                            </div>
                            {uploadToZephyr && (
                                <div className="pl-8 space-y-5 pt-2">
                                    <div>
                                        <label htmlFor="projectKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Project Key <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="projectKey"
                                            type="text"
                                            value={projectKey}
                                            onChange={e => setProjectKey(e.target.value)}
                                            placeholder="e.g., PROJ"
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="folderId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Folder ID <span className="text-slate-400 text-xs">(optional)</span>
                                        </label>
                                        <input
                                            id="folderId"
                                            type="text"
                                            value={folderId}
                                            onChange={e => setFolderId(e.target.value)}
                                            placeholder="Leave blank for default folder"
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
};

export default JiraSearchPage;
