import React, { useState, useMemo, useCallback } from 'react';
import { TestCase } from '../types';
import { uploadTestCases, updateTestPlan, getTestPlan } from '../services/testCaseService';
import TestCaseCard from './TestCaseCard';
import ActionBar from './ActionBar';
import Header from './Header';
import Notification from './Notification';
import ConfirmationModal from './ConfirmationModal';
import Pagination from './Pagination';
import { ExpandAllIcon, CollapseAllIcon, PlusIcon } from './icons';

type NotificationType = 'success' | 'error' | 'info';
type NotificationState = {
  id: number;
  message: string;
  type: NotificationType;
  onUndo?: () => void;
};

const ITEMS_PER_PAGE = 4;

interface TestPlanPageProps {
    jiraStory: string;
    initialTestCases: TestCase[];
    issueKey: string;
    zephyrResults?: any;
    onBackToSearch: () => void;
}

const TestPlanPage: React.FC<TestPlanPageProps> = ({ jiraStory, initialTestCases, issueKey, zephyrResults, onBackToSearch }) => {
  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [highlightAssertions, setHighlightAssertions] = useState(true);
  const [testCaseToDelete, setTestCaseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{ testCase: TestCase; index: number } | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ count: number; zephyrIds: string[]; folderPath?: string } | null>(null);


  const triggerNotification = useCallback((message: string, type: NotificationType, onUndo?: () => void) => {
    if (showNotifications) {
      const newNotification = { id: Date.now(), message, type, onUndo };
      setNotifications(prev => [...prev, newNotification]);
    }
  }, [showNotifications]);

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
  
  const handleAddNewTestCase = useCallback(async () => {
    const newTestCase: TestCase = {
        id: `TC-MANUAL-${Date.now()}`,
        title: 'New Manual Test Case',
        steps: `1. 
2. 
3. Verify Result: `,
        stepsArray: [
            { step_number: 1, action: '', expected_result: '' },
            { step_number: 2, action: '', expected_result: '' },
            { step_number: 3, action: 'Verify Result', expected_result: '' }
        ],
        isSelected: false,
        isExpanded: true,
    };
    const updatedTestCases = [newTestCase, ...testCases];
    setTestCases(updatedTestCases);
    setCurrentPage(1); // Go to the first page to see the new case
    
    // Update test plan on backend
    try {
        const projectKeyToUse = issueKey.split('-')[0];
        await updateTestPlan(issueKey, updatedTestCases, false, projectKeyToUse);
        triggerNotification('Added a new blank test case and updated test plan.', 'success');
    } catch (error) {
        console.error('Failed to update test plan:', error);
        triggerNotification('Added test case locally, but failed to update test plan on server.', 'error');
    }
  }, [testCases, issueKey, triggerNotification]);


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

  const confirmRemove = useCallback(async () => {
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

    // Update test plan on backend
    try {
        const projectKeyToUse = issueKey.split('-')[0];
        await updateTestPlan(issueKey, newTestCases, false, projectKeyToUse);
        triggerNotification(`Removed: "${testCaseToDelete.title}" and updated test plan.`, 'info', handleUndoRemove);
    } catch (error) {
        console.error('Failed to update test plan:', error);
        triggerNotification(`Removed: "${testCaseToDelete.title}" locally, but failed to update test plan on server.`, 'error', handleUndoRemove);
    }

    setTestCaseToDelete(null); // Close modal
  }, [testCaseToDelete, testCases, issueKey, triggerNotification, handleUndoRemove, currentPage]);

  const handleBulkDelete = useCallback(() => {
    const selectedCases = testCases.filter(tc => tc.isSelected);
    if (selectedCases.length === 0) {
      triggerNotification("No test cases selected for deletion.", "error");
      return;
    }
    setShowBulkDeleteModal(true);
  }, [testCases, triggerNotification]);

  const confirmBulkDelete = useCallback(async () => {
    const selectedCases = testCases.filter(tc => tc.isSelected);
    if (selectedCases.length === 0) return;

    const selectedIds = new Set(selectedCases.map(tc => tc.id));
    const newTestCases = testCases.filter(tc => !selectedIds.has(tc.id));
    setTestCases(newTestCases);

    // Adjust pagination if needed
    const newTotalPages = Math.max(1, Math.ceil(newTestCases.length / ITEMS_PER_PAGE));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }

    // Update test plan on backend
    try {
      const projectKeyToUse = issueKey.split('-')[0];
      await updateTestPlan(issueKey, newTestCases, false, projectKeyToUse);
      triggerNotification(`Deleted ${selectedCases.length} test case${selectedCases.length > 1 ? 's' : ''} and updated test plan.`, 'success');
    } catch (error) {
      console.error('Failed to update test plan:', error);
      triggerNotification(`Deleted ${selectedCases.length} test case${selectedCases.length > 1 ? 's' : ''} locally, but failed to update test plan on server.`, 'error');
    }

    setShowBulkDeleteModal(false);
  }, [testCases, currentPage, issueKey, triggerNotification]);


  const handleUpdateTestCase = useCallback(async (id: string, newTitle: string, newSteps: string) => {
    // Update test plan on backend first
    try {
        const projectKeyToUse = issueKey.split('-')[0];
        
        // Find the test case being updated to preserve all its fields
        const testCaseToUpdate = testCases.find(tc => tc.id === id);
        if (!testCaseToUpdate) {
            console.error(`Test case with id ${id} not found`);
            triggerNotification('Test case not found.', 'error');
            return;
        }
        
        // Update the test case preserving all fields, especially stepsArray
        const updatedTestCases = testCases.map(tc => {
            if (tc.id === id) {
                // Parse newSteps back to stepsArray if needed
                let newStepsArray = tc.stepsArray || [];
                if (typeof newSteps === 'string' && newSteps.trim()) {
                    // Parse steps string to structured format
                    const lines = newSteps.split('\n');
                    newStepsArray = [];
                    let currentStep: any = null;
                    
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        
                        // Check if line starts with a number (step number)
                        const stepMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
                        if (stepMatch) {
                            // Save previous step if exists
                            if (currentStep) {
                                newStepsArray.push(currentStep);
                            }
                            // Start new step
                            currentStep = {
                                step_number: parseInt(stepMatch[1]),
                                action: stepMatch[2],
                                expected_result: '',
                                test_data: ''
                            };
                        } else if (trimmed.toLowerCase().startsWith('expected')) {
                            // Expected result line
                            const expectedMatch = trimmed.match(/expected[:\s]+(.+)$/i);
                            if (expectedMatch && currentStep) {
                                currentStep.expected_result = expectedMatch[1].trim();
                            }
                        } else if (currentStep) {
                            // Continuation of action
                            currentStep.action += ' ' + trimmed;
                        }
                    }
                    
                    // Add last step
                    if (currentStep) {
                        newStepsArray.push(currentStep);
                    }
                }
                
                return {
                    ...tc,
                    title: newTitle,
                    steps: newSteps,
                    stepsArray: newStepsArray  // Preserve structured steps
                };
            }
            return tc;
        });
        
        console.log(`Updating test case ${id} with title: ${newTitle}`);
        console.log(`Sending ${updatedTestCases.length} test cases to backend`);
        
        await updateTestPlan(issueKey, updatedTestCases, false, projectKeyToUse);
        
        // Reload test plan from server to ensure UI matches backend
        const response = await getTestPlan(issueKey);
        if (response.test_plan && response.test_plan.test_cases) {
            // Convert API format to UI format
            const reloadedTestCases: TestCase[] = response.test_plan.test_cases.map((tc: any, index: number) => {
                const existingTc = testCases.find(t => {
                    // Try to match by ID first
                    if (tc.id && t.id === tc.id) return true;
                    // Fallback: match by generated ID pattern
                    const generatedId = `TC-${issueKey}-${index + 1}`;
                    if (t.id === generatedId) return true;
                    // Fallback: match by title (if ID doesn't exist)
                    if (!tc.id && t.title === tc.title) return true;
                    return false;
                });
                
                return {
                    id: tc.id || `TC-${issueKey}-${index + 1}`,
                    title: tc.title,
                    description: tc.description,
                    preconditions: tc.preconditions,
                    expected_result: tc.expected_result,
                    priority: tc.priority,
                    test_type: tc.test_type,
                    tags: tc.tags,
                    steps: tc.steps.map((step: any, idx: number) => 
                        `${step.step_number || idx + 1}. ${step.action}\n   Expected: ${step.expected_result}`
                    ).join('\n'),
                    stepsArray: tc.steps,  // Store structured steps
                    isSelected: existingTc?.isSelected || false,
                    isExpanded: existingTc?.isExpanded || false,
                };
            });
            
            setTestCases(reloadedTestCases);
            triggerNotification('Test case updated and test plan saved.', 'success');
        } else {
            // Fallback: update local state if reload fails
            const updatedTestCases = testCases.map(tc =>
              tc.id === id ? { ...tc, title: newTitle, steps: newSteps } : tc
            );
            setTestCases(updatedTestCases);
            triggerNotification('Test case updated, but failed to reload from server.', 'warning');
        }
    } catch (error) {
        console.error('Failed to update test plan:', error);
        triggerNotification(`Failed to update test plan on server: ${error}`, 'error');
        // Don't update local state on error - keep original
    }
  }, [testCases, issueKey, triggerNotification]);
  
  const handleUploadSingle = useCallback(async (testCaseToUpload: TestCase) => {
    if (isBulkUploading || uploadingCardId) return;

    // Note: This is a simplified upload. In production, you'd want to prompt for project key
    const projectKeyToUse = issueKey.split('-')[0]; // Extract project key from issue key

    setUploadingCardId(testCaseToUpload.id);
    try {
        const result = await uploadTestCases(issueKey, [testCaseToUpload], projectKeyToUse);
        const uploadedIds = result.zephyr_results?.test_case_ids || [];
        triggerNotification(`Uploaded: "${testCaseToUpload.title}" (${uploadedIds.length} test cases)`, 'success');
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
  }, [isBulkUploading, uploadingCardId, triggerNotification, testCases, currentPage, issueKey]);


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

    const projectKeyToUse = issueKey.split('-')[0]; // Extract project key from issue key

    try {
      setIsBulkUploading(true);
      const result = await uploadTestCases(issueKey, selectedCases, projectKeyToUse);
      const uploadedCount = result.zephyr_results?.uploaded_count || selectedCases.length;
      const zephyrIds = result.zephyr_results?.test_case_ids || [];
      
      // Show success modal with stats
      setUploadStats({
        count: uploadedCount,
        zephyrIds: zephyrIds,
        folderPath: result.zephyr_results?.folder_path
      });
      setShowSuccessModal(true);
      
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
    <>
      {/* Success Banner - Non-blocking */}
      {showSuccessModal && uploadStats && (
        <div className="fixed top-6 right-6 z-50 max-w-md animate-slide-in-right">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-2xl ring-1 ring-indigo-500/50 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start space-x-3">
                {/* Success Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm mb-1">
                    Successfully Uploaded!
                  </h3>
                  <div className="text-white/90 text-xs space-y-1">
                    <p>
                      <span className="font-semibold">{uploadStats.count}</span> test case{uploadStats.count !== 1 ? 's' : ''} uploaded to Zephyr
                    </p>
                    {uploadStats.folderPath && (
                      <p className="text-white/80">
                        📁 Folder: <span className="font-semibold">{uploadStats.folderPath}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBackToSearch();
                }}
                className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Create Another Test Plan
              </button>
            </div>
          </div>
        </div>
      )}

      <Header 
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(prev => !prev)}
        highlightAssertions={highlightAssertions}
        onToggleHighlightAssertions={() => setHighlightAssertions(prev => !prev)}
        onBackToSearch={onBackToSearch}
      />
      <main className="container max-w-4xl mx-auto px-4 py-8 pb-32">
        
          <>
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-100 mb-1">{jiraStory}</h2>
                <p className="text-slate-400">Review, edit, and upload the generated test cases.</p>
                {zephyrResults && zephyrResults.test_case_ids && zephyrResults.test_case_ids.length > 0 && (
                    <p className="text-sm text-green-400 mt-2">
                        ✓ Already uploaded {zephyrResults.test_case_ids.length} test cases to Zephyr
                    </p>
                )}
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
                           <span>{allExpanded ? 'Collapse All' : 'Collapse All'}</span>
                        </ActionButton>
                    )}
                    {testCases.length > 0 && !allSelected && <ActionButton onClick={handleSelectAll}><span>Select All</span></ActionButton>}
                    {selectedCount > 0 && <ActionButton onClick={handleUnselectAll}><span>Unselect All</span></ActionButton>}
                    {selectedCount > 0 && (
                      <button 
                        onClick={handleBulkDelete}
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete Selected ({selectedCount})</span>
                      </button>
                    )}
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
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        
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
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        title="Delete Selected Test Cases"
        message={
            <>
                Are you sure you want to delete <strong className="text-red-400">{selectedCount}</strong> selected test case{selectedCount > 1 ? 's' : ''}?
                <br />
                <span className="text-slate-400 text-sm mt-2 inline-block">This action cannot be undone.</span>
            </>
        }
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />
    </>
  );
};

export default TestPlanPage;