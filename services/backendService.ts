// Service to interact with the Flask backend

const BASE_URL = 'http://localhost:5000/api'; // Assuming Flask runs on port 5000

export interface DailySummaryPayload {
  text: string;
  // Add any other fields that your daily summary might contain
  // e.g., author?: string; date?: string;
}

export interface RetrospectiveResponse {
  summary: string;
  source_summary_count: number;
  error?: string;
}

export interface SubmitDailyResponse {
  message: string;
  current_summary_count: number;
  error?: string;
}

/**
 * Submits a daily summary to the backend.
 * @param summaryPayload - The content of the daily summary.
 * @returns The response from the backend.
 */
export const submitDailySummary = async (summaryPayload: DailySummaryPayload): Promise<SubmitDailyResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/submit_daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(summaryPayload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to submit daily summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { message: '', current_summary_count: 0, error: errorMessage };
  }
};

/**
 * Fetches the retrospective summary from the backend.
 * @returns The retrospective summary and related data.
 */
export const getRetrospectiveSummary = async (): Promise<RetrospectiveResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/retrospective`, {
      method: 'GET', // As defined in Flask app
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch retrospective summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { summary: '', source_summary_count: 0, error: errorMessage };
  }
};

// --- New service functions for mock data ---
import { DailySummary, GeneratedRetrospectiveSummary } from '../types'; // Adjust path as needed

/**
 * Fetches mock daily summaries from the backend.
 * @param count Optional number of summaries to fetch.
 * @returns A promise that resolves to an array of DailySummary objects.
 */
export const getMockDailySummaries = async (count?: number): Promise<DailySummary[]> => {
  try {
    const url = new URL(`${BASE_URL}/mock/daily_summaries`);
    if (count !== undefined) {
      url.searchParams.append('count', String(count));
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json() as DailySummary[];
  } catch (error) {
    console.error('Failed to fetch mock daily summaries:', error);
    // Return an empty array or re-throw, depending on desired error handling
    return [];
  }
};

/**
 * Fetches mock retrospective summaries from the backend.
 * @param count Optional number of summaries to fetch.
 * @returns A promise that resolves to an array of GeneratedRetrospectiveSummary objects.
 */
export const getMockRetrospectiveSummaries = async (count?: number): Promise<GeneratedRetrospectiveSummary[]> => {
  try {
    const url = new URL(`${BASE_URL}/mock/retrospective_summaries`);
    if (count !== undefined) {
      url.searchParams.append('count', String(count));
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json() as GeneratedRetrospectiveSummary[];
  } catch (error) {
    console.error('Failed to fetch mock retrospective summaries:', error);
    // Return an empty array or re-throw
    return [];
  }
};
