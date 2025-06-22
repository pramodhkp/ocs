
import React, { useEffect } from 'react';
import { TagInsightItem } from '../types';
import { TagChip } from './TagChip';
import { InsightDetailsContent } from './InsightDetailsContent'; // New import

interface SidebarProps {
  insight: TagInsightItem | null;
  onClose: () => void;
}

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ insight, onClose }) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (insight) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [insight, onClose]);

  if (!insight) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar Panel */}
      <aside 
        className="fixed top-0 right-0 w-full md:w-1/2 lg:w-2/5 xl:w-1/3 h-full bg-section-bg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 border-l border-section-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-section-border bg-section-header-bg">
            <div id="sidebar-title" className="text-lg font-semibold text-app-text-primary flex flex-wrap gap-2 items-center">
              {insight.tags.map((tag, index) => (
                <TagChip key={`${tag}-${index}-sidebar`} tag={tag} />
              ))}
            </div>
            <button 
              onClick={onClose} 
              className="text-app-text-secondary hover:text-app-text-primary transition-colors p-1 rounded-full hover:bg-slate-200"
              aria-label="Close details sidebar"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-grow p-5 overflow-y-auto bg-section-bg text-app-text-primary">
            {/* Render shared details content */}
            <InsightDetailsContent insight={insight} isInline={false} />
          </div>
        </div>
      </aside>
    </>
  );
};
