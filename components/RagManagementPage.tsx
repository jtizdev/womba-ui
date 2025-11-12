import React, { useState, useEffect, useCallback } from 'react';
import { RagStats, RagSearchResult } from '../types';
import { getRagStats, indexStory, batchIndexTests, indexAll, clearRagCollection, searchRag } from '../services/testCaseService';
import { DatabaseIcon, LoadingSpinner, TrashIcon, UploadIcon, AlertTriangleIcon, SearchIcon } from './icons';
import Notification from './Notification';
import ConfirmationModal from './ConfirmationModal';

type NotificationType = 'success' | 'error' | 'info';
type NotificationState = { id: number; message: string; type: NotificationType };

const RagManagementPage: React.FC = () => {
    const [stats, setStats] = useState<RagStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [notifications, setNotifications] = useState<NotificationState[]>([]);
    const [modalState, setModalState] = useState<{ isOpen: boolean; collectionToClear: string | null }>({ isOpen: false, collectionToClear: null });

    const [storyKey, setStoryKey] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [isIndexing, setIsIndexing] = useState(false);

    const [batchProjectKey, setBatchProjectKey] = useState('');
    const [batchMaxTests, setBatchMaxTests] = useState('1000');
    const [isBatchIndexing, setIsBatchIndexing] = useState(false);

    const [indexAllProjectKey, setIndexAllProjectKey] = useState('');
    const [isIndexingAll, setIsIndexingAll] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchCollection, setSearchCollection] = useState('test_plans');
    const [searchProjectKey, setSearchProjectKey] = useState('');
    const [searchTopK, setSearchTopK] = useState('10');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<RagSearchResult[]>([]);

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
            const data = await getRagStats();
            setStats(data);
        } catch (error) {
            triggerNotification('Failed to load RAG statistics.', 'error');
            console.error(error);
        } finally {
            setIsLoadingStats(false);
        }
    }, [triggerNotification]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleIndexStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storyKey || !projectKey || isIndexing) return;
        setIsIndexing(true);
        try {
            const result = await indexStory(storyKey, projectKey);
            triggerNotification(result.message, 'success');
            setStoryKey('');
            setProjectKey('');
            fetchStats(); // Refresh stats after indexing
        } catch (error) {
            triggerNotification('Failed to index story.', 'error');
        } finally {
            setIsIndexing(false);
        }
    };

    const handleBatchIndex = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchProjectKey || !batchMaxTests || isBatchIndexing) return;
        setIsBatchIndexing(true);
        try {
            const result = await batchIndexTests(batchProjectKey, parseInt(batchMaxTests, 10));
            triggerNotification(result.message, 'success');
            setBatchProjectKey('');
            fetchStats(); // Refresh stats after indexing
        } catch (error) {
            triggerNotification('Failed to start batch indexing.', 'error');
        } finally {
            setIsBatchIndexing(false);
        }
    };

    const handleIndexAll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!indexAllProjectKey || isIndexingAll) return;
        setIsIndexingAll(true);
        triggerNotification('Starting index-all operation... This may take several minutes.', 'info');
        try {
            const result = await indexAll(indexAllProjectKey);
            triggerNotification(result.message || `Successfully indexed all tests!`, 'success');
            setIndexAllProjectKey('');
            fetchStats(); // Refresh stats after indexing
        } catch (error) {
            triggerNotification('Failed to complete index-all operation.', 'error');
        } finally {
            setIsIndexingAll(false);
        }
    };

    const openClearModal = (collection: string) => {
        setModalState({ isOpen: true, collectionToClear: collection });
    };

    const handleClearCollection = async () => {
        if (!modalState.collectionToClear) return;
        const collection = modalState.collectionToClear;
        setModalState({ isOpen: false, collectionToClear: null }); // Close modal immediately
        try {
            const result = await clearRagCollection(collection);
            triggerNotification(result.message, 'success');
            fetchStats(); // Refresh stats
        } catch (error) {
            triggerNotification(`Failed to clear collection: ${collection}.`, 'error');
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery || isSearching) return;
        setIsSearching(true);
        setSearchResults([]);
        try {
            const results = await searchRag(
                searchQuery,
                searchCollection,
                parseInt(searchTopK, 10),
                searchProjectKey || undefined
            );
            setSearchResults(results);
            triggerNotification(`Found ${results.length} results`, 'success');
        } catch (error) {
            triggerNotification('Failed to search RAG database.', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const Card: React.FC<{ title: string; children: React.ReactNode, icon?: React.ReactNode }> = ({ title, children, icon }) => (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center space-x-3">
                {icon}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            </div>
            <div className="p-6 flex-grow">{children}</div>
        </div>
    );

    const StatDisplay: React.FC<{label: string; value: number | string | undefined}> = ({label, value}) => (
         <div className="flex justify-between items-baseline p-3 bg-slate-100 dark:bg-slate-900/50 rounded-md">
            <span className="text-slate-600 dark:text-slate-400 text-sm">{label}</span>
            <span className="text-2xl font-bold text-indigo-400">{value ?? <LoadingSpinner className="w-5 h-5" />}</span>
        </div>
    );
    
    const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
        <input {...props} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500" />
    );

    const SubmitButton: React.FC<{isLoading: boolean; children: React.ReactNode, disabled?: boolean}> = ({isLoading, children, disabled}) => (
        <button type="submit" disabled={isLoading || disabled} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isLoading ? <LoadingSpinner className="w-5 h-5 mr-2" /> : <UploadIcon className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );

    return (
        <>
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">RAG Management</h2>
                    <p className="text-slate-600 dark:text-slate-400">Manage the knowledge base for Womba's AI test generation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card title="Database Statistics" icon={<DatabaseIcon className="w-6 h-6 text-indigo-400" />}>
                        <div className="space-y-4">
                           <StatDisplay label="Total Documents" value={stats?.total_documents ?? 0} />
                           <StatDisplay label="Jira Issues" value={stats?.jira_issues?.count ?? 0} />
                           <StatDisplay label="Test Plans" value={stats?.test_plans?.count ?? 0} />
                           <StatDisplay label="Existing Tests" value={stats?.existing_tests?.count ?? 0} />
                           <StatDisplay label="Confluence Docs" value={stats?.confluence_docs?.count ?? 0} />
                           <StatDisplay label="External Docs" value={stats?.external_docs?.count ?? 0} />
                           <StatDisplay label="Swagger Docs" value={stats?.swagger_docs?.count ?? 0} />
                        </div>
                    </Card>
                    <Card title="Index Single Story" icon={<UploadIcon className="w-6 h-6 text-indigo-400" />}>
                        <form onSubmit={handleIndexStory} className="space-y-4">
                            <div>
                               <label htmlFor="storyKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Story Key</label>
                               <InputField id="storyKey" type="text" value={storyKey} onChange={e => setStoryKey(e.target.value)} placeholder="e.g., PROJ-123" required />
                            </div>
                             <div>
                               <label htmlFor="projectKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Key</label>
                               <InputField id="projectKey" type="text" value={projectKey} onChange={e => setProjectKey(e.target.value)} placeholder="e.g., PROJ" required />
                            </div>
                            <SubmitButton isLoading={isIndexing} disabled={!storyKey || !projectKey}>
                                {isIndexing ? 'Indexing...' : 'Index Story'}
                            </SubmitButton>
                        </form>
                    </Card>
                     <Card title="Batch Index from Zephyr" icon={<UploadIcon className="w-6 h-6 text-indigo-400" />}>
                        <form onSubmit={handleBatchIndex} className="space-y-4">
                            <div>
                               <label htmlFor="batchProjectKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Key</label>
                               <InputField id="batchProjectKey" type="text" value={batchProjectKey} onChange={e => setBatchProjectKey(e.target.value)} placeholder="e.g., PROJ" required />
                            </div>
                             <div>
                               <label htmlFor="batchMaxTests" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Tests to Index</label>
                               <InputField id="batchMaxTests" type="number" value={batchMaxTests} onChange={e => setBatchMaxTests(e.target.value)} placeholder="1000" required />
                            </div>
                            <SubmitButton isLoading={isBatchIndexing} disabled={!batchProjectKey || !batchMaxTests}>
                                {isBatchIndexing ? 'Indexing...' : 'Start Batch Index'}
                            </SubmitButton>
                        </form>
                    </Card>
                    <Card title="Index All (Unlimited)" icon={<DatabaseIcon className="w-6 h-6 text-yellow-400" />}>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Index all available tests and stories. This may take several minutes depending on data volume.</p>
                        <form onSubmit={handleIndexAll} className="space-y-4">
                            <div>
                               <label htmlFor="indexAllProjectKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Key</label>
                               <InputField id="indexAllProjectKey" type="text" value={indexAllProjectKey} onChange={e => setIndexAllProjectKey(e.target.value)} placeholder="e.g., PROJ" required />
                            </div>
                            <SubmitButton isLoading={isIndexingAll} disabled={!indexAllProjectKey}>
                                {isIndexingAll ? 'Indexing All... Please Wait' : 'Start Index-All'}
                            </SubmitButton>
                            {isIndexingAll && (
                                <p className="text-xs text-yellow-400">⏱ This operation may take 5-10 minutes. You can navigate away and come back.</p>
                            )}
                        </form>
                    </Card>
                </div>

                {/* RAG Search Section */}
                <div className="mb-6">
                    <Card title="Search RAG Database" icon={<SearchIcon className="w-6 h-6 text-indigo-400" />}>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="searchQuery" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search Query</label>
                                    <InputField 
                                        id="searchQuery" 
                                        type="text" 
                                        value={searchQuery} 
                                        onChange={e => setSearchQuery(e.target.value)} 
                                        placeholder="e.g., authentication tests" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="searchCollection" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Collection</label>
                                    <select 
                                        id="searchCollection"
                                        value={searchCollection}
                                        onChange={e => setSearchCollection(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="test_plans">Test Plans</option>
                                        <option value="jira_issues">Jira Issues</option>
                                        <option value="existing_tests">Existing Tests</option>
                                        <option value="confluence_docs">Confluence Docs</option>
                                        <option value="external_docs">External Docs</option>
                                        <option value="swagger_docs">Swagger Docs</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="searchProjectKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Key (optional)</label>
                                    <InputField 
                                        id="searchProjectKey" 
                                        type="text" 
                                        value={searchProjectKey} 
                                        onChange={e => setSearchProjectKey(e.target.value)} 
                                        placeholder="e.g., PROJ" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="searchTopK" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Results</label>
                                    <InputField 
                                        id="searchTopK" 
                                        type="number" 
                                        value={searchTopK} 
                                        onChange={e => setSearchTopK(e.target.value)} 
                                        placeholder="10" 
                                        min="1"
                                        max="50"
                                        required 
                                    />
                                </div>
                            </div>
                            <SubmitButton isLoading={isSearching} disabled={!searchQuery}>
                                {isSearching ? 'Searching...' : 'Search'}
                            </SubmitButton>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Search Results ({searchResults.length})</h4>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <div key={index} className="bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-md p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-mono text-slate-400">
                                                    Score: {result.score.toFixed(3)}
                                                </span>
                                                {result.metadata?.key && (
                                                    <span className="text-xs font-mono text-indigo-400">
                                                        {result.metadata.key}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{result.document}</p>
                                            {result.metadata && (
                                                <div className="mt-2 text-xs text-slate-500">
                                                    {result.metadata.project_key && (
                                                        <span className="mr-3">Project: {result.metadata.project_key}</span>
                                                    )}
                                                    {result.metadata.summary && (
                                                        <span>Summary: {result.metadata.summary}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Danger Zone - Centered at Bottom */}
                <div className="mt-12 mb-8 max-w-2xl mx-auto">
                    <Card title="Danger Zone" icon={<AlertTriangleIcon className="w-6 h-6 text-red-400" />}>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center">
                            <AlertTriangleIcon className="w-5 h-5 inline-block mr-1 text-red-400" />
                            These actions are irreversible. Please proceed with caution.
                        </p>
                        <div className="space-y-3">
                          <button onClick={() => openClearModal('jira_issues')} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                                <span>Clear 'jira_issues' collection</span>
                            </button>
                            <button onClick={() => openClearModal('test_plans')} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                                <span>Clear 'test_plans' collection</span>
                            </button>
                            <button onClick={() => openClearModal('existing_tests')} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                                <span>Clear 'existing_tests' collection</span>
                            </button>
                        </div>
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

            <ConfirmationModal
                isOpen={modalState.isOpen}
                title="Confirm Collection Deletion"
                message={
                    <>
                        Are you sure you want to permanently delete all data from the
                        <strong className="font-semibold text-slate-200 mx-1">
                            '{modalState.collectionToClear}'
                        </strong>
                        collection? This action cannot be undone.
                    </>
                }
                onConfirm={handleClearCollection}
                onCancel={() => setModalState({ isOpen: false, collectionToClear: null })}
            />
        </>
    );
};

export default RagManagementPage;
