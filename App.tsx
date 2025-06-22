
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Sidebar } from './components/Sidebar';
import { DisplayModeToggle } from './components/DisplayModeToggle';
import { RetrospectiveSummary, TagInsightItem, TrendDataPoint, Alert, DisplayMode, AppTab, StatisticalInsightsData, TopTagCountItem, ItemTypeCountItem, DailyTrendItem, OncallLoadDistributionItem } from './types';
import { generateRetrospectiveSummary, generateCustomTagInsight } from './services/geminiService';
import { EXAMPLE_ALERT_TAGS } from './constants';

import { RetrospectiveSummaryView } from './components/views/RetrospectiveSummaryView';
import { StatisticalInsightsView } from './components/views/StatisticalInsightsView';
import { TabNavigation } from './components/TabNavigation';

// --- Icons for Item Counts (Example using Heroicons-like paths) ---
const IncidentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
const AlertIconSolid: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.259a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.618 4.542a.75.75 0 011.06 0l.708.707a.75.75 0 01-1.06 1.06l-.707-.707a.75.75 0 010-1.06zm9.822-.001a.75.75 0 010 1.06l-.707.707a.75.75 0 11-1.06-1.06l.707-.707a.75.75 0 011.06 0zM3.66 8.75A.75.75 0 013 9.5v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.75-.75h.001c.088 0 .174 0 .26.002C2.936 8.75 3.54 8.75 3.66 8.75zm13.68-.002c.087 0 .172 0 .26.002a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.66-.75h.001zM10 18a.75.75 0 00.75-.75V16a.75.75 0 00-1.5 0v1.25a.75.75 0 00.75.75zM5.002 12.01a.75.75 0 01.707-.707l.707-.707a.75.75 0 011.061 1.06l-.707.707a.75.75 0 01-1.768-.353H5.002zm9.284-.001a.75.75 0 011.06-.707l.708.707a.75.75 0 11-1.06 1.06l-.707-.707a.75.75 0 010-1.06zM9 5.5a3 3 0 100 6 3 3 0 000-6zM11.5 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
  </svg>
);

const TaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
// --- End Icons ---

// Helper to create a somewhat unique ID for insights based on tags and index
const generateInsightId = (tags: string[], prefix: string, index: number): string => {
  const tagString = tags.join('_').replace(/\s+/g, '-').toLowerCase();
  return `${prefix}-${tagString}-${index}`;
};


const generateMockTrendData = (baseCount: number): TrendDataPoint[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => ({
    date: day,
    count: Math.max(0, Math.round(baseCount + (Math.random() * baseCount * 0.5) - (baseCount * 0.25)))
  }));
};

const generateMockAlerts = (count: number, baseTitle: string, severity: Alert['severity'] = 'Warning'): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const pastTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000); // within last 24 hours
    alerts.push({
      id: `MOCK-${baseTitle.replace(/\s+/g, '-')}-${i + 1000}`,
      title: `${baseTitle} Instance #${i+1}`,
      timestamp: pastTime.toISOString().replace('T', ' ').substring(0, 19),
      severity: severity,
      description: `This is a mock description for ${baseTitle} Instance #${i+1}. It experienced a temporary issue.`,
    });
  }
  return alerts;
};

