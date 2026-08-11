import { Article } from '../types.js';
import { safeFetchJson } from './apiConfig.js';

export interface ViralOptimizationResult {
  viralTitle: string;
  viralTitleTelugu: string;
  viralSummary: string;
  viralSummaryTelugu: string;
  viralHooks: string[];
  viralScore: number;
  trendingAngle: string;
}

export interface ViralTrendTopic {
  id: string;
  topicName: string;
  state: string;
  category: string;
  searchVolume: 'Viral (🔥)' | 'Very High' | 'Trending';
  proposedTitle: string;
  proposedTitleTelugu: string;
  viralSummary: string;
  viralSummaryTelugu: string;
  viralHook: string;
}

export interface ViralBatchResponse {
  success: boolean;
  updatedCount: number;
  message: string;
  articles?: Article[];
}

export interface ViralTrendAnalysisResponse {
  success: boolean;
  state: string;
  trends: ViralTrendTopic[];
  recommendation: string;
}

/**
 * Client-Side API Helper: Optimize a single article for virality using Gemini service layer
 */
export async function optimizeArticleForViralityApi(
  articleId: string,
  customTone: 'urgent' | 'good_news' | 'deadline_alert' | 'shocking_benefit' = 'good_news'
): Promise<{ success: boolean; article?: Article; result?: ViralOptimizationResult; message?: string }> {
  try {
    const data = await safeFetchJson<{ success: boolean; article?: Article; result?: ViralOptimizationResult; message?: string }>(
      '/api/admin/viral/optimize-article',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, customTone }),
      }
    );
    return data || { success: false, message: 'No response from server' };
  } catch (err: any) {
    console.error('Failed to optimize article for virality:', err);
    return { success: false, message: err.message || 'Network error' };
  }
}

/**
 * Client-Side API Helper: Batch optimize articles matching a state or category
 */
export async function batchOptimizeArticlesApi(
  stateFilter: string = 'All States',
  limit: number = 10
): Promise<ViralBatchResponse> {
  try {
    const data = await safeFetchJson<ViralBatchResponse>('/api/admin/viral/batch-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stateFilter, limit }),
    });
    return data || { success: false, updatedCount: 0, message: 'Failed to batch optimize' };
  } catch (err: any) {
    console.error('Batch optimization error:', err);
    return { success: false, updatedCount: 0, message: err.message };
  }
}

/**
 * Client-Side API Helper: Analyze real-time viral search trends across Indian states
 */
export async function fetchStateViralTrendsApi(stateName: string = 'Andhra Pradesh & Telangana'): Promise<ViralTrendAnalysisResponse> {
  try {
    const data = await safeFetchJson<ViralTrendAnalysisResponse>('/api/admin/viral/analyze-trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stateName }),
    });
    return data || {
      success: false,
      state: stateName,
      trends: [],
      recommendation: 'Unable to analyze trends at this time.',
    };
  } catch (err: any) {
    console.error('Fetch viral trends error:', err);
    return {
      success: false,
      state: stateName,
      trends: [],
      recommendation: 'Error reaching trend analysis service.',
    };
  }
}
