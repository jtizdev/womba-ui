import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TestCase } from '../types';
import { generateTestPlan } from '../services/testCaseService';

interface GenerationState {
    isGenerating: boolean;
    currentStory: string | null;
    currentIssueKey: string | null;
    progress: string;
    error: string | null;
    generatedTestPlan: {
        storyTitle: string;
        testCases: TestCase[];
        issueKey: string;
        zephyrResults?: any;
    } | null;
}

interface GenerationContextType extends GenerationState {
    startGeneration: (
        issueKey: string,
        storyTitle: string,
        uploadToZephyr?: boolean,
        projectKey?: string,
        folderId?: string
    ) => Promise<void>;
    clearGeneration: () => void;
    dismissToast: () => void;
    showToast: boolean;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const useGeneration = () => {
    const context = useContext(GenerationContext);
    if (!context) {
        throw new Error('useGeneration must be used within a GenerationProvider');
    }
    return context;
};

interface GenerationProviderProps {
    children: ReactNode;
}

export const GenerationProvider: React.FC<GenerationProviderProps> = ({ children }) => {
    const [state, setState] = useState<GenerationState>({
        isGenerating: false,
        currentStory: null,
        currentIssueKey: null,
        progress: '',
        error: null,
        generatedTestPlan: null,
    });
    const [showToast, setShowToast] = useState(false);

    const startGeneration = useCallback(async (
        issueKey: string,
        storyTitle: string,
        uploadToZephyr: boolean = false,
        projectKey?: string,
        folderId?: string
    ) => {
        setState({
            isGenerating: true,
            currentStory: storyTitle,
            currentIssueKey: issueKey,
            progress: 'Fetching story context...',
            error: null,
            generatedTestPlan: null,
        });

        try {
            setState(prev => ({ ...prev, progress: 'Generating test cases with AI...' }));
            
            const result = await generateTestPlan(
                issueKey,
                uploadToZephyr,
                projectKey,
                folderId
            );

            setState(prev => ({
                ...prev,
                isGenerating: false,
                progress: 'Complete',
                generatedTestPlan: {
                    storyTitle,
                    testCases: result.testCases,
                    issueKey,
                    zephyrResults: result.zephyrResults,
                },
            }));

            // Show toast notification
            setShowToast(true);
        } catch (error) {
            console.error('Failed to generate test plan:', error);
            setState(prev => ({
                ...prev,
                isGenerating: false,
                progress: '',
                error: error instanceof Error ? error.message : 'Failed to generate test plan',
            }));
        }
    }, []);

    const clearGeneration = useCallback(() => {
        setState({
            isGenerating: false,
            currentStory: null,
            currentIssueKey: null,
            progress: '',
            error: null,
            generatedTestPlan: null,
        });
        setShowToast(false);
    }, []);

    const dismissToast = useCallback(() => {
        setShowToast(false);
    }, []);

    const value: GenerationContextType = {
        ...state,
        startGeneration,
        clearGeneration,
        dismissToast,
        showToast,
    };

    return (
        <GenerationContext.Provider value={value}>
            {children}
        </GenerationContext.Provider>
    );
};

