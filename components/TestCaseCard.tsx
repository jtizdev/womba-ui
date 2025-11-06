import React, { useState, useEffect } from 'react';
import { TestCase } from '../types';
import { CheckIcon, EditIcon, SaveIcon, CancelIcon, ChevronDownIcon, TrashIcon, UploadIcon, LoadingSpinner } from './icons';

interface TestCaseCardProps {
  testCase: TestCase;
  onToggleSelect: (id: string) => void;
  onUpdate: (id: string, newTitle: string, newSteps: string) => void;
  onRemove: (id: string, title: string) => void;
  onToggleExpand: (id: string) => void;
  onUploadSingle: (testCase: TestCase) => void;
  isUploading: boolean;
  highlightAssertions: boolean;
}

const AutoResizingTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [props.value]);

    return <textarea ref={textareaRef} {...props} />;
};

const TestCaseCard: React.FC<TestCaseCardProps> = ({ testCase, onToggleSelect, onUpdate, onRemove, onToggleExpand, onUploadSingle, isUploading, highlightAssertions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(testCase.title);
  const [editedSteps, setEditedSteps] = useState(testCase.steps);

  useEffect(() => {
    if (testCase.id.startsWith('TC-MANUAL-')) {
        setIsEditing(true);
    }
  }, [testCase.id]);

  useEffect(() => {
    setEditedTitle(testCase.title);
    setEditedSteps(testCase.steps);
  }, [testCase.title, testCase.steps]);

  const handleSave = () => {
    onUpdate(testCase.id, editedTitle, editedSteps);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(testCase.title);
    setEditedSteps(testCase.steps);
    setIsEditing(false);
  };

  return (
    <div className={`bg-slate-800/50 rounded-lg shadow-lg transition-all duration-300 ${testCase.isSelected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-slate-700 hover:ring-2 hover:ring-indigo-500/70'}`}>
      <div className="p-4 flex items-start space-x-4">
        <div className="flex-shrink-0 pt-1">
          <label htmlFor={`select-${testCase.id}`} className="flex items-center space-x-2 cursor-pointer">
            <input
              id={`select-${testCase.id}`}
              type="checkbox"
              checked={testCase.isSelected}
              onChange={() => onToggleSelect(testCase.id)}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${testCase.isSelected ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>
              {testCase.isSelected && <CheckIcon className="w-4 h-4 text-white" />}
            </div>
          </label>
        </div>
        <div className="flex-grow" onDoubleClick={() => setIsEditing(true)}>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-lg font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <h2 className="text-lg font-semibold text-slate-100 cursor-pointer">{testCase.title}</h2>
          )}
          <span className="text-xs font-mono text-slate-500">{testCase.id}</span>
        </div>
        <div className="flex items-center space-x-1">
            {isEditing ? (
            <>
                <button onClick={handleSave} className="p-2 rounded-full hover:bg-green-500/20 text-green-400 transition-colors" aria-label="Save changes" title="Save">
                    <SaveIcon className="w-5 h-5" />
                </button>
                <button onClick={handleCancel} className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors" aria-label="Cancel editing" title="Cancel">
                    <CancelIcon className="w-5 h-5" />
                </button>
            </>
            ) : (
            <>
                <button 
                  onClick={() => onUploadSingle(testCase)} 
                  disabled={isUploading}
                  className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed" 
                  aria-label="Upload this test case"
                  title="Upload"
                >
                    {isUploading ? <LoadingSpinner className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors" aria-label="Edit test case" title="Edit">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onRemove(testCase.id, testCase.title)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors" aria-label="Remove test case" title="Remove">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </>
            )}
             <button onClick={() => onToggleExpand(testCase.id)} className={`p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-transform duration-300 ${testCase.isExpanded ? '' : '-rotate-180'}`} aria-label={testCase.isExpanded ? 'Collapse' : 'Expand'} title={testCase.isExpanded ? 'Collapse' : 'Expand'}>
                <ChevronDownIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
       <div className={`transition-all duration-500 ease-in-out overflow-hidden ${testCase.isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
         <div className="px-4 pb-4 pl-14 pt-2 border-t border-slate-700/50">
            {isEditing ? (
                <AutoResizingTextarea
                    value={editedSteps}
                    onChange={(e) => setEditedSteps(e.target.value)}
                    className="w-full bg-slate-700 p-3 rounded-md text-slate-300 font-sans text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                    rows={5}
                />
            ) : (
                <div onDoubleClick={() => setIsEditing(true)} className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed cursor-pointer">
                    {testCase.steps.split('\n').map((line, index) => (
                        <p key={index} className={
                            highlightAssertions && line.toLowerCase().includes('verify') 
                            ? 'text-amber-300 font-semibold' 
                            : ''
                        }>
                            {line || <span className="select-none">&nbsp;</span>}
                        </p>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseCard;