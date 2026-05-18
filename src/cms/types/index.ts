/**
 * CMS Domain Types
 */

export type PostLifecycleState =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

export type CMSAction =
  | "SAVE_DRAFT"
  | "REQUEST_REVIEW"
  | "SCHEDULE"
  | "PUBLISH"
  | "ARCHIVE"
  | "RESTORE"
  | "REQUEST_CHANGES";

export interface PostMirror {
  id: string;
  title: string;
  slug: string;
  content: string;
  lifecycle_state: PostLifecycleState;
  is_locked: boolean;
  seo_snapshot: {
    score: number;
    keyword: string;
    density: number;
  };
  last_audit_event: string;
  version_number: number;
  published_at?: string | null;
}

export interface Post extends PostMirror {
  excerpt: string;
  category: string;
  featured_image_url: string;
  image_alt: string;
  meta_title: string;
  meta_description: string;
  search_intent?: string;
  status: 'draft' | 'published';
  index_status: string;
  internal_link_count: number;
  created_at?: string;
  tags?: string[];
}
