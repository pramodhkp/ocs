

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { RetrospectiveSummary, TagInsightItem, TrendDataPoint, Alert, SuggestedAction } from '../types';
import { GEMINI_MODEL_NAME, EXAMPLE_ALERT_TAGS } from '../constants';

const parseJsonFromMarkdown = (text: string): any => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON string:", jsonStr, e);
    throw new Error("Invalid JSON response from API. The response might not be valid JSON or might be incomplete.");
  }
};

const generateMainSummaryPrompt = (): string => {
  return `
    You are an expert oncall engineer and SRE, tasked with generating a retrospective summary for a recent oncall shift.
    The summary should provide actionable insights based on alert tags, including trend data, alert notes summaries, detailed alert examples, and a suggested action for each insight.
    
    Please generate a JSON object matching the following TypeScript interfaces:

    interface TrendDataPoint {
      date: string; // Day identifier for the trend (e.g., "Day 1", "Day 2", ... "Day 7" or specific dates like "Jul 10")
      count: number; // Alert count for this tag/insight on that day
    }

    interface Alert {
      id: string; // Unique alert identifier, e.g., "ALERT-12345"
      title: string; // The alert title
      timestamp: string; // Timestamp of the alert, e.g., "2023-10-27 14:35:00"
      severity?: 'Critical' | 'Warning' | 'Info';
      description?: string; // A brief one-sentence description of the alert
    }

    interface SuggestedAction {
      displayText: string; // User-facing text for the action, e.g., "View Runbook for High CPU" or "Create JIRA for Flapping Alert"
      actionUrl?: string; // Optional URL for the action, e.g., to a runbook, JIRA, or dashboard. Create plausible internal-looking URLs like "https://wiki.example-company.com/runbooks/high-cpu" or "https://jira.example-company.com/secure/CreateIssue!default.jspa?project=OPS&summary=Investigate%20Flapping%20Alerts"
    }

    interface TagInsightItem {
      tags: string[]; // e.g., ["Noisy", "Payment Service"] or ["High Severity"]
      count: number; // Number of alerts matching these tags during the CURRENT oncall shift
      summary: string; // A brief summary of this insight (2-3 sentences)
      recommendation?: string; // An actionable recommendation (1-2 sentences)
      exampleAlertTitles?: string[]; // 1-3 example alert titles for this category (can be drawn from detailedAlerts)
      trendData?: TrendDataPoint[]; // Array of 5-7 data points showing alert counts for these tags over the past lookback period (e.g., last 7 days). Dates should be in chronological order.
      alertNotesSummary?: string; // A concise summary (1-2 sentences) derived from hypothetical alert notes for this category. E.g., "Engineers noted these were often due to config drift and resolved by rollback." or "Most alerts self-resolved but manual checks were performed."
      detailedAlerts?: Alert[]; // An array of 2-4 specific Alert objects that contributed to this insight during the current shift. Ensure variety and relevance to the insight's tags and summary.
      suggestedAction?: SuggestedAction; // A specific, actionable next step related to this insight.
    }
    
    interface RetrospectiveSummary {
      overallSummaryText: string; // A detailed 3-5 sentence overall summary of the oncall shift. 
                                   // This summary should be concrete. Include:
                                   // - Specific examples of incidents or recurring patterns observed (e.g., "repeated database failovers," "high latency spikes in the checkout service").
                                   // - Mention key services that were most affected (e.g., "The Payment Gateway and User Authentication services experienced the most disruptions.").
                                   // - If possible, briefly touch upon any impact on SLOs or user experience (e.g., "This led to a temporary degradation of login success rates.").
                                   // - Conclude with a sentence on the overall health or key challenges of the shift (e.g., "Overall, the shift was challenging due to persistent upstream dependency issues.").
      topInsights: TagInsightItem[]; // 2-4 key insights, each including all fields from TagInsightItem.
      detailedInsights: TagInsightItem[]; // 4-6 detailed insights, each including all fields from TagInsightItem.
    }

    Consider using tags from this list, but feel free to add other relevant service-specific or issue-specific tags: 
    ${EXAMPLE_ALERT_TAGS.join(', ')}.

    Focus on common oncall scenarios: noisy alerts, alerts lacking automation, critical issues, etc.
    Ensure counts for the current shift (in 'count' field) and for 'trendData' are realistic. 
    The 'trendData' should reflect a plausible historical pattern for the insight.
    Make summaries, recommendations, alertNotesSummary, suggestedAction.displayText, and alert descriptions concise and actionable.
    For 'detailedAlerts', provide realistic timestamps from within a typical oncall shift period (e.g., over the last 12-24 hours).
    For 'suggestedAction', if an 'actionUrl' is provided, ensure it's a plausible (though hypothetical) internal URL.

    IMPORTANT JSON FORMATTING:
    - Ensure all JSON arrays are correctly formatted. Commas (,) must SEPARATE elements.
    - Correct: \`[ { "key": "value" }, { "key": "value" } ]\`
    - Incorrect: \`[ ,{ "key": "value" } ]\`, \`[ { "key": "value" }, ,{ "key": "value" } ]\`, \`[ { "key": "value" },{ "key": "value" } ,]\`
    - Do not use trailing commas after the last element in an array or object.
    
    Provide your response ONLY as a valid JSON object matching the RetrospectiveSummary interface.
    Do not include any other text or explanations before or after the JSON object.
  `;
};

