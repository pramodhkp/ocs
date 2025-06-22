
import React from 'react';
import { TagInsightItem, DisplayMode } from '../types';
import { InsightCard } from './InsightCard';

interface SummarySectionProps {
  overallSummaryText: string;
  insights: TagInsightItem[]; // Changed from topInsights to generic insights (these will be the promoted ones)
  onSelectInsight: (insight: TagInsightItem) => void; 
  onTogglePromote: (insightId: string) => void; // New prop
  displayMode: DisplayMode;
}

const LightbulbIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-brand-blue inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m4.95-12.95l1.414-1.414M5.636 5.636l1.414 1.414m12.728 0l-1.414 1.414M6.343 17.657l-1.414-1.414m12.728 0l-1.414-1.414" />
  </svg>
);

const InfoIcon: React.FC = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


export const SummarySection: React.FC<SummarySectionProps> = ({ overallSummaryText, insights, onSelectInsight, onTogglePromote, displayMode }) => {
  return (
    <section className="rounded-lg shadow-lg overflow-hidden border border-section-border">
      <div className="bg-section-header-bg p-4 md:p-5">
        <h2 className="text-xl md:text-2xl font-semibold text-app-text-primary flex items-center">
          <InfoIcon />
          Overall Summary
        </h2>
      </div>
      <div className="p-6 md:p-8 bg-section-bg space-y-8">
        <p className="text-app-text-secondary leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200">
          {overallSummaryText}
        </p>

        <div>
          <h3 className="text-xl font-semibold text-app-text-primary mb-5 flex items-center">
            <LightbulbIcon />
            Top Insights
          </h3>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map((insight) => (
                <InsightCard 
                  key={insight.id || insight.tags.join('-')} // Use ID if available
                  insight={insight} 
                  isPromoted={true} // Insights in this section are always promoted
                  onSelect={onSelectInsight} 
                  onTogglePromote={onTogglePromote}
                  displayMode={displayMode} 
                />
              ))}
            </div>
          ) : (
            <p className="text-app-text-secondary">No top insights selected. Promote insights from the detailed section below.</p>
          )}
        </div>
      </div>
    </section>
  );
};