import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TestCase } from './types';
import { fetchTestCases, uploadTestCases } from './services/testCaseService';
import TestCaseCard from './components/TestCaseCard';
import ActionBar from './components/ActionBar';
import Header from './components/Header';
import Notification from './components/Notification';
import ConfirmationModal from './components/ConfirmationModal';
import Pagination from './components/Pagination';
import { LoadingSpinner, ExpandAllIcon, CollapseAllIcon, PlusIcon } from './components/icons';

type NotificationType = 'success' | 'error' | 'info';
type NotificationState = {
  id: number;
  message: string;
  type: NotificationType;
  onUndo?: () => void;
};

const ITEMS_PER_PAGE = 4;

const App: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [jiraStory] = useState('WOM-123: User Authentication Flow');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [highlightAssertions, setHighlightAssertions] = useState(true);
  const [testCaseToDelete, setTestCaseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{ testCase: TestCase; index: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);


  const triggerNotification = useCallback((message: string, type: NotificationType, onUndo?: () => void) => {
    if (showNotifications) {
      const newNotification = { id: Date.now(), message, type, onUndo };
      setNotifications(prev => [...prev, newNotification]);
    }
  }, [showNotifications]);

  useEffect(() => {
    const loadTestCases = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTestCases();
        setTestCases(data);
      } catch (err) {
        triggerNotification('Failed to fetch test cases. Please try again later.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadTestCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(testCases.length / ITEMS_PER_PAGE));
  }, [testCases]);

  const paginatedTestCases = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return testCases.slice(startIndex, endIndex);
  }, [testCases, currentPage]);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleAddNewTestCase = useCallback(() => {
    const newTestCase: TestCase = {
        id: `TC-MANUAL-${Date.now()}`,
        title: 'New Manual Test Case',
        steps: `1. 
2. 
3. Verify `,
        isSelected: false,
        isExpanded: true,
    };
    setTestCases(prev => [newTestCase, ...prev]);
    setCurrentPage(1); // Go to the first page to see the new case
    triggerNotification('Added a new blank test case.', 'info');
  }, [triggerNotification]);


  const handleToggleSelect = useCallback((id: string) => {
    setTestCases(prev =>
      prev.map(tc =>
        tc.id === id ? { ...tc, isSelected: !tc.isSelected } : tc
      )
    );
  }, []);
  
  const handleSelectAll = useCallback(() => {
    setTestCases(prev => prev.map(tc => ({...tc, isSelected: true})));
  }, []);

  const handleUnselectAll = useCallback(() => {
    setTestCases(prev => prev.map(tc => ({...tc, isSelected: false})));
  }, []);
  
  const handleToggleExpand = useCallback((id: string) => {
    setTestCases(prev =>
      prev.map(tc =>
        tc.id === id ? { ...tc, isExpanded: !tc.isExpanded } : tc
      )
    );
  }, []);

  const allExpanded = useMemo(() => {
      return paginatedTestCases.length > 0 && paginatedTestCases.every(tc => tc.isExpanded);
  }, [paginatedTestCases]);

  const handleToggleAllExpansion = useCallback(() => {
      const shouldExpand = !allExpanded;
      setTestCases(prev => prev.map(tc => ({...tc, isExpanded: shouldExpand})));
  }, [allExpanded]);

  const handleUndoRemove = useCallback(() => {
    if (lastRemoved) {
        setTestCases(prev => {
            const newTestCases = [...prev];
            newTestCases.splice(lastRemoved.index, 0, lastRemoved.testCase);
            return newTestCases;
        });
        setLastRemoved(null); // Can only undo once
    }
  }, [lastRemoved]);

  const handleRemoveTestCase = useCallback((id: string, title: string) => {
    setTestCaseToDelete({ id, title });
  }, []);

  const confirmRemove = useCallback(() => {
    if (!testCaseToDelete) return;

    const testCaseIndex = testCases.findIndex(tc => tc.id === testCaseToDelete.id);
    if (testCaseIndex === -1) return;

    const removedTestCase = testCases[testCaseIndex];
    setLastRemoved({ testCase: removedTestCase, index: testCaseIndex });

    const newTestCases = testCases.filter(tc => tc.id !== testCaseToDelete.id);
    setTestCases(newTestCases);

    if ((currentPage - 1) * ITEMS_PER_PAGE >= newTestCases.length && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
    }

    triggerNotification(`Removed: "${testCaseToDelete.title}"`, 'info', handleUndoRemove);

    setTestCaseToDelete(null); // Close modal
  }, [testCaseToDelete, testCases, triggerNotification, handleUndoRemove, currentPage]);


  const handleUpdateTestCase = useCallback((id: string, newTitle: string, newSteps: string) => {
    setTestCases(prev =>
      prev.map(tc =>
        tc.id === id ? { ...tc, title: newTitle, steps: newSteps } : tc
      )
    );
  }, []);
  
  const handleUploadSingle = useCallback(async (testCaseToUpload: TestCase) => {
    if (isBulkUploading || uploadingCardId) return;

    setUploadingCardId(testCaseToUpload.id);
    try {
        await uploadTestCases([testCaseToUpload]);
        triggerNotification(`Uploaded: "${testCaseToUpload.title}"`, 'success');
        const newTestCases = testCases.filter(tc => tc.id !== testCaseToUpload.id);
        setTestCases(newTestCases);
        if ((currentPage - 1) * ITEMS_PER_PAGE >= newTestCases.length && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    } catch (err) {
        triggerNotification('Failed to upload test case.', 'error');
    } finally {
        setUploadingCardId(null);
    }
  }, [isBulkUploading, uploadingCardId, triggerNotification, testCases, currentPage]);


  const selectedCount = useMemo(() => {
    return testCases.filter(tc => tc.isSelected).length;
  }, [testCases]);
  
  const allSelected = useMemo(() => {
    return testCases.length > 0 && selectedCount === testCases.length;
  }, [testCases, selectedCount]);


  const handleBulkUpload = async () => {
    const selectedCases = testCases.filter(tc => tc.isSelected);
    if (selectedCases.length === 0) {
      triggerNotification("No test cases selected for upload.", "error");
      return;
    }

    try {
      setIsBulkUploading(true);
      await uploadTestCases(selectedCases);
      triggerNotification(`${selectedCases.length} test case(s) uploaded successfully!`, 'success');
      const selectedIds = new Set(selectedCases.map(tc => tc.id));
      const newTestCases = testCases.filter(tc => !selectedIds.has(tc.id));
      setTestCases(newTestCases);
      const newTotalPages = Math.max(1, Math.ceil(newTestCases.length / ITEMS_PER_PAGE));
      if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
      }
    } catch (err) {
      triggerNotification('Failed to upload test cases. Please try again.', 'error');
    } finally {
      setIsBulkUploading(false);
    }
  };
  
  const handleDismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const ActionButton: React.FC<{onClick: () => void; children: React.ReactNode;}> = ({ onClick, children }) => (
    <button onClick={onClick} className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
        {children}
    </button>
  );

  return (
    <div className="min-h-screen">
      <Header 
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(prev => !prev)}
        highlightAssertions={highlightAssertions}
        onToggleHighlightAssertions={() => setHighlightAssertions(prev => !prev)}
      />
      <main className="container max-w-4xl mx-auto px-4 py-8 pb-32">
        {isLoading ? (
          <div className="flex justify-center items-center mt-20">
            <LoadingSpinner className="w-12 h-12 text-indigo-500" />
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-100 mb-1">{jiraStory}</h2>
            </div>
            <div className="flex justify-between items-center mb-6 px-1">
                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                    {testCases.length > 0 ? `Showing ${paginatedTestCases.length} of ${testCases.length} test cases` : 'No test cases to review.'}
                </p>
                <div className="flex items-center space-x-4">
                    <ActionButton onClick={handleAddNewTestCase}>
                       <PlusIcon className="w-4 h-4" />
                       <span>Add Test Case</span>
                    </ActionButton>
                    {testCases.length > 0 && (
                        <ActionButton onClick={handleToggleAllExpansion}>
                           {allExpanded ? <CollapseAllIcon className="w-4 h-4" /> : <ExpandAllIcon className="w-4 h-4" />}
                           <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
                        </ActionButton>
                    )}
                    {testCases.length > 0 && !allSelected && <ActionButton onClick={handleSelectAll}><span>Select All</span></ActionButton>}
                    {selectedCount > 0 && <ActionButton onClick={handleUnselectAll}><span>Unselect All</span></ActionButton>}
                </div>
            </div>
            {paginatedTestCases.length > 0 ? (
                <div className="space-y-4">
                  {paginatedTestCases.map(tc => (
                    <TestCaseCard
                      key={tc.id}
                      testCase={tc}
                      onToggleSelect={handleToggleSelect}
                      onToggleExpand={handleToggleExpand}
                      onUpdate={handleUpdateTestCase}
                      onRemove={handleRemoveTestCase}
                      onUploadSingle={handleUploadSingle}
                      isUploading={uploadingCardId === tc.id}
                      highlightAssertions={highlightAssertions}
                    />
                  ))}
                </div>
            ) : (
                <div className="text-center mt-20 text-slate-500">
                    <p>All test cases have been uploaded. Great job!</p>
                </div>
            )}
            {testCases.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>
      <ActionBar
        selectedCount={selectedCount}
        onUpload={handleBulkUpload}
        isUploading={isBulkUploading || !!uploadingCardId}
      />
      <div className="fixed top-20 right-5 w-full max-w-sm z-50 flex flex-col space-y-3">
        {notifications.map(notif => (
            <Notification 
                key={notif.id}
                id={notif.id}
                message={notif.message} 
                type={notif.type} 
                onDismiss={handleDismissNotification}
                onUndo={notif.onUndo}
            />
        ))}
      </div>
      <ConfirmationModal
        isOpen={!!testCaseToDelete}
        title="Confirm Deletion"
        message={
            <>
                Are you sure you want to delete this test case?
                <br />
                <strong className="font-semibold text-slate-200 mt-1 inline-block">
                    "{testCaseToDelete?.title}"
                </strong>
            </>
        }
        onConfirm={confirmRemove}
        onCancel={() => setTestCaseToDelete(null)}
      />
    </div>
  );
};

export default App;