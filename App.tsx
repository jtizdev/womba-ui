import React, { useState, useEffect } from 'react';
import JiraSearchPage from './components/JiraSearchPage';
import TestPlanPage from './components/TestPlanPage';
import RagManagementPage from './components/RagManagementPage';
import ConfigPage from './components/ConfigPage';
import StatsPage from './components/StatsPage';
import Sidebar from './components/Nav';
import GenerationToast from './components/GenerationToast';
import LoadingIndicator from './components/LoadingIndicator';
import LandingPage from './components/LandingPage';
import { GenerationProvider, useGeneration } from './contexts/GenerationContext';
import { TestCase } from './types';

type View = 'generation' | 'rag' | 'config' | 'stats';

const TestGenerationFlow: React.FC = () => {
    const [testPlan, setTestPlan] = useState<{ storyTitle: string; testCases: TestCase[]; issueKey: string; zephyrResults?: any } | null>(null);

    const handleTestPlanGenerated = (storyTitle: string, testCases: TestCase[], issueKey: string, zephyrResults?: any) => {
        setTestPlan({ storyTitle, testCases, issueKey, zephyrResults });
    };

    const handleBackToSearch = () => {
        setTestPlan(null);
    };
    
    return (
        <>
            {!testPlan ? (
                <JiraSearchPage onGenerateTestPlan={handleTestPlanGenerated} />
            ) : (
                <TestPlanPage
                    jiraStory={testPlan.storyTitle}
                    initialTestCases={testPlan.testCases}
                    issueKey={testPlan.issueKey}
                    zephyrResults={testPlan.zephyrResults}
                    onBackToSearch={handleBackToSearch}
                />
            )}
        </>
    );
};


const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('generation');
    const { generatedTestPlan, clearGeneration, isGenerating } = useGeneration();
    const [testPlan, setTestPlan] = useState<{ storyTitle: string; testCases: TestCase[]; issueKey: string; zephyrResults?: any } | null>(null);
    
    // Track sidebar collapsed state for dynamic margin
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Listen for sidebar state changes
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('sidebarCollapsed');
            setSidebarCollapsed(saved ? JSON.parse(saved) : false);
        };
        
        window.addEventListener('storage', handleStorageChange);
        // Also check periodically in case localStorage changes from same tab
        const interval = setInterval(handleStorageChange, 100);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Automatically sync testPlan with generatedTestPlan when generation completes
    useEffect(() => {
        if (generatedTestPlan && !testPlan) {
            setTestPlan(generatedTestPlan);
        }
    }, [generatedTestPlan]);

    const handleViewTestPlan = () => {
        if (generatedTestPlan) {
            setTestPlan(generatedTestPlan);
            setView('generation');
        }
    };
    
    // Load a test plan from history
    const handleLoadFromHistory = (historyItem: any) => {
        if (historyItem.test_plan) {
            // Map API format test cases to UI format
            const testCases: TestCase[] = historyItem.test_plan.test_cases.map((tc: any, index: number) => ({
                id: `TC-${historyItem.story_key}-${index + 1}`,
                title: tc.title,
                description: tc.description,
                priority: tc.priority,
                test_type: tc.test_type,
                tags: tc.tags,
                steps: tc.steps.map((step: any, idx: number) => 
                    `${idx + 1}. ${step.action}\n   Expected: ${step.expected_result}`
                ).join('\n'),
                stepsArray: tc.steps,  // Store structured steps
                isSelected: false,
                isExpanded: false,
            }));
            
            setTestPlan({
                storyTitle: historyItem.story_key,
                testCases: testCases,
                issueKey: historyItem.story_key,
                zephyrResults: historyItem.zephyr_ids ? { test_case_keys: historyItem.zephyr_ids } : undefined
            });
            setView('generation');
        }
    };

    const handleBackToSearch = () => {
        setTestPlan(null);
        clearGeneration();
    };

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar activeView={view} onViewChange={setView} />
            <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} min-h-screen transition-all duration-300`}>
                {view === 'generation' && (
                    testPlan ? (
                        <TestPlanPage
                            jiraStory={testPlan.storyTitle}
                            initialTestCases={testPlan.testCases}
                            issueKey={testPlan.issueKey}
                            zephyrResults={testPlan.zephyrResults}
                            onBackToSearch={handleBackToSearch}
                        />
                    ) : (
                        <JiraSearchPage />
                    )
                )}
                {view === 'rag' && <RagManagementPage />}
                {view === 'config' && <ConfigPage />}
                {view === 'stats' && <StatsPage onLoadTestPlan={handleLoadFromHistory} />}
            </main>
            {isGenerating && <LoadingIndicator message="Generating test plan..." />}
            <GenerationToast onViewTestPlan={handleViewTestPlan} />
        </div>
    );
};

const App: React.FC = () => {
    const [hasSeenLanding, setHasSeenLanding] = useState(() => {
        const seen = localStorage.getItem('wombaHasSeenLanding');
        return seen === 'true';
    });

    const handleEnterApp = () => {
        localStorage.setItem('wombaHasSeenLanding', 'true');
        setHasSeenLanding(true);
    };

    if (!hasSeenLanding) {
        return <LandingPage onEnter={handleEnterApp} />;
    }

    return (
        <GenerationProvider>
            <AppContent />
        </GenerationProvider>
    );
};

export default App;
