/**
 * CMS Reflection Store — Backend Authority Mirror
 * 
 * This store is a READ-ONLY REFLECTION of the backend state.
 * It has NO mutation authority. All changes must flow through cmsActions.dispatch.
 */

import { create } from 'zustand';
import { Post, CMSAction } from '../types';
import { cmsGateway } from '../services/cmsGateway';

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  
  // Reflection Actions
  fetchPosts: () => Promise<void>;
  
  // Command Dispatcher
  dispatch: (action: CMSAction, payload: any) => Promise<void>;
  
  // Normalization Helper
  normalizePost: (row: any) => Post;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    const { data, error } = await cmsGateway.getPosts();
    if (error) {
      set({ error: String(error), loading: false });
    } else {
      const normalized = (data || []).map(post => get().normalizePost(post));
      set({ posts: normalized, loading: false });
    }
  },

  normalizePost: (row: any): Post => ({
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
    canonical_url: row.canonical_url ?? "",
    status: row.status ?? "draft",
    index_status: row.index_status ?? (row.is_indexed ? "indexed" : "pending"),
    internal_link_count: row.internal_link_count ?? 0,
    created_at: row.created_at ?? "",
    tags: row.tags ?? []
  }),

  dispatch: async (action: CMSAction, payload: any) => {
    set({ loading: true, error: null });
    
    const { data, error } = await cmsGateway.dispatch(action, payload);
    
    if (error) {
      // Fail-Loud Governance: Surface backend rejection
      set({ error: `CMS Authority Rejected Action: ${error}`, loading: false });
      throw new Error(error); // Re-throw to block UI interaction if needed
    } else {
      // On success, we re-fetch to reflect the new backend truth
      await get().fetchPosts();
      set({ loading: false });
    }
  }
}));