const generateCustomInsightPrompt = (selectedTags: string[]): string => {
  return `
    You are an expert oncall engineer and SRE.
    A user has selected the following combination of alert tags: [${selectedTags.map(tag => `"${tag}"`).join(', ')}].
    
    Your task is to generate a single, plausible TagInsightItem based *only* on this specific combination of tags.
    This insight should represent hypothetical data, trends, examples, and a suggested action for alerts that would match ALL of these combined tags.
    If the tag combination is unusual or seems contradictory, try to create a coherent and logical scenario for it.

    Please generate a JSON object matching the following TypeScript interface for this TagInsightItem:

    interface TrendDataPoint {
      date: string; // Day identifier for the trend (e.g., "Day 1", "Day 2", ... "Day 7" or specific dates like "Jul 10")
      count: number; // Alert count for this tag combination on that day
    }

    interface Alert {
      id: string; // Unique alert identifier, e.g., "ALERT-CUSTOM-67890"
      title: string; // The alert title, relevant to the selected tags
      timestamp: string; // Timestamp of the alert, e.g., "2023-10-28 10:15:00"
      severity?: 'Critical' | 'Warning' | 'Info';
      description?: string; // A brief one-sentence description of the alert
    }

    interface SuggestedAction {
      displayText: string; // User-facing text for the action, e.g., "View Runbook for [Selected Tag]" or "Create JIRA for [Selected Tag Combination]"
      actionUrl?: string; // Optional URL for the action. Create plausible internal-looking URLs if applicable.
    }

    interface TagInsightItem {
      tags: string[]; // This should be exactly: [${selectedTags.map(tag => `"${tag}"`).join(', ')}]
      count: number; // Number of hypothetical alerts matching these tags during a recent oncall shift. Make this a realistic number (e.g., 1-15).
      summary: string; // A brief summary (2-3 sentences) explaining what this combination of tags might signify and what happened.
      recommendation?: string; // An actionable recommendation (1-2 sentences) based on this specific insight.
      exampleAlertTitles?: string[]; // 1-3 example alert titles highly relevant to this tag combination.
      trendData?: TrendDataPoint[]; // Array of 5-7 data points showing hypothetical alert counts for this tag combination over a lookback period. Dates should be in chronological order.
      alertNotesSummary?: string; // A concise summary (1-2 sentences) derived from hypothetical alert notes for this specific category.
      detailedAlerts?: Alert[]; // An array of 2-3 specific Alert objects that would contribute to this insight. Ensure they are highly relevant to the selected tags.
      suggestedAction?: SuggestedAction; // A specific, actionable next step related to this tag combination.
    }

    Ensure all fields are populated with plausible data.
    The 'count' should be for a single shift. 'trendData' should show a short history.
    Summaries, recommendations, alert details, and suggestedAction.displayText should be concise and directly related to the provided tags.

    IMPORTANT JSON FORMATTING:
    - Ensure all JSON arrays are correctly formatted. Commas (,) must SEPARATE elements.
    - Correct: \`[ { "key": "value" }, { "key": "value" } ]\`
    - Incorrect (commas before elements or trailing commas): \`[ ,{ "key": "value" } ]\`, \`[ { "key": "value" }, ,{ "key": "value" } ]\`, \`[ { "key": "value" },{ "key": "value" } ,]\`
    - Do not use trailing commas after the last element in an array or object.
    
    Provide your response ONLY as a valid JSON object matching the TagInsightItem interface.
    Do not include any other text or explanations before or after the JSON object.
  `;
}

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
      throw new Error("Gemini API key is not configured or is a placeholder. Please set the API_KEY environment variable.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generateRetrospectiveSummary = async (): Promise<RetrospectiveSummary> => {
  const client = getAiClient();
  const prompt = generateMainSummaryPrompt();

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6, 
      },
    });

    const rawText = response.text;
    if (!rawText) {
        throw new Error("Received empty response from Gemini API for main summary.");
    }

    const parsedData = parseJsonFromMarkdown(rawText);
    
    if (!parsedData.overallSummaryText || !parsedData.topInsights || !parsedData.detailedInsights) {
        throw new Error("Parsed JSON data is missing required fields for RetrospectiveSummary.");
    }
    (parsedData.topInsights as TagInsightItem[]).forEach((insight: TagInsightItem, index: number) => {
        if (!insight.tags || !Array.isArray(insight.tags)) throw new Error(`Missing or invalid tags in topInsights[${index}].`);
        if (insight.detailedAlerts && !Array.isArray(insight.detailedAlerts)) {
            throw new Error(`Invalid format for detailedAlerts in topInsights[${index}].`);
        }
    });
     (parsedData.detailedInsights as TagInsightItem[]).forEach((insight: TagInsightItem, index: number) => {
        if (!insight.tags || !Array.isArray(insight.tags)) throw new Error(`Missing or invalid tags in detailedInsights[${index}].`);
        if (insight.detailedAlerts && !Array.isArray(insight.detailedAlerts)) {
            throw new Error(`Invalid format for detailedAlerts in detailedInsights[${index}].`);
        }
    });

    return parsedData as RetrospectiveSummary;

  } catch (error) {
    console.error("Error generating retrospective summary from Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error (Main Summary): ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API for main summary.");
  }
};

