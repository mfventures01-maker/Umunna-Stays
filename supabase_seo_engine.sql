-- Migration: SEO Intelligence Lifecycle & Internal Linking Engine
-- Apply this to your Supabase SQL Editor

-- 1. Extend existing 'posts' table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS lifecycle_state text DEFAULT 'draft' CHECK (lifecycle_state IN ('draft', 'editing', 'seo_optimization', 'published', 'indexing_verification', 'rank_tracking', 're_optimization')),
ADD COLUMN IF NOT EXISTS index_status text DEFAULT 'pending' CHECK (index_status IN ('pending', 'indexed', 'not_indexed', 'crawled_not_ranking', 'sitemap_only')),
ADD COLUMN IF NOT EXISTS last_crawled_at timestamptz,
ADD COLUMN IF NOT EXISTS seo_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS internal_link_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS version_number int DEFAULT 1;

-- 2. Create Index Verification Table
CREATE TABLE IF NOT EXISTS public.index_verification (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    url text NOT NULL,
    is_indexed boolean DEFAULT false,
    last_checked_at timestamptz DEFAULT now(),
    method text CHECK (method IN ('gsc', 'sitemap', 'query')),
    status_details text
);

-- 3. Create Internal Links Graph Table
CREATE TABLE IF NOT EXISTS public.internal_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    target_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    anchor_text text NOT NULL,
    context_snippet text,
    created_at timestamptz DEFAULT now()
);

-- 4. Create Post Versions Table (Version Control)
CREATE TABLE IF NOT EXISTS public.post_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    version_number int NOT NULL,
    content_snapshot text,
    seo_score_snapshot numeric,
    edited_at timestamptz DEFAULT now(),
    editor_id uuid REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_index_verification_post ON public.index_verification(post_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_source ON public.internal_links(source_post_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_target ON public.internal_links(target_post_id);
CREATE INDEX IF NOT EXISTS idx_post_versions_post ON public.post_versions(post_id);
