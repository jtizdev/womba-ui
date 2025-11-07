import React, { useState } from 'react';
import JiraSearchPage from './components/JiraSearchPage';
import TestPlanPage from './components/TestPlanPage';
import RagManagementPage from './components/RagManagementPage';
import Nav from './components/Nav';
import { TestCase } from './types';

type View = 'generation' | 'rag';

const TestGenerationFlow: React.FC = () => {
    const [testPlan, setTestPlan] = useState<{ storyTitle: string; testCases: TestCase[] } | null>(null);

    const handleTestPlanGenerated = (storyTitle: string, testCases: TestCase[]) => {
        setTestPlan({ storyTitle, testCases });
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
                    onBackToSearch={handleBackToSearch}
                />
            )}
        </>
    );
};


const App: React.FC = () => {
    const [view, setView] = useState<View>('generation');

    return (
        <div className="flex flex-col min-h-screen">
            <Nav activeView={view} onViewChange={setView} />
            <main className="flex-grow">
                {view === 'generation' && <TestGenerationFlow />}
                {view === 'rag' && <RagManagementPage />}
            </main>
        </div>
    );
};

export default App;
