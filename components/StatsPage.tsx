import React, { useState, useEffect, useCallback } from 'react';
import { Stats, HistoryItem } from '../types';
import { getStats, getHistory, getHistoryDetails } from '../services/testCaseService';
import { ChartBarIcon, LoadingSpinner, ClockIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronRightIcon } from './icons';
import Notification from './Notification';

type NotificationType = 'success' | 'error' | 'info';
type NotificationState = { id: number; message: string; type: NotificationType };

interface StatsPageProps {
    onLoadTestPlan?: (historyItem: any) => void;
}

const StatsPage: React.FC<StatsPageProps> = ({ onLoadTestPlan }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [notifications, setNotifications] = useState<NotificationState[]>([]);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
    const [historyPage, setHistoryPage] = useState(0);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

    const ITEMS_PER_PAGE = 20;

    const triggerNotification = useCallback((message: string, type: NotificationType) => {
        const newNotification = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const handleDismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const data = await getStats();
            setStats(data);
        } catch (error) {
            triggerNotification('Failed to load statistics.', 'error');
            console.error(error);
        } finally {
            setIsLoadingStats(false);
        }
    }, [triggerNotification]);

    const fetchHistory = useCallback(async (page: number, append: boolean = false) => {
        setIsLoadingHistory(true);
        try {
            const data = await getHistory(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
            if (append) {
                setHistory(prev => [...prev, ...data]);
            } else {
                setHistory(data);
            }
            setHasMoreHistory(data.length === ITEMS_PER_PAGE);
        } catch (error) {
            triggerNotification('Failed to load history.', 'error');
            console.error(error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [triggerNotification]);

    useEffect(() => {
        fetchStats();
        fetchHistory(0);
    }, [fetchStats, fetchHistory]);

    const loadMore = () => {
        const nextPage = historyPage + 1;
        setHistoryPage(nextPage);
        fetchHistory(nextPage, true);
    };

    const filteredHistory = history.filter(item => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
    });

    const Card: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center space-x-3">
                {icon}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );

    const StatCard: React.FC<{ label: string; value: number | string; color?: string; suffix?: string }> = ({ 
        label, 
        value, 
        color = 'text-indigo-400',
        suffix = ''
    }) => (
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-300 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>
                {isLoadingStats ? <LoadingSpinner className="w-8 h-8" /> : `${value}${suffix}`}
            </p>
        </div>
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const toggleExpand = async (itemId: string) => {
        const isExpanded = expandedItems.has(itemId);
        
        if (isExpanded) {
            // Collapse
            setExpandedItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        } else {
            // Expand and fetch details if not already loaded
            setExpandedItems(prev => new Set([...prev, itemId]));
            
            const item = history.find(h => h.id === itemId);
            if (item && !item.test_plan) {
                // Fetch details
                setLoadingDetails(prev => new Set([...prev, itemId]));
                try {
                    const details = await getHistoryDetails(itemId);
                    setHistory(prev => prev.map(h => h.id === itemId ? details : h));
                } catch (error) {
                    triggerNotification('Failed to load test plan details.', 'error');
                } finally {
                    setLoadingDetails(prev => {
                        const next = new Set(prev);
                        next.delete(itemId);
                        return next;
                    });
                }
            }
        }
    };

    return (
        <>
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Statistics & History</h2>
                    <p className="text-slate-600 dark:text-slate-400">Track your test generation activity and performance metrics.</p>
                </div>

                {/* Statistics Cards */}
                <Card title="Overview" icon={<ChartBarIcon className="w-6 h-6 text-indigo-400" />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="Total Tests" value={stats?.total_tests ?? 0} />
                        <StatCard label="Total Stories" value={stats?.total_stories ?? 0} />
                        <StatCard label="Time Saved" value={stats?.time_saved ?? 0} suffix="h" color="text-green-400" />
                        <StatCard label="Success Rate" value={stats?.success_rate?.toFixed(1) ?? 0} suffix="%" color="text-blue-400" />
                        <StatCard label="Tests This Week" value={stats?.tests_this_week ?? 0} color="text-purple-400" />
                        <StatCard label="Stories This Week" value={stats?.stories_this_week ?? 0} color="text-pink-400" />
                    </div>
                </Card>

                {/* History Section */}
                <div className="mt-6">
                    <Card title="Test Generation History" icon={<ClockIcon className="w-6 h-6 text-indigo-400" />}>
                        <div className="mb-4 flex items-center space-x-2">
                            <label className="text-sm text-slate-600 dark:text-slate-400">Filter:</label>
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    statusFilter === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('success')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    statusFilter === 'success'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                Success
                            </button>
                            <button
                                onClick={() => setStatusFilter('failed')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    statusFilter === 'failed'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                Failed
                            </button>
                        </div>

                        {isLoadingHistory && history.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner className="w-8 h-8 text-indigo-500" />
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <p>No history items found.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {filteredHistory.map(item => {
                                        const isExpanded = expandedItems.has(item.id);
                                        const isLoading = loadingDetails.has(item.id);
                                        
                                        return (
                                            <div
                                                key={item.id}
                                                className="bg-slate-50 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden"
                                            >
                                                <div 
                                                    className="p-4 hover:bg-slate-100 dark:hover:bg-slate-900/90 transition-colors cursor-pointer"
                                                    onClick={() => toggleExpand(item.id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 flex items-start space-x-3">
                                                            <div className="flex-shrink-0 mt-1">
                                                                {isExpanded ? (
                                                                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                                                ) : (
                                                                    <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    {item.status === 'success' ? (
                                                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                                                    ) : (
                                                                        <XCircleIcon className="w-5 h-5 text-red-400" />
                                                                    )}
                                                                    <span className="font-mono text-indigo-400 font-semibold">
                                                                        {item.story_key}
                                                                    </span>
                                                                    <span className="text-xs text-slate-500">
                                                                        {formatDate(item.created_at)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-4 text-sm text-slate-400">
                                                                    <span>
                                                                        <span className="font-semibold text-slate-300">{item.test_count}</span> test cases
                                                                    </span>
                                                                    <span>Duration: {formatDuration(item.duration)}</span>
                                                                    {item.zephyr_ids && item.zephyr_ids.length > 0 && (
                                                                        <span className="text-green-400">
                                                                            Uploaded to Zephyr ({item.zephyr_ids.length})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-semibold rounded flex-shrink-0 ${
                                                                item.status === 'success'
                                                                    ? 'bg-green-900/30 text-green-400'
                                                                    : 'bg-red-900/30 text-red-400'
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {isExpanded && (
                                                                    <div className="border-t border-slate-300 dark:border-slate-700 p-4 bg-slate-100 dark:bg-slate-800/50">
                                                        {isLoading ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <LoadingSpinner className="w-5 h-5 text-indigo-400 mr-2" />
                                                                <span className="text-sm text-slate-400">Loading test plan details...</span>
                                                            </div>
                                                        ) : item.test_plan ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h4 className="text-sm font-semibold text-slate-200">Test Cases</h4>
                                                                    <span className="text-xs text-slate-500">
                                                                        {item.test_plan.test_cases.length} test cases
                                                                    </span>
                                                                </div>
                                                                {item.test_plan.test_cases.map((tc, index) => (
                                                                    <div key={index} className="bg-white dark:bg-slate-900/70 rounded-md p-3 border border-slate-300 dark:border-slate-700">
                                                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">{tc.title}</p>
                                                                        {tc.description && (
                                                                            <p className="text-xs text-slate-400 mb-2">{tc.description}</p>
                                                                        )}
                                                                        <div className="space-y-1">
                                                                            {tc.steps.map((step, stepIdx) => (
                                                                                <div key={stepIdx} className="text-xs">
                                                                                    <span className="text-indigo-400">{step.step_number}.</span>{' '}
                                                                                    <span className="text-slate-700 dark:text-slate-300">{step.action}</span>
                                                                                    <div className="ml-4 text-slate-600 dark:text-slate-500">
                                                                                        → {step.expected_result}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {tc.tags && tc.tags.length > 0 && (
                                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                                {tc.tags.map((tag, tagIdx) => (
                                                                                    <span key={tagIdx} className="text-xs px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded">
                                                                                        {tag}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {item.zephyr_ids && item.zephyr_ids.length > 0 && (
                                                                    <div className="mt-3 text-xs text-green-400">
                                                                        ✓ Uploaded to Zephyr: {item.zephyr_ids.join(', ')}
                                                                    </div>
                                                                )}
                                                                {onLoadTestPlan && (
                                                                    <div className="mt-4 flex justify-end">
                                                                        <button
                                                                            onClick={() => onLoadTestPlan(item)}
                                                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium"
                                                                        >
                                                                            Edit / Upload Test Plan
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-slate-500 py-4 text-center">
                                                                No test plan details available
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {hasMoreHistory && !isLoadingHistory && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={loadMore}
                                            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Load More
                                        </button>
                                    </div>
                                )}

                                {isLoadingHistory && history.length > 0 && (
                                    <div className="mt-4 flex justify-center">
                                        <LoadingSpinner className="w-6 h-6 text-indigo-500" />
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>
            </div>

            <div className="fixed top-20 right-5 w-full max-w-sm z-50 flex flex-col space-y-3">
                {notifications.map(notif => (
                    <Notification
                        key={notif.id}
                        id={notif.id}
                        message={notif.message}
                        type={notif.type}
                        onDismiss={handleDismissNotification}
                    />
                ))}
            </div>
        </>
    );
};

export default StatsPage;

