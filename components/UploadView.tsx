import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TestCase, ZephyrFolder, UploadToCycleResult } from '../types';
import { getZephyrFolders, uploadToTestCycle } from '../services/testCaseService';
import { LoadingSpinner, FolderIcon, CycleIcon, CheckIcon, AlertIcon, ChevronLeftIcon } from './icons';

interface UploadViewProps {
  issueKey: string;
  projectKey: string;
  jiraStory: string;
  selectedTestCases: TestCase[];
  onBack: () => void;
  onSuccess: (result: UploadToCycleResult) => void;
}

type FolderOption = 'latest' | 'select' | 'create';

const UploadView: React.FC<UploadViewProps> = ({
  issueKey,
  projectKey,
  jiraStory,
  selectedTestCases,
  onBack,
  onSuccess
}) => {
  // Form state
  const [cycleName, setCycleName] = useState('');
  const [folderOption, setFolderOption] = useState<FolderOption>('latest');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [customFolderPath, setCustomFolderPath] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading states
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Data state
  const [folders, setFolders] = useState<ZephyrFolder[]>([]);
  const [latestFolder, setLatestFolder] = useState<ZephyrFolder | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for auto-scrolling
  const selectFolderRef = useRef<HTMLDivElement>(null);
  const createFolderRef = useRef<HTMLDivElement>(null);

  // Initialize cycle name with issue key
  useEffect(() => {
    setCycleName(`${issueKey} – Test Cycle`);
  }, [issueKey]);

  // Fetch TEST_CYCLE folders fresh every time component mounts
  useEffect(() => {
    // Always fetch fresh data when component mounts
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = run once on mount, fetchFolders uses projectKey from closure

  // Auto-scroll to the selected folder option when it expands
  useEffect(() => {
    if (folderOption === 'select' && selectFolderRef.current) {
      // Small delay to allow the content to render
      setTimeout(() => {
        selectFolderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (folderOption === 'create' && createFolderRef.current) {
      setTimeout(() => {
        createFolderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [folderOption]);

  const fetchFolders = async () => {
    setIsLoadingFolders(true);
    setError(null);
    try {
      // Fetch TEST_CYCLE folders specifically
      const fetchedFolders = await getZephyrFolders(projectKey, 'TEST_CYCLE');
      setFolders(fetchedFolders);
      
      // Determine the latest folder (last one in the list, or by any timestamp if available)
      if (fetchedFolders.length > 0) {
        // Use the last folder as "latest" (Zephyr typically returns in creation order)
        const latest = fetchedFolders[fetchedFolders.length - 1];
        setLatestFolder(latest);
        setSelectedFolderId(latest.id);
      }
    } catch (err) {
      console.error('Failed to fetch TEST_CYCLE folders:', err);
      setError('Failed to load cycle folders. You can still create a new folder.');
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Filter folders based on search term
  const filteredFolders = useMemo(() => {
    if (!searchTerm.trim()) return folders;
    const term = searchTerm.toLowerCase();
    return folders.filter(f => 
      f.name.toLowerCase().includes(term) || 
      f.path.toLowerCase().includes(term)
    );
  }, [folders, searchTerm]);

  // Get selected folder info
  const selectedFolder = useMemo(() => {
    return folders.find(f => f.id === selectedFolderId);
  }, [folders, selectedFolderId]);

  // Determine effective folder path based on option
  const effectiveFolderPath = useMemo(() => {
    if (folderOption === 'latest' && latestFolder) {
      return latestFolder.path;
    } else if (folderOption === 'select' && selectedFolder) {
      return selectedFolder.path;
    } else if (folderOption === 'create' && customFolderPath.trim()) {
      return customFolderPath.trim();
    }
    return null;
  }, [folderOption, latestFolder, selectedFolder, customFolderPath]);

  // Validation
  const isValid = useMemo(() => {
    if (selectedTestCases.length === 0) return false;
    if (!cycleName.trim()) return false;
    if (folderOption === 'create' && !customFolderPath.trim()) return false;
    return true;
  }, [selectedTestCases.length, cycleName, folderOption, customFolderPath]);

  const handleUpload = async () => {
    if (!isValid) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadToTestCycle(
        issueKey,
        selectedTestCases,
        projectKey,
        cycleName.trim(),
        effectiveFolderPath || undefined
      );

      if (result.success) {
        onSuccess(result);
      } else {
        setError(result.errors?.join(', ') || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // If no test cases selected, show a message
  if (selectedTestCases.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertIcon className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">No Test Cases Selected</h2>
          <p className="text-slate-400 mb-6">
            Please go back and select at least one test case to upload.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back to Test Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                disabled={isUploading}
                className="flex items-center text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Test Plan
              </button>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <h1 className="text-lg font-bold text-slate-100">Upload to Zephyr</h1>
                <a 
                  href={`https://plainid.atlassian.net/browse/${issueKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  {issueKey}
                </a>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                  <CheckIcon className="w-3 h-3" />
                </div>
                <span className="ml-2 text-slate-300">Select Tests</span>
              </div>
              <div className="w-8 h-px bg-slate-600" />
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <span className="ml-2 text-white font-medium">Configure Cycle</span>
              </div>
              <div className="w-8 h-px bg-slate-600" />
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
                <span className="ml-2 text-slate-400">Upload</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 py-6 h-full">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex items-start space-x-3">
            <AlertIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Upload Error</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          {/* Left Column - Configuration - Scrollable */}
          <div className="lg:col-span-3 overflow-y-auto space-y-4 pr-2">
            {/* Cycle Name */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <CycleIcon className="w-5 h-5 mr-2 text-indigo-400" />
                Test Cycle Name
              </h3>
              <input
                type="text"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                placeholder="e.g., PLAT-12345 – Sprint 10 Regression"
                disabled={isUploading}
              />
              <p className="text-xs text-slate-500 mt-2">
                This cycle will be linked to <span className="text-indigo-400 font-medium">{issueKey}</span>
              </p>
            </div>

            {/* Cycle Folder Selection */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
                <FolderIcon className="w-5 h-5 mr-2 text-indigo-400" />
                Test Cycle Folder
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Choose where to place the test cycle in Zephyr's folder structure.
              </p>
              
              {/* Folder Options */}
              <div className="space-y-3">
                {/* Latest Folder Option */}
                <div
                  className={`rounded-lg border transition-all ${
                    folderOption === 'latest'
                      ? 'bg-indigo-600/20 border-indigo-500'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <label className="flex items-start p-4 cursor-pointer">
                    <input
                      type="radio"
                      name="folderOption"
                      value="latest"
                      checked={folderOption === 'latest'}
                      onChange={() => setFolderOption('latest')}
                      disabled={isUploading || !latestFolder}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-slate-100 font-medium">Use latest cycle folder</span>
                      {latestFolder ? (
                        <p className="text-sm text-slate-400 mt-1">
                          📁 {latestFolder.path}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 mt-1 italic">
                          {isLoadingFolders ? 'Loading...' : 'No existing folders found'}
                        </p>
                      )}
                      <span className="text-xs text-green-400 mt-1 inline-block">Recommended</span>
                    </div>
                  </label>
                </div>

                {/* Choose Existing Option - with inline folder list */}
                <div
                  ref={selectFolderRef}
                  className={`rounded-lg border transition-all ${
                    folderOption === 'select'
                      ? 'bg-indigo-600/20 border-indigo-500'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <label className="flex items-start p-4 cursor-pointer">
                    <input
                      type="radio"
                      name="folderOption"
                      value="select"
                      checked={folderOption === 'select'}
                      onChange={() => setFolderOption('select')}
                      disabled={isUploading || folders.length === 0}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-slate-100 font-medium">Choose existing folder</span>
                      <p className="text-sm text-slate-400 mt-1">
                        Select from {folders.length} available cycle folder{folders.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </label>
                  
                  {/* Inline Folder Selection List */}
                  {folderOption === 'select' && (
                    <div className="border-t border-slate-700 mt-2">
                      <div className="p-3">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Search folders..."
                          disabled={isUploading || isLoadingFolders}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {isLoadingFolders ? (
                          <div className="flex items-center justify-center py-6">
                            <LoadingSpinner className="w-5 h-5 text-indigo-400" />
                            <span className="ml-2 text-slate-400 text-sm">Loading folders...</span>
                          </div>
                        ) : filteredFolders.length === 0 ? (
                          <div className="py-6 text-center text-slate-500 text-sm">
                            {folders.length === 0 ? 'No cycle folders found' : 'No matching folders'}
                          </div>
                        ) : (
                          filteredFolders.map((folder) => (
                            <button
                              key={folder.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFolderId(folder.id);
                              }}
                              disabled={isUploading}
                              className={`w-full flex items-center px-4 py-2.5 text-left transition-colors border-l-2 ${
                                selectedFolderId === folder.id
                                  ? 'bg-indigo-600/10 text-indigo-300 border-l-indigo-500'
                                  : 'text-slate-300 hover:bg-slate-800/50 border-l-transparent'
                              }`}
                            >
                              <FolderIcon className="w-4 h-4 mr-3 flex-shrink-0 text-slate-500" />
                              <span className="text-sm truncate">{folder.path}</span>
                              {selectedFolderId === folder.id && (
                                <CheckIcon className="w-4 h-4 ml-auto text-indigo-400 flex-shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Create New Option - with inline input */}
                <div
                  ref={createFolderRef}
                  className={`rounded-lg border transition-all ${
                    folderOption === 'create'
                      ? 'bg-indigo-600/20 border-indigo-500'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <label className="flex items-start p-4 cursor-pointer">
                    <input
                      type="radio"
                      name="folderOption"
                      value="create"
                      checked={folderOption === 'create'}
                      onChange={() => setFolderOption('create')}
                      disabled={isUploading}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-slate-100 font-medium">Create new folder</span>
                      <p className="text-sm text-slate-400 mt-1">
                        Enter a path like <code className="text-indigo-400">Regression/Sprint 10</code>
                      </p>
                    </div>
                  </label>
                  
                  {/* Inline Create Folder Input */}
                  {folderOption === 'create' && (
                    <div className="border-t border-slate-700 mt-2 p-3">
                      <input
                        type="text"
                        value={customFolderPath}
                        onChange={(e) => setCustomFolderPath(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Regression/Sprint 10"
                        disabled={isUploading}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Use <code className="text-indigo-400">/</code> to create nested folders.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary - Fixed height with scroll */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col flex-1 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <h3 className="text-lg font-semibold text-slate-100">Upload Summary</h3>
              </div>
              
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {/* Project */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project</p>
                  <p className="text-slate-200 font-medium">{projectKey}</p>
                </div>

                {/* Story */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Linked Story</p>
                  <a 
                    href={`https://plainid.atlassian.net/browse/${issueKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    {issueKey}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Cycle Name */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cycle Name</p>
                  <p className="text-slate-200 font-medium">{cycleName || '—'}</p>
                </div>

                {/* Folder */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cycle Folder</p>
                  <p className="text-slate-200 font-medium flex items-center">
                    <FolderIcon className="w-4 h-4 mr-2 text-amber-400" />
                    {effectiveFolderPath || 'No folder selected'}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700 my-4" />

                {/* Test Cases */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Test Cases ({selectedTestCases.length})
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedTestCases.map((tc, index) => (
                      <div key={tc.id} className="bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700">
                        <p className="text-sm text-slate-200 truncate">
                          <span className="text-slate-500 mr-2">{index + 1}.</span>
                          {tc.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload Button - Fixed at bottom */}
              <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex-shrink-0">
                <button
                  onClick={handleUpload}
                  disabled={!isValid || isUploading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner className="w-5 h-5 mr-2" />
                      Uploading to Zephyr...
                    </>
                  ) : (
                    <>
                      <CycleIcon className="w-5 h-5 mr-2" />
                      Upload to Zephyr
                    </>
                  )}
                </button>
                
                {!isValid && (
                  <p className="text-xs text-amber-400 text-center mt-2">
                    {!cycleName.trim() 
                      ? 'Please enter a cycle name'
                      : folderOption === 'create' && !customFolderPath.trim()
                        ? 'Please enter a folder path'
                        : 'Please fix the errors above'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UploadView;