export const generateCustomTagInsight = async (selectedTags: string[]): Promise<TagInsightItem> => {
  if (selectedTags.length === 0) {
    throw new Error("Cannot generate custom insight with no tags selected.");
  }
  const client = getAiClient();
  const prompt = generateCustomInsightPrompt(selectedTags);

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, // Lowered from 0.7 to 0.5 for better JSON structure adherence
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Received empty response from Gemini API for custom insight.");
    }
    
    const parsedData = parseJsonFromMarkdown(rawText);

    // Validate the structure of the single TagInsightItem
    if (!parsedData.tags || !Array.isArray(parsedData.tags) || typeof parsedData.count !== 'number' || typeof parsedData.summary !== 'string') {
      throw new Error("Parsed JSON data for custom insight is missing required fields or has incorrect types.");
    }
    
    // Ensure the returned tags match the selected tags.
    // This is important because the prompt asks the AI to use the exact selected tags.
    const returnedTagsSorted = [...parsedData.tags].sort();
    const selectedTagsSorted = [...selectedTags].sort();

    if (JSON.stringify(returnedTagsSorted) !== JSON.stringify(selectedTagsSorted)) {
        console.warn(
          "AI returned tags that don't perfectly match selected tags. Overwriting with user's selected tags.", 
          "Selected:", selectedTagsSorted, 
          "Returned:", returnedTagsSorted
        );
        parsedData.tags = selectedTags; // Enforce selected tags to be part of the final object
    } else {
      // If they match (even if order was different but content same), ensure the final object has the original user-selected order.
      parsedData.tags = selectedTags;
    }


    return parsedData as TagInsightItem;

  } catch (error) {
    console.error("Error generating custom tag insight from Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error (Custom Insight): ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API for custom insight.");
  }
};