import React, { useState, useEffect } from 'react';
import { 
  getPromptSections, 
  getCompanyOverview, 
  updateCompanyOverview, 
  updatePromptSection,
  resetPrompts,
  getFullPrompt,
  PromptSection 
} from '../services/promptService';
import { LoadingSpinner } from './icons';

type TabType = 'company' | 'advanced' | 'preview';

const PromptConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [companyOverview, setCompanyOverview] = useState('');
  const [sections, setSections] = useState<PromptSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overview, sectionsData] = await Promise.all([
        getCompanyOverview(),
        getPromptSections()
      ]);
      setCompanyOverview(overview);
      setSections(sectionsData);
      if (sectionsData.length > 0) {
        setActiveSectionId(sectionsData[0].id);
      }
    } catch (error) {
      showMessage('Failed to load prompt configuration', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveCompanyOverview = async () => {
    setIsSaving(true);
    try {
      await updateCompanyOverview(companyOverview);
      showMessage('Company overview saved successfully', 'success');
    } catch (error) {
      showMessage('Failed to save company overview', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSection = async (sectionId: string, content: string) => {
    setIsSaving(true);
    try {
      await updatePromptSection(sectionId, content);
      showMessage('Section saved successfully', 'success');
      // Reload sections to get updated content
      const sectionsData = await getPromptSections();
      setSections(sectionsData);
    } catch (error) {
      showMessage('Failed to save section', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all prompts to defaults? This cannot be undone.')) {
      return;
    }
    setIsSaving(true);
    try {
      await resetPrompts();
      showMessage('Prompts reset to defaults', 'success');
      await loadData();
    } catch (error) {
      showMessage('Failed to reset prompts', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPreview = async () => {
    try {
      const prompt = await getFullPrompt();
      setFullPrompt(prompt);
    } catch (error) {
      showMessage('Failed to load full prompt', 'error');
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === 'preview' && !fullPrompt) {
      handleLoadPreview();
    }
  }, [activeTab]);

  const activeSection = sections.find(s => s.id === activeSectionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="w-12 h-12 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Prompt Configuration</h2>
        <p className="text-slate-600 dark:text-slate-400">Customize AI prompts and company-specific context</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'company' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          Company Overview
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'advanced' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          Advanced Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'preview' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          Full Prompt Preview
        </button>
      </div>

      {/* Warning Banner for Advanced Editor */}
      {activeTab === 'advanced' && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Warning: Editing Prompts</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Modifying these prompts can significantly impact test generation quality and behavior. 
                Changes affect all future test plans. Test thoroughly before production use.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Company Overview Tab */}
      {activeTab === 'company' && (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Company Overview</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            This company-specific context is injected into all AI prompts. Customize it to match your organization's terminology, products, and testing practices.
          </p>
          <textarea
            value={companyOverview}
            onChange={(e) => setCompanyOverview(e.target.value)}
            className="w-full h-96 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-4 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
            placeholder="Enter company overview..."
          />
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-slate-500 dark:text-slate-500">
              {companyOverview.length} characters
            </span>
            <button
              onClick={handleSaveCompanyOverview}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving && <LoadingSpinner className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Advanced Editor Tab */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section List */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg h-fit">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Sections</h3>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSectionId === section.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                >
                  {section.name}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Reset All to Defaults
              </button>
            </div>
          </div>

          {/* Section Editor */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800/50 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
            {activeSection && (
              <>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{activeSection.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{activeSection.description}</p>
                <textarea
                  value={activeSection.content}
                  onChange={(e) => {
                    const updatedSections = sections.map(s =>
                      s.id === activeSection.id ? { ...s, content: e.target.value } : s
                    );
                    setSections(updatedSections);
                  }}
                  className="w-full h-[500px] bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-4 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
                  placeholder="Enter section content..."
                />
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-slate-500 dark:text-slate-500">
                    {activeSection.content.length} characters
                  </span>
                  <button
                    onClick={() => handleSaveSection(activeSection.id, activeSection.content)}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSaving && <LoadingSpinner className="w-4 h-4" />}
                    <span>{isSaving ? 'Saving...' : 'Save Section'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Full Assembled Prompt</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Read-only preview of how all sections combine</p>
            </div>
            <button
              onClick={handleLoadPreview}
              className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Refresh Preview
            </button>
          </div>
          <pre className="w-full h-[600px] bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-4 text-slate-900 dark:text-slate-100 font-mono text-xs overflow-auto whitespace-pre-wrap">
            {fullPrompt || 'Loading...'}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PromptConfigPage;