const generateMockStatisticalData = (): StatisticalInsightsData => {
  const topTags: TopTagCountItem[] = [
    { tag: "Suppressed", count: 15, colorClass: "bg-orange-100 text-orange-700 border border-orange-300" },
    { tag: "Hadoop", count: 15, colorClass: "bg-blue-100 text-blue-700 border border-blue-300" },
    { tag: "JVM", count: 15, colorClass: "bg-teal-100 text-teal-700 border border-teal-300" },
    { tag: "Network", count: 15, colorClass: "bg-sky-100 text-sky-700 border border-sky-300" },
    { tag: "Uncategorized", count: 13, colorClass: "bg-slate-200 text-slate-600 border border-slate-300" },
  ];

  const itemCounts: ItemTypeCountItem[] = [
    { type: 'Incidents', count: 73, icon: IncidentIcon, colorClass: 'bg-red-50 text-red-700 border-red-200' },
    { type: 'Alerts', count: 0, icon: AlertIconSolid, colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { type: 'Tasks', count: 1, icon: TaskIcon, colorClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    { type: 'Notes', count: 1, icon: NoteIcon, colorClass: 'bg-green-50 text-green-700 border-green-200' },
  ];

  const weeklyTrendData: DailyTrendItem[] = [
    { day: "Mon", incidents: 5, alerts: 2, tasks: 1, notes: 0 },
    { day: "Tue", incidents: 17, alerts: 5, tasks: 0, notes: 1 },
    { day: "Wed", incidents: 10, alerts: 7, tasks: 2, notes: 0 },
    { day: "Thu", incidents: 12, alerts: 3, tasks: 1, notes: 1 },
    { day: "Fri", incidents: 15, alerts: 6, tasks: 0, notes: 0 },
    { day: "Sat", incidents: 3, alerts: 2, tasks: 1, notes: 1 },
    { day: "Sun", incidents: 2, alerts: 1, tasks: 0, notes: 0 },
  ];

  const oncallLoad: OncallLoadDistributionItem[] = [
    { name: "Category A", value: 20, color: "#8b5cf6" }, // purple
    { name: "Category B", value: 15, color: "#f97316" }, // orange
    { name: "Category C", value: 12, color: "#3b82f6" }, // blue
    { name: "Category D", value: 10, color: "#10b981" }, // green
    { name: "Category E", value: 8, color: "#ef4444" },   // red
  ];

  return {
    topTagsByCount: topTags,
    itemCountsByType: itemCounts,
    weeklyTrend: weeklyTrendData,
    oncallLoadDistribution: oncallLoad,
    totalOncallTime: oncallLoad.reduce((sum, item) => sum + item.value, 0),
  };
};


const App: React.FC = () => {
  const [overallSummaryText, setOverallSummaryText] = useState<string>('');
  const [allApiInsights, setAllApiInsights] = useState<TagInsightItem[]>([]);
  const [promotedInsightIds, setPromotedInsightIds] = useState<Set<string>>(new Set());
  
  const [statisticalData, setStatisticalData] = useState<StatisticalInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsightForSidebar, setSelectedInsightForSidebar] = useState<TagInsightItem | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('sidebar');
  const [activeTab, setActiveTab] = useState<AppTab>('retrospectiveSummary');

  const [customInsights, setCustomInsights] = useState<TagInsightItem[]>([]); // User-generated custom insights
  const [isGeneratingCustomInsight, setIsGeneratingCustomInsight] = useState<boolean>(false);
  const [customInsightError, setCustomInsightError] = useState<string | null>(null);

  const handleDisplayModeChange = () => {
    setDisplayMode(prevMode => {
      const newMode = prevMode === 'sidebar' ? 'inline' : 'sidebar';
      if (newMode === 'inline' && selectedInsightForSidebar) {
        setSelectedInsightForSidebar(null); 
      }
      return newMode;
    });
  };

  const handleSelectInsightForSidebar = (insight: TagInsightItem) => {
    if (displayMode === 'sidebar') {
      setSelectedInsightForSidebar(insight);
    } 
  };

  const handleCloseSidebar = () => {
    setSelectedInsightForSidebar(null);
  };

  const handleTogglePromoteInsight = (insightId: string) => {
    setPromotedInsightIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(insightId)) {
        newIds.delete(insightId);
      } else {
        newIds.add(insightId);
      }
      return newIds;
    });
  };

  const processAndSetSummaryData = (summary: RetrospectiveSummary) => {
    setOverallSummaryText(summary.overallSummaryText);
    const initialPromotedIds = new Set<string>();

    const processedTopInsights = summary.topInsights.map((insight, index) => {
      const id = insight.id || generateInsightId(insight.tags, 'api-top', index);
      initialPromotedIds.add(id);
      return { ...insight, id };
    });

    const processedDetailedInsights = summary.detailedInsights.map((insight, index) => {
      const id = insight.id || generateInsightId(insight.tags, 'api-detailed', index);
      return { ...insight, id };
    });
    
    setAllApiInsights([...processedTopInsights, ...processedDetailedInsights]);
    setPromotedInsightIds(initialPromotedIds);
  };


  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCustomInsightError(null); 
    setSelectedInsightForSidebar(null); 
    try {
      if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
        console.warn("Missing or placeholder API_KEY. Generating mock data instead of calling Gemini API.");
        const mockSummary: RetrospectiveSummary = {
          overallSummaryText: "This is a mock overall summary. The oncall shift saw a variety of alerts, with a significant number of noisy alerts from the payment service. Several alerts required manual intervention due to lack of automation. Key focus areas for improvement are reducing noise and enhancing automation playbooks. The Payment Gateway had several latency spikes mid-week, culminating in a brief outage on Thursday.",
          topInsights: [
            { 
              tags: ["Noisy", "Payment Service"], 
              count: 25, 
              summary: "High volume of noisy alerts from Payment Service, primarily due to transient network issues.", 
              recommendation: "Investigate and implement more robust filtering or self-healing for Payment Service alerts.",
              exampleAlertTitles: ["Payment API latency high", "Payment GW Error Rate Spike"],
              trendData: generateMockTrendData(20),
              alertNotesSummary: "Engineers noted these often correlated with brief upstream provider blips. Most self-resolved within 5 minutes.",
              detailedAlerts: generateMockAlerts(3, "Payment Service Latency Spike", "Warning"),
              suggestedAction: { 
                displayText: "Review Payment Service Alerting Rules", 
                actionUrl: "https://wiki.example-company.com/ops/payment-service-alerting" 
              }
            },
            { 
              tags: ["No Automation"], 
              count: 10, 
              summary: "Multiple critical alerts lacked automated recovery procedures, requiring manual intervention.", 
              recommendation: "Prioritize development of automation playbooks for these critical alert types.",
              exampleAlertTitles: ["DB Primary Node Down", "Cache Cluster Evictions High"],
              trendData: generateMockTrendData(8),
              alertNotesSummary: "Manual intervention for DB node failover took an average of 15 minutes. Cache eviction alerts required manual scaling.",
              detailedAlerts: generateMockAlerts(2, "DB Primary Node Down", "Critical"),
              suggestedAction: { 
                displayText: "Create JIRA for 'No Automation' Playbook Development", 
                actionUrl: "https://jira.example-company.com/secure/CreateIssue!default.jspa?project=SRE&summary=Develop%20Automation%20Playbooks" 
              }
            },
          ],
          detailedInsights: [
            { 
              tags: ["Noisy"], 
              count: 42, 
              summary: "Noisy alerts constituted a significant portion of the total alert volume across multiple services.", 
              exampleAlertTitles: ["CPU utilization > 95% on worker-3"], 
              recommendation: "Implement alert fatigue reduction strategies such as dynamic thresholds or improved alert grouping.",
              trendData: generateMockTrendData(35),
              alertNotesSummary: "Majority of CPU alerts were transient spikes not correlating with user impact. Consider adjusting thresholds or observation windows.",
              detailedAlerts: generateMockAlerts(4, "Noisy CPU Spike", "Warning"),
              suggestedAction: { 
                displayText: "Analyze Sources of Noisy CPU Alerts", 
                actionUrl: "https://dashboard.example-company.com/d/cpu-noise/analysis" 
              }
            },
            { 
              tags: ["Customer Impact"], 
              count: 2, 
              summary: "Two critical alerts directly indicated potential customer impact, one related to checkout failures.", 
              exampleAlertTitles: ["Checkout service unavailable"], 
              recommendation: "Prioritize RCA and implement fixes for customer-impacting alerts. Review monitoring for earlier detection.",
              trendData: generateMockTrendData(1),
              alertNotesSummary: "Checkout failure was due to a misconfiguration pushed in the last release. Rollback resolved the issue. Impact estimated at 500 users.",
              detailedAlerts: generateMockAlerts(1, "Checkout Service Unavailable", "Critical"),
              suggestedAction: { 
                displayText: "Initiate Post-Incident Review for Checkout Failure",
              }
            },
          ],
        };
        const mockStats = generateMockStatisticalData();
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        processAndSetSummaryData(mockSummary);
        setStatisticalData(mockStats);
      } else {
        const summary = await generateRetrospectiveSummary();
        const stats = generateMockStatisticalData(); // Using mock stats for now
        processAndSetSummaryData(summary);
        setStatisticalData(stats);
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred fetching data. Check console.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleGenerateCustomInsight = async (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      setCustomInsightError("Please select at least one tag to generate an insight.");
      return;
    }
    setIsGeneratingCustomInsight(true);
    setCustomInsightError(null);
    if (displayMode === 'sidebar') {
      setSelectedInsightForSidebar(null); 
    }

    try {
      let newInsight: TagInsightItem;
      if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
        console.warn("Missing or placeholder API_KEY. Generating MOCK custom insight.");
         await new Promise(resolve => setTimeout(resolve, 1500)); 
        newInsight = {
            tags: selectedTags,
            count: Math.floor(Math.random() * 10) + 1,
            summary: `This is a mock custom insight for tags: ${selectedTags.join(', ')}. It highlights a simulated scenario where these conditions co-occurred.`,
            recommendation: "Mock recommendation: Further investigate the correlation between these tags and refine monitoring.",
            exampleAlertTitles: [`Mock Alert for ${selectedTags[0]}`],
            trendData: generateMockTrendData(Math.floor(Math.random() * 5) + 2),
            alertNotesSummary: "Mock alert notes: Engineers observed this pattern during peak hours and suspect resource contention.",
            detailedAlerts: generateMockAlerts(2, `Mock Custom ${selectedTags[0]}`, Math.random() > 0.5 ? "Warning" : "Critical"),
            suggestedAction: {
              displayText: `Explore Runbook for ${selectedTags.join(' & ')}`,
              actionUrl: `https://wiki.example-company.com/runbooks/${selectedTags.join('-').toLowerCase()}`
            }
        };
      } else {
        newInsight = await generateCustomTagInsight(selectedTags);
      }
      // Assign an ID to the new custom insight
      const newCustomInsightWithId = {
        ...newInsight,
        id: newInsight.id || generateInsightId(newInsight.tags, 'custom', Date.now()) 
      };
      setCustomInsights(prev => [newCustomInsightWithId, ...prev]);

    } catch (err) {
      console.error("Failed to generate custom insight:", err);
      setCustomInsightError(err instanceof Error ? err.message : "An unknown error occurred generating the custom insight.");
    } finally {
      setIsGeneratingCustomInsight(false);
    }
  };

  const currentPromotedApiInsights = useMemo(() => {
    return allApiInsights.filter(insight => promotedInsightIds.has(insight.id!));
  }, [allApiInsights, promotedInsightIds]);

  const currentDetailedApiInsights = useMemo(() => {
    return allApiInsights.filter(insight => !promotedInsightIds.has(insight.id!));
  }, [allApiInsights, promotedInsightIds]);


  return (
    <div className="min-h-screen app-bg text-app-text-primary p-4 md:p-8 font-sans">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'retrospectiveSummary' && (
        <DisplayModeToggle currentMode={displayMode} onToggle={handleDisplayModeChange} /> 
      )}
      
      <main className="container mx-auto mt-4 md:mt-6 relative">
        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <ErrorDisplay message={error} onRetry={fetchInitialData} />}
        
        {!isLoading && !error && (
          <>
            {activeTab === 'retrospectiveSummary' && (
              <RetrospectiveSummaryView
                overallSummaryText={overallSummaryText}
                promotedApiInsights={currentPromotedApiInsights}
                detailedApiInsights={currentDetailedApiInsights}
                customInsights={customInsights} // Custom insights still handled separately for display
                isGeneratingCustomInsight={isGeneratingCustomInsight}
                customInsightError={customInsightError}
                onSelectInsight={handleSelectInsightForSidebar}
                onTogglePromoteInsight={handleTogglePromoteInsight}
                onGenerateCustomInsight={handleGenerateCustomInsight}
                onClearCustomInsightError={() => setCustomInsightError(null)}
                displayMode={displayMode}
                availableTags={EXAMPLE_ALERT_TAGS}
              />
            )}
            {activeTab === 'statisticalInsights' && statisticalData && (
              <StatisticalInsightsView data={statisticalData} />
            )}
          </>
        )}
      </main>

      {activeTab === 'retrospectiveSummary' && displayMode === 'sidebar' && selectedInsightForSidebar && (
         <Sidebar insight={selectedInsightForSidebar} onClose={handleCloseSidebar} />
      )}

      <footer className="text-center mt-12 py-4 text-sm text-app-text-secondary border-t border-section-border">
        Oncall Retrospective Summarizer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;