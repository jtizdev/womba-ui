import React, { useEffect, useState } from 'react';
import { useGeneration } from '../contexts/GenerationContext';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface GenerationToastProps {
    onViewTestPlan: () => void;
}

const GenerationToast: React.FC<GenerationToastProps> = ({ onViewTestPlan }) => {
    const { isGenerating, currentStory, error, showToast, dismissToast, generatedTestPlan } = useGeneration();
    const [showStartToast, setShowStartToast] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Show "Generation started" toast briefly when generation begins
    useEffect(() => {
        if (isGenerating) {
            setShowStartToast(true);
            setIsVisible(true);
            const timer = setTimeout(() => {
                setShowStartToast(false);
                setIsVisible(false);
            }, 2000); // Auto-dismiss after 2 seconds
            return () => clearTimeout(timer);
        }
    }, [isGenerating]);

    // Show success toast and auto-dismiss after 8 seconds
    useEffect(() => {
        if (!isGenerating && generatedTestPlan && showToast) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => dismissToast(), 300); // Wait for fade-out animation
            }, 8000); // Auto-dismiss after 8 seconds
            return () => clearTimeout(timer);
        }
    }, [isGenerating, generatedTestPlan, showToast, dismissToast]);

    // Show error toast
    useEffect(() => {
        if (error) {
            setIsVisible(true);
        }
    }, [error]);

    const shouldShowToast = (isGenerating && showStartToast) || (!isGenerating && showToast) || error;

    if (!shouldShowToast) {
        return null;
    }

    const handleClick = () => {
        if (generatedTestPlan && !isGenerating) {
            setIsVisible(false);
            setTimeout(() => {
                dismissToast();
                onViewTestPlan();
            }, 300);
        }
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        setTimeout(() => dismissToast(), 300);
    };

    // Determine toast styling based on state
    const isSuccess = !isGenerating && generatedTestPlan;
    const isError = !!error;
    const isStarting = isGenerating && showStartToast;

    return (
        <div 
            className={`fixed top-20 right-6 z-50 w-80 transition-all duration-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div
                onClick={handleClick}
                className={`rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm ${
                    isSuccess 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer hover:shadow-indigo-500/50 transition-all' 
                        : isError
                        ? 'bg-gradient-to-r from-red-600 to-rose-600'
                        : 'bg-slate-800/90 border border-slate-700'
                }`}
            >
                <div className="p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {isStarting && (
                                <svg className="w-6 h-6 text-indigo-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                            {isSuccess && <CheckCircleIcon className="w-6 h-6 text-white" />}
                            {isError && <XCircleIcon className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${isSuccess || isError ? 'text-white' : 'text-slate-100'}`}>
                                        {isStarting && 'Generation Started'}
                                        {isSuccess && 'Test Plan Ready!'}
                                        {isError && 'Generation Failed'}
                                    </p>
                                    <p className={`text-xs mt-1 ${isSuccess || isError ? 'text-white/90' : 'text-slate-300'}`}>
                                        {currentStory || 'Processing...'}
                                    </p>
                                    {isSuccess && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-white/90 font-medium">
                                                ✓ {generatedTestPlan.testCases.length} test cases generated
                                            </p>
                                            {generatedTestPlan.zephyrResults && (
                                                <p className="text-xs text-white/80">
                                                    ✓ Uploaded to Zephyr
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {isError && (
                                        <p className="text-xs text-white/90 mt-2">{error}</p>
                                    )}
                                </div>
                                {!isStarting && (
                                    <button
                                        onClick={handleDismiss}
                                        className={`ml-3 flex-shrink-0 transition-colors ${
                                            isSuccess || isError ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {isSuccess && (
                                <p className="text-xs text-white/70 mt-3 font-medium">
                                    Click to view test plan →
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerationToast;

