/**
 * CMS Gateway — Authoritative Domain Entry Point
 * 
 * ALL CMS-related data operations must flow through this gateway via RPC.
 * Frontend is FORBIDDEN from direct database mutations.
 */

import { supabase } from '@/lib/supabaseClient';
import { CMSAction, Post, PostMirror } from '../types';

export interface CMSResponse<T> {
  data: T | null;
  error: string | null;
}

export const cmsGateway = {
  /**
   * Fetch all blog posts (Reflection Layer)
   */
  async getPosts(): Promise<CMSResponse<Post[]>> {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        slug, 
        content, 
        lifecycle_state, 
        is_locked, 
        seo_snapshot, 
        version_number, 
        internal_link_count, 
        published_at, 
        created_at, 
        excerpt, 
        category, 
        featured_image_url, 
        image_alt, 
        meta_title, 
        meta_description, 
        status, 
        index_status, 
        tags
      `)
      .order('created_at', { ascending: false });
    
    const normalizedData = data ? data.map(row => this.normalizePost(row)) : null;
    return { data: normalizedData as Post[], error: error?.message || null };
  },

  normalizePost(row: any): Post {
    return {
      id: row.id,
      title: row.title ?? "",
      slug: row.slug ?? "",
      content: row.content ?? "",
      lifecycle_state: row.lifecycle_state ?? "draft",
      is_locked: row.is_locked ?? false,
      version_number: row.version_number ?? 1,
      seo_snapshot: row.seo_snapshot ?? {
        score: 0,
        keyword: "",
        density: 0
      },
      last_audit_event: row.last_audit_event ?? "",
      published_at: row.published_at ?? null,
      excerpt: row.excerpt ?? "",
      category: row.category ?? "",
      featured_image_url: row.featured_image_url ?? "",
      image_alt: row.image_alt ?? "",
      meta_title: row.meta_title ?? "",
      meta_description: row.meta_description ?? "",
      search_intent: row.search_intent ?? "",
      status: row.status ?? "draft",
      index_status: row.index_status ?? (row.is_indexed ? "indexed" : "pending"),
      internal_link_count: row.internal_link_count ?? 0,
      created_at: row.created_at ?? "",
      tags: row.tags ?? []
    };
  },

  /**
   * The Single Authority Entry Point for Mutations
   */
  async dispatch(action: CMSAction, payload: any): Promise<CMSResponse<any>> {
    if (!supabase) throw new Error("Supabase client not initialized");

    console.log(`[CMS Gateway] Dispatching Action: ${action}`, payload);

    let rpcMethod = '';
    let rpcPayload = {};

    switch (action) {
      case "SAVE_DRAFT":
        rpcMethod = 'cms_save_draft';
        rpcPayload = { p_post: payload };
        break;
      case "REQUEST_REVIEW":
        rpcMethod = 'cms_request_review';
        rpcPayload = { p_post_id: payload.id };
        break;
      case "PUBLISH":
        rpcMethod = 'cms_publish';
        rpcPayload = { p_post_id: payload.id };
        break;
      case "ARCHIVE":
        rpcMethod = 'cms_archive';
        rpcPayload = { p_post_id: payload.id };
        break;
      case "SCHEDULE":
        rpcMethod = 'cms_schedule';
        rpcPayload = { p_post_id: payload.id, p_scheduled_time: payload.scheduled_time };
        break;
      default:
        throw new Error(`Unsupported CMS Action: ${action}`);
    }

    const { data, error } = await supabase.rpc(rpcMethod, rpcPayload);

    if (error) {
      console.error(`[CMS Gateway] Action ${action} REJECTED:`, error.message);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  },

  /**
   * Read-only SEO Reflectors
   */
  async findLinkOpportunities(draftContent: string, currentPostId?: string) {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data: publishedPosts } = await supabase
      .from('posts')
      .select('id, title, slug, focus_keyword')
      .eq('status', 'published');
    
    return { data: publishedPosts, error: null };
  },

  async recordIndexingEvent(postId: string, fullUrl: string, simStatus: any) {
    if (!supabase) throw new Error("Supabase client not initialized");
    
    const { data, error } = await supabase.rpc('cms_record_indexing', {
      p_post_id: postId,
      p_url: fullUrl,
      p_status: simStatus.status,
      p_method: simStatus.method
    });

    return { data, error: error?.message || null };
  },

  /**
   * 🤖 SEO Intelligence Layer Methods
   */
  async getSEOTelemetry(postId: string): Promise<CMSResponse<any[]>> {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase
      .from('seo_performance_snapshots')
      .select('id, post_id, snapshot_date, score, organic_rank, visibility_index')
      .eq('post_id', postId)
      .order('snapshot_date', { ascending: false });
    
    return { data, error: error?.message || null };
  },

  async getRecommendations(postId: string): Promise<CMSResponse<any[]>> {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase
      .from('seo_regeneration_recommendations')
      .select('id, post_id, status, severity, recommendation_text, type')
      .eq('post_id', postId)
      .eq('status', 'pending')
      .order('severity', { ascending: false });
    
    return { data, error: error?.message || null };
  },

  async runDecayDetection(postId: string): Promise<CMSResponse<any>> {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase.rpc('detect_content_decay', { p_post_id: postId });
    return { data, error: error?.message || null };
  }
};
