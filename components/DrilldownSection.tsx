
import React from 'react';
import { TagInsightItem, DisplayMode } from '../types';
import { InsightCard } from './InsightCard';

interface DrilldownSectionProps {
  insights: TagInsightItem[]; // Changed from detailedInsights to generic insights (these will be non-promoted)
  onSelectInsight: (insight: TagInsightItem) => void; 
  onTogglePromote: (insightId: string) => void; // New prop
  displayMode: DisplayMode;
}

const MagnifyingGlassIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const DrilldownSection: React.FC<DrilldownSectionProps> = ({ insights, onSelectInsight, onTogglePromote, displayMode }) => {
  return (
    <section className="rounded-lg shadow-lg overflow-hidden border border-section-border">
      <div className="bg-section-header-bg p-4 md:p-5">
        <h2 className="text-xl md:text-2xl font-semibold text-app-text-primary flex items-center">
          <MagnifyingGlassIcon />
          Detailed Tag Insights
        </h2>
      </div>
      <div className="p-6 md:p-8 bg-section-bg">
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Reduced gap slightly for closer cards */}
            {insights.map((insight) => (
              <InsightCard 
                key={insight.id || insight.tags.join('-')} // Use ID if available
                insight={insight} 
                isPromoted={false} // Insights in this section are not promoted
                onSelect={onSelectInsight} 
                onTogglePromote={onTogglePromote}
                displayMode={displayMode} 
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-app-text-secondary py-6">No detailed insights available for drilldown, or all insights have been promoted.</p>
        )}
      </div>
    </section>
  );
};