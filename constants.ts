
export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const EXAMPLE_ALERT_TAGS: string[] = [
  "Noisy",
  "Suppressed",
  "No Automation",
  "No ITR",
  "Unclaimed",
  "High Severity",
  "Customer Impact",
  "Database Issue",
  "Network Error",
  "Resolved Automatically",
  "Requires Manual Intervention",
  "Flapping",
  "Configuration Error",
  "Security Alert",
  "Payment Service",
  "Auth Service",
  "Inventory API",
  "Logging Pipeline",
  "K8s Node Unhealthy",
  "Disk Space Low",
  "CPU High",
  "Memory Low",
  "Latency Spike",
  "Error Rate High"
];

export const TAG_COLORS: { [key: string]: string } = {
  // Brand color based tags
  "Noisy": "bg-brand-yellow text-yellow-800 border border-yellow-400",
  "High Severity": "bg-brand-red text-red-100 border border-red-400",
  "Critical": "bg-brand-red text-red-100 border border-red-400", // Alias
  "Customer Impact": "bg-brand-pink text-pink-100 border border-pink-400",
  "No Automation": "bg-brand-orange text-orange-100 border border-orange-400",
  "Resolved Automatically": "bg-brand-green text-green-100 border border-green-400",
  "Flapping": "bg-brand-teal text-teal-100 border border-teal-400",
  "Security Alert": "bg-brand-purple text-purple-100 border border-purple-400",
  
  // Status-like tags with neutral/status colors
  "Suppressed": "bg-slate-400 text-slate-800 border border-slate-500",
  "Requires Manual Intervention": "bg-amber-400 text-amber-800 border border-amber-500",
  "Unclaimed": "bg-slate-300 text-slate-700 border border-slate-400",
  "No ITR": "bg-orange-300 text-orange-800 border border-orange-400", // Slightly lighter orange

  // Issue type tags
  "Database Issue": "bg-sky-500 text-sky-100 border border-sky-600",
  "Network Error": "bg-indigo-500 text-indigo-100 border border-indigo-600",
  "Configuration Error": "bg-rose-500 text-rose-100 border border-rose-600",
  
  // Generic service/component examples or common technical tags
  "Payment Service": "bg-blue-200 text-blue-800 border border-blue-400",
  "Auth Service": "bg-purple-200 text-purple-800 border border-purple-400",
  "Inventory API": "bg-green-200 text-green-800 border border-green-400",
  "Logging Pipeline": "bg-gray-300 text-gray-800 border border-gray-400",
  "K8s Node Unhealthy": "bg-red-300 text-red-800 border border-red-400",
  "Disk Space Low": "bg-yellow-300 text-yellow-800 border border-yellow-400",
  "CPU High": "bg-orange-200 text-orange-800 border border-orange-400",
  "Memory Low": "bg-amber-200 text-amber-800 border border-amber-400",
  "Latency Spike": "bg-cyan-200 text-cyan-800 border border-cyan-400",
  "Error Rate High": "bg-pink-200 text-pink-800 border border-pink-400",

  // Specific tags from mock statistical data for consistency
  "Hadoop": "bg-blue-100 text-blue-700 border border-blue-300",
  "JVM": "bg-teal-100 text-teal-700 border border-teal-300",
  "Network": "bg-sky-100 text-sky-700 border border-sky-300", // General network tag
  "Uncategorized": "bg-slate-200 text-slate-600 border border-slate-300",

  // Default fallback
  "default": "bg-slate-200 text-slate-700 border border-slate-300"
};
