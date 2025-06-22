
import React from 'react';
import { TagInsightItem, Alert } from '../types';
import { TrendLineChart } from './TrendLineChart';
// Note: TagChip is imported where InsightDetailsContent is used if needed for header, but not directly here.

// Icons previously in Sidebar.tsx, now shared
const RecommendationIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const NotesIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ListIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const TrendIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const SeverityIndicator: React.FC<{ severity?: 'Critical' | 'Warning' | 'Info' }> = ({ severity }) => {
  let color = 'bg-slate-400';
  if (severity === 'Critical') color = 'bg-brand-red';
  else if (severity === 'Warning') color = 'bg-brand-yellow';
  else if (severity === 'Info') color = 'bg-brand-blue';
  return <span className={`w-3 h-3 ${color} rounded-full inline-block mr-2 shrink-0`} title={severity}></span>;
};

const ActionIcon: React.FC<{ hasUrl?: boolean }> = ({ hasUrl }) => {
  if (hasUrl) { // Icon for linkable action
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    );
  } // Icon for text-only suggestion
  return (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-pink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 6V4m0 16v-2m4.95-12.95l1.414-1.414M5.636 5.636l1.414 1.414m12.728 0l-1.414 1.414M6.343 17.657l-1.414-1.414m12.728 0l-1.414-1.414" />
    </svg>
  );
};


interface InsightDetailsContentProps {
  insight: TagInsightItem;
  isInline?: boolean; // To slightly adjust padding/margins for inline view
}

export const InsightDetailsContent: React.FC<InsightDetailsContentProps> = ({ insight, isInline = false }) => {
  return (
    <div className={`space-y-5 ${isInline ? 'pt-4' : 'p-1'}`}>
      {!isInline && ( // Only show this title if not inline, as card already shows it
        <div>
          <h3 className="text-lg font-semibold text-app-text-primary mb-1">
            Insight Summary
          </h3>
          <p className="text-app-text-secondary text-sm leading-relaxed">{insight.summary}</p>
          <p className="text-sm font-medium text-brand-blue mt-1">{insight.count} alerts this shift.</p>
        </div>
      )}

      {insight.suggestedAction && (
        <div>
          <h4 className="text-md font-semibold text-brand-pink mb-1 flex items-center">
            <ActionIcon hasUrl={!!insight.suggestedAction.actionUrl} /> Suggested Action
          </h4>
          {insight.suggestedAction.actionUrl ? (
            <a
              href={insight.suggestedAction.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); /* Allow link click without other card actions */}}
              className="inline-flex items-center text-sm font-medium text-brand-blue hover:text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md transition-colors duration-150"
              aria-label={`Action: ${insight.suggestedAction.displayText}`}
            >
              {insight.suggestedAction.displayText}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <p className="text-app-text-secondary text-sm leading-relaxed">{insight.suggestedAction.displayText}</p>
          )}
        </div>
      )}

      {insight.recommendation && (
        <div>
          <h4 className="text-md font-semibold text-brand-green mb-1 flex items-center">
            <RecommendationIcon /> Recommendation
          </h4>
          <p className="text-app-text-secondary text-sm leading-relaxed">{insight.recommendation}</p>
        </div>
      )}
      
      {insight.alertNotesSummary && (
        <div>
          <h4 className="text-md font-semibold text-brand-purple mb-1 flex items-center">
            <NotesIcon /> Insights from Alert Notes
          </h4>
          <p className="text-app-text-secondary text-sm italic leading-relaxed">{insight.alertNotesSummary}</p>
        </div>
      )}

      {insight.trendData && insight.trendData.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-brand-teal mb-2 flex items-center">
                <TrendIcon /> Alert Trend
            </h4>
            <TrendLineChart data={insight.trendData} title="" />
        </div>
      )}

      {insight.detailedAlerts && insight.detailedAlerts.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-brand-blue mb-2 flex items-center">
            <ListIcon /> Alerts Contributing to this Insight ({insight.detailedAlerts.length})
          </h4>
          <div className={`space-y-3 ${isInline ? 'max-h-60' : 'max-h-80'} overflow-y-auto pr-2 custom-scrollbar`}>
            {insight.detailedAlerts.map((alert, index) => (
              <div key={alert.id || index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center mb-1">
                  <SeverityIndicator severity={alert.severity} />
                  <h5 className="text-sm font-medium text-app-text-primary truncate" title={alert.title}>{alert.title}</h5>
                </div>
                <p className="text-xs text-app-text-secondary mb-1">{alert.timestamp}</p>
                {alert.description && <p className="text-xs text-slate-600">{alert.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {insight.exampleAlertTitles && insight.exampleAlertTitles.length > 0 && (!insight.detailedAlerts || insight.detailedAlerts.length === 0) && (
        <div>
          <h4 className="text-md font-semibold text-brand-blue mb-1 flex items-center">
            <ListIcon /> Example Alert Titles (Current Shift)
          </h4>
          <ul className="list-disc list-inside text-app-text-secondary text-sm space-y-1 pl-2">
            {insight.exampleAlertTitles.map((title, index) => (
              <li key={`ex-${index}`}>{title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
