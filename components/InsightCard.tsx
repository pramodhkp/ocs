
import React, { useState } from 'react';
import { TagInsightItem, DisplayMode } from '../types';
import { TagChip } from './TagChip';
import { InsightDetailsContent } from './InsightDetailsContent'; // New import

interface InsightCardProps {
  insight: TagInsightItem; // id will be present here when passed from App.tsx
  isPromoted: boolean; // New prop: true if this insight is currently a "top insight"
  onSelect: (insight: TagInsightItem) => void;
  onTogglePromote: (insightId: string) => void; // New prop: callback to promote/demote
  displayMode: DisplayMode;
}

// Star icon for promote/demote
const StarIcon: React.FC<{ solid?: boolean; className?: string }> = ({ solid, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={solid ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.673a1 1 0 00.95.69h5.969c.969 0 1.371 1.24.588 1.81l-4.826 3.502a1 1 0 00-.364 1.118l1.846 5.673c.3.921-.755 1.688-1.54 1.118l-4.826-3.502a1 1 0 00-1.175 0l-4.826 3.502c-.784.57-1.838-.197-1.539-1.118l1.846-5.673a1 1 0 00-.364-1.118L2.98 11.1c-.783-.57-.38-1.81.588-1.81h5.969a1 1 0 00.95-.69l1.846-5.673z" />
  </svg>
);


const EyeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-blue group-hover:text-blue-600 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.07.207-.141.414-.215.621M12 17c-4.478 0-8.268-2.943-9.542-7 .07-.207.141.414-.215-.621" />
  </svg>
);

const ChevronDownIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-blue group-hover:text-blue-600 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-blue group-hover:text-blue-600 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

// Action icons for suggestedAction, kept here as they are specific to card's action display
const ActionLinkIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ActionTextIcon: React.FC = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);


export const InsightCard: React.FC<InsightCardProps> = ({ insight, isPromoted, onSelect, onTogglePromote, displayMode }) => {
  const [isInlineExpanded, setIsInlineExpanded] = useState(false);
  // Card background now depends on 'isPromoted' status
  const cardBg = isPromoted ? 'bg-slate-50 border-section-border' : 'bg-section-bg border-section-border';

  const handleCardClick = () => {
    if (displayMode === 'sidebar') {
      onSelect(insight);
    } else { // 'inline' mode
      setIsInlineExpanded(prev => !prev);
    }
  };

  const handleActionClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, actionUrl?: string) => {
    e.stopPropagation(); // Prevent card click (sidebar opening or inline toggle)
    if (actionUrl) {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const DetailsIndicatorIcon = () => {
    if (displayMode === 'inline') {
      return isInlineExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />;
    }
    return <EyeIcon />;
  };

  const handlePromoteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (insight.id) { // Ensure insight has an ID
      onTogglePromote(insight.id);
    }
  };

  return (
    <div 
      className={`group flex flex-col p-5 rounded-lg shadow-md border ${cardBg} transition-all duration-300 hover:shadow-lg hover:border-brand-blue ${displayMode === 'inline' ? '' : 'cursor-pointer'}`}
      onClick={handleCardClick}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
      tabIndex={0}
      role="button"
      aria-expanded={displayMode === 'inline' ? isInlineExpanded : undefined}
      aria-label={`View details for insight: ${insight.tags.join(' & ')}`}
    >
      <div className="flex-grow"> {/* Main card content visible when collapsed */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-wrap gap-2 mb-3 items-center">
              {insight.tags.map((tag, index) => (
                <TagChip key={`${tag}-${index}`} tag={tag} />
              ))}
            </div>
            
            <h3 className="text-lg font-semibold text-app-text-primary mb-1">
              {insight.tags.join(' & ') || 'General Insight'}
            </h3>
          </div>
          <div className="flex items-start space-x-2 flex-shrink-0 ml-2">
             <button
              onClick={handlePromoteClick}
              className={`p-1 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-opacity-50
                ${isPromoted ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-400 hover:text-slate-600'}
              `}
              aria-label={isPromoted ? "Demote from Top Insights" : "Promote to Top Insights"}
              title={isPromoted ? "Demote from Top Insights" : "Promote to Top Insights"}
            >
              <StarIcon solid={isPromoted} />
            </button>
            <div className="flex flex-col items-end">
                <span className="text-xs font-medium px-2.5 py-1 bg-brand-blue text-white rounded-full shadow-sm mb-2 whitespace-nowrap">
                {insight.count} Alerts
                </span>
                <button 
                onClick={(e) => { e.stopPropagation(); handleCardClick(); }} 
                className="p-1 rounded-full hover:bg-slate-100"
                aria-label={displayMode === 'inline' ? (isInlineExpanded ? "Collapse details" : "Expand details") : "View details in sidebar"}
                >
                <DetailsIndicatorIcon />
                </button>
            </div>
          </div>
        </div>
        
        <p className="text-app-text-secondary text-sm leading-relaxed mt-1">{insight.summary}</p>
      </div>

      {insight.suggestedAction && !isInlineExpanded && ( // Show suggested action on collapsed card only if not inline expanded
        <div className="mt-4 pt-3 border-t border-slate-200">
          {insight.suggestedAction.actionUrl ? (
            <a
              href={insight.suggestedAction.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleActionClick(e, insight.suggestedAction?.actionUrl)}
              className="inline-flex items-center text-sm font-medium text-brand-blue hover:text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md transition-colors duration-150"
              aria-label={`Action: ${insight.suggestedAction.displayText}`}
            >
              <ActionLinkIcon />
              {insight.suggestedAction.displayText}
            </a>
          ) : (
            <div className="flex items-center text-sm text-app-text-secondary">
              <ActionTextIcon />
              <span className="font-medium mr-1">Suggested:</span>
              <span>{insight.suggestedAction.displayText}</span>
            </div>
          )}
        </div>
      )}

      {/* Inline Details Section */}
      {displayMode === 'inline' && isInlineExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <InsightDetailsContent insight={insight} isInline={true} />
        </div>
      )}
    </div>
  );
};