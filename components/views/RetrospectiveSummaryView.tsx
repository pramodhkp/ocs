
import React from 'react';
import { RetrospectiveSummary, TagInsightItem, DisplayMode } from '../../types';
import { EXAMPLE_ALERT_TAGS } from '../../constants';
import { SummarySection } from '../SummarySection';
import { DrilldownSection } from '../DrilldownSection';
import { CustomInsightCreator } from '../CustomInsightCreator';
import { ErrorDisplay } from '../ErrorDisplay';
import { InsightCard } from '../InsightCard';

interface RetrospectiveSummaryViewProps {
  overallSummaryText: string;
  promotedApiInsights: TagInsightItem[]; // Renamed from summaryData.topInsights
  detailedApiInsights: TagInsightItem[]; // Renamed from summaryData.detailedInsights
  customInsights: TagInsightItem[]; // User-generated insights, displayed separately for now
  isGeneratingCustomInsight: boolean;
  customInsightError: string | null;
  onSelectInsight: (insight: TagInsightItem) => void;
  onTogglePromoteInsight: (insightId: string) => void; // New prop
  onGenerateCustomInsight: (tags: string[]) => Promise<void>;
  onClearCustomInsightError: () => void;
  displayMode: DisplayMode;
  availableTags: string[];
}

export const RetrospectiveSummaryView: React.FC<RetrospectiveSummaryViewProps> = ({
  overallSummaryText,
  promotedApiInsights,
  detailedApiInsights,
  customInsights,
  isGeneratingCustomInsight,
  customInsightError,
  onSelectInsight,
  onTogglePromoteInsight,
  onGenerateCustomInsight,
  onClearCustomInsightError,
  displayMode,
  availableTags
}) => {
  return (
    <div className="space-y-12">
      <SummarySection 
        overallSummaryText={overallSummaryText}
        insights={promotedApiInsights} // Pass the promoted insights here
        onSelectInsight={onSelectInsight}
        onTogglePromote={onTogglePromoteInsight} // Pass down the handler
        displayMode={displayMode}
      />
      <DrilldownSection 
        insights={detailedApiInsights} // Pass the detailed (non-promoted) insights here
        onSelectInsight={onSelectInsight}
        onTogglePromote={onTogglePromoteInsight} // Pass down the handler
        displayMode={displayMode}
      />
      <section className="rounded-lg shadow-lg overflow-hidden border border-section-border">
        <CustomInsightCreator 
          availableTags={availableTags}
          onGenerate={onGenerateCustomInsight}
          isLoading={isGeneratingCustomInsight}
        />
        {customInsightError && 
          <div className="p-6 md:p-8 bg-section-bg">
            <ErrorDisplay message={customInsightError} onRetry={onClearCustomInsightError} />
          </div>
        }
        
        {customInsights.length > 0 && (
          <>
            <div className="bg-section-header-bg p-4 md:p-6 border-t border-section-border">
                <h2 className="text-xl md:text-2xl font-semibold text-app-text-primary mb-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Custom Insights
                </h2>
            </div>
            <div className="p-6 md:p-8 bg-section-bg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customInsights.map((insight, index) => (
                    <InsightCard 
                    key={insight.id || `custom-${index}-${insight.tags.join('-')}`} 
                    insight={insight} 
                    // For custom insights, promotion is not yet handled in this iteration.
                    // Defaulting to isPromoted=false and a no-op for onTogglePromote for this section.
                    isPromoted={false} 
                    onTogglePromote={() => { /* TODO: Extend promotion to custom insights */ }}
                    onSelect={onSelectInsight} 
                    displayMode={displayMode}
                    />
                ))}
                </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};