
import React, { useState } from 'react';
import { TagChip } from './TagChip'; 

interface CustomInsightCreatorProps {
  availableTags: string[];
  onGenerate: (selectedTags: string[]) => Promise<void>;
  isLoading: boolean;
}

const CreateIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SparklesIcon: React.FC = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
</svg>
);


export const CustomInsightCreator: React.FC<CustomInsightCreatorProps> = ({ availableTags, onGenerate, isLoading }) => {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const handleGenerateClick = () => {
    if (selectedTags.size > 0) {
      onGenerate(Array.from(selectedTags));
    }
  };
  
  const handleClearSelection = () => {
    setSelectedTags(new Set());
  };

  return (
    <>
      <div className="bg-section-header-bg p-4 md:p-5">
        <h2 className="text-xl md:text-2xl font-semibold text-app-text-primary flex items-center">
          <SparklesIcon />
          Create Your Own Insight
        </h2>
      </div>
      <div className="p-6 md:p-8 bg-section-bg">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-app-text-primary mb-3">1. Select Tags:</h3>
          <div className="p-4 bg-slate-50 rounded-lg border border-section-border max-h-60 overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isSelected = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTagSelection(tag)}
                    className={`py-1.5 px-3 text-xs font-medium rounded-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-sm
                      ${isSelected 
                        ? 'bg-brand-blue text-white ring-brand-blue transform scale-105' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-800 border border-slate-300 hover:border-slate-400'
                      }`}
                    aria-pressed={isSelected}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedTags.size > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-app-text-primary mb-2">Selected ({selectedTags.size}):</h3>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-100 rounded-md border border-slate-200">
              {Array.from(selectedTags).map(tag => (
                <TagChip key={`selected-${tag}`} tag={tag} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={handleGenerateClick}
            disabled={isLoading || selectedTags.size === 0}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-opacity-70 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <CreateIcon /> Generate Custom Insight
              </>
            )}
          </button>
          {selectedTags.size > 0 && !isLoading && (
              <button
                  onClick={handleClearSelection}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-app-text-secondary hover:text-app-text-primary rounded-md border border-slate-300 hover:border-slate-400 transition-colors"
              >
                  Clear Selection
              </button>
          )}
        </div>
      </div>
    </>
  );
};