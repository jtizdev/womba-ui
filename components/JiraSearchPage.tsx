import React, { useState, useEffect, useCallback, useRef } from 'react';
import { JiraStory, TestCase } from '../types';
import { searchJiraStories, generateTestPlan } from '../services/testCaseService';
import Header from './Header';
import { SearchIcon, LoadingSpinner } from './icons';

interface JiraSearchPageProps {
  onGenerateTestPlan: (storyTitle: string, testCases: TestCase[]) => void;
}

type GenerationStatus = 'idle' | 'generating' | 'completed';

const JiraSearchPage: React.FC<JiraSearchPageProps> = ({ onGenerateTestPlan }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<JiraStory[]>([]);
    const [selectedStory, setSelectedStory] = useState<JiraStory | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
    const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[] | null>(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    
    const searchContainerRef = useRef<HTMLDivElement>(null);

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
                setIsDropdownVisible(true);
            } catch (error) {
                console.error("Failed to search Jira stories", error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query, selectedStory]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedStory(null);
        setGenerationStatus('idle');
        setGeneratedTestCases(null);
    };
    
    const handleSelectStory = (story: JiraStory) => {
        setSelectedStory(story);
        setQuery(story.title);
        setIsDropdownVisible(false);
    };

    const handleGenerate = async () => {
        if (!selectedStory || generationStatus !== 'idle') return;
        
        setGenerationStatus('generating');
        try {
            const testCases = await generateTestPlan(selectedStory.id);
            setGeneratedTestCases(testCases);
            setGenerationStatus('completed');
        } catch (error) {
            console.error("Failed to generate test plan", error);
            // In a real app, you'd show a notification to the user here.
            setGenerationStatus('idle');
        }
    };
    
    // FIX: Make handleViewPlan async to match the type of handleGenerate
    const handleViewPlan = async () => {
        if (!selectedStory || !generatedTestCases || generationStatus !== 'completed') return;
        onGenerateTestPlan(selectedStory.title, generatedTestCases);
    };

    const renderMainButton = () => {
        const isDisabled = !selectedStory || generationStatus === 'generating';
        let text = 'Generate Test Plan';
        let onClick = handleGenerate;
        
        if (generationStatus === 'generating') {
            text = 'Generating Test Plan...';
        } else if (generationStatus === 'completed') {
            text = 'View Test Plan';
            onClick = handleViewPlan;
        }

        return (
            <button
                onClick={onClick}
                disabled={isDisabled}
                className="w-full max-w-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-400 shadow-lg shadow-indigo-500/0 hover:shadow-indigo-500/40 disabled:shadow-none disabled:translate-y-0"
            >
                {generationStatus === 'generating' && <LoadingSpinner className="w-5 h-5 mr-3" />}
                {text}
            </button>
        );
    };

    return (
        <>
            <Header hideActions />
            <main className="container max-w-2xl mx-auto px-4 py-8 text-center">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Find Jira Story</h2>
                <p className="text-slate-400 mb-8">Enter a Story ID or keyword to generate a test plan.</p>

                <div ref={searchContainerRef} className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <SearchIcon className="w-6 h-6 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => query.trim() && results.length > 0 && setIsDropdownVisible(true)}
                        placeholder="e.g., PROJ-123 or 'User Authentication'"
                        autoComplete="off"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 pl-12 text-lg text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-500"
                    />
                    {isDropdownVisible && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-10 max-h-60 overflow-y-auto">
                            {isSearching ? (
                                <div className="flex justify-center items-center p-4">
                                    <LoadingSpinner className="w-6 h-6 text-indigo-500" />
                                </div>
                            ) : results.length > 0 ? (
                                <ul className="divide-y divide-slate-700/50">
                                    {results.map(story => (
                                        <li
                                            key={story.id}
                                            onClick={() => handleSelectStory(story)}
                                            className="p-4 text-left cursor-pointer hover:bg-indigo-600/20 transition-colors"
                                        >
                                            <p className="font-semibold text-slate-100">{story.title}</p>
                                            <p className="text-sm text-slate-400 font-mono">{story.id}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-4 text-slate-500">No stories found.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-24" /> 

                <div className="mt-8 flex justify-center">
                    {renderMainButton()}
                </div>
            </main>
        </>
    );
};

export default JiraSearchPage;