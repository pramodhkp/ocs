
export enum AlertTag {
  NOISY = "Noisy",
  SUPPRESSED = "Suppressed",
  NO_AUTOMATION = "No Automation",
  NO_ITR = "No ITR", // ITR: Initial Triage/Response
  UNCLAIMED = "Unclaimed",
  HIGH_SEVERITY = "High Severity",
  CUSTOMER_IMPACT = "Customer Impact",
  DATABASE_ISSUE = "Database Issue",
  NETWORK_ERROR = "Network Error",
  RESOLVED_AUTOMATICALLY = "Resolved Automatically",
  REQUIRES_MANUAL_INTERVENTION = "Requires Manual Intervention",
  FLAPPING = "Flapping",
  CONFIGURATION_ERROR = "Configuration Error",
  SECURITY_ALERT = "Security Alert"
}

export interface TrendDataPoint {
  date: string; // e.g., "Mon", "Tue", or "YYYY-MM-DD"
  count: number;
}

// For individual alerts displayed in the sidebar
export interface Alert {
  id: string;
  title: string;
  timestamp: string; // e.g., "2023-10-27 14:35:00"
  tags?: string[]; // Specific tags for this alert, if different from insight tags
  description?: string;
  severity?: 'Critical' | 'Warning' | 'Info';
  notes?: string; // Potential source for alertNotesSummary
}

export interface SuggestedAction {
  displayText: string;
  actionUrl?: string; // URL for the action, e.g., to a runbook or JIRA
  // actionType?: 'LINK' | 'JIRA_TICKET' | 'RUNBOOK'; // Future enhancement
}

export interface TagInsightItem {
  id?: string; // Optional: Unique identifier for the insight item
  tags: string[]; 
  count: number; // Current shift count
  summary: string;
  recommendation?: string;
  exampleAlertTitles?: string[];
  trendData?: TrendDataPoint[]; 
  alertNotesSummary?: string; 
  detailedAlerts?: Alert[]; 
  suggestedAction?: SuggestedAction;
}

export interface RetrospectiveSummary {
  overallSummaryText: string;
  topInsights: TagInsightItem[];
  detailedInsights: TagInsightItem[];
}

export type DisplayMode = 'sidebar' | 'inline';

// --- New types for Statistical Insights ---

export interface TopTagCountItem {
  tag: string;
  count: number;
  colorClass?: string; // Optional: if specific styling per tag is needed beyond TagChip
}

export type ItemType = 'Incidents' | 'Alerts' | 'Tasks' | 'Notes';

export interface ItemTypeCountItem {
  type: ItemType;
  count: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // For an SVG icon component
  colorClass: string; // Tailwind class for background/text color
}

export interface DailyTrendItem {
  day: string; // "Mon", "Tue", etc.
  incidents: number;
  alerts: number;
  tasks: number;
  notes: number;
}

export interface OncallLoadDistributionItem {
  name: string; // Category name
  value: number; // e.g., hours spent
  color: string; // Hex color code for the pie chart slice
}

export interface StatisticalInsightsData {
  topTagsByCount: TopTagCountItem[];
  itemCountsByType: ItemTypeCountItem[];
  weeklyTrend: DailyTrendItem[];
  oncallLoadDistribution: OncallLoadDistributionItem[];
  totalOncallTime: number; // e.g., total hours for the oncall load pie chart
}

export type AppTab = 'retrospectiveSummary' | 'statisticalInsights';