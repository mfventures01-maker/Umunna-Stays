/**
 * seoGraph.ts — Internal Linking & Index Verification Engine
 *
 * This module transforms isolated blog posts into an SEO ranking graph.
 * Features:
 * - Internal Link Detection & Density Enforcement
 * - Semantic Link Suggestion
 * - Internet Index Verification Mock/Integration
 */

import { supabase } from '@/lib/supabaseClient';

export interface InternalLinkOpportunity {
  keyword: string;
  targetSlug: string;
  targetTitle: string;
  relevanceScore: number;
}

export interface IndexStatus {
  status: 'indexed' | 'not_indexed' | 'crawled_not_ranking' | 'sitemap_only' | 'pending';
  lastChecked: string;
  method: 'gsc' | 'sitemap' | 'query';
}

/**
 * Parses HTML content to detect absolute and relative internal links pointing to the domain.
 */
export const detectInternalLinks = (htmlContent: string): number => {
  if (!htmlContent) return 0;
  
  // Match href="/..." or href="https://www.umunnastays.com.ng/..."
  const regex = /href=["'](https?:\/\/(www\.)?umunnastays\.com\.ng\/[^"']+|\/[^"']+)["']/gi;
  const matches = htmlContent.match(regex);
  
  return matches ? matches.length : 0;
};

/**
 * Analyzes draft content against all published posts to find semantic link opportunities.
 */
export const matchLinkOpportunities = (
  draftContent: string, 
  publishedPosts: any[], 
  currentPostId?: string
): InternalLinkOpportunity[] => {
  if (!draftContent || !publishedPosts) return [];
  
  const textContent = draftContent.replace(/<[^>]*>?/gm, ' ').toLowerCase();
  const opportunities: InternalLinkOpportunity[] = [];

  publishedPosts.forEach(post => {
    if (post.id === currentPostId) return; // Don't link to self
    
    const keyword = (post.focus_keyword || post.title).toLowerCase();
    
    // Basic semantic match: if the draft contains the keyword of another post
    if (keyword.length > 3 && textContent.includes(keyword)) {
      opportunities.push({
        keyword: post.focus_keyword || post.title,
        targetSlug: post.slug,
        targetTitle: post.title,
        relevanceScore: 90
      });
    }
  });

  return opportunities;
};

/**
 * Simulates GSC Indexing status.
 */
export const simulateIndexingStatus = (slug: string): IndexStatus => {
  return {
    status: Math.random() > 0.5 ? 'indexed' : 'crawled_not_ranking',
    lastChecked: new Date().toISOString(),
    method: 'gsc'
  };
};

/**
 * Computes the overarching Lifecycle State based on current parameters.
 */
export const determineLifecycleState = (
  currentStatus: 'draft' | 'published',
  indexStatus: string,
  seoScore: number
): string => {
  if (currentStatus === 'draft') {
    if (seoScore < 50) return 'draft';
    if (seoScore >= 50 && seoScore < 80) return 'editing';
    return 'seo_optimization';
  } else {
    // Published
    if (indexStatus === 'pending') return 'indexing_verification';
    if (indexStatus === 'indexed') return 'rank_tracking';
    if (indexStatus === 'crawled_not_ranking') return 're_optimization';
    return 'published';
  }
};
