import { supabase } from '@/lib/supabaseClient';

export interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  content: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  lifecycle_state: string;
  index_status: string;
}

export const fetchBlogPosts = async (): Promise<BlogPostData[]> => {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('posts')
    .select(`
      title,
      slug,
      excerpt,
      category_id,
      content,
      featured_image_url,
      published_at,
      meta_title,
      meta_description,
      focus_keyword,
      lifecycle_state,
      is_indexed
    `)
    .eq('lifecycle_state', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch failed:', error);
    return [];
  }

  return (data || []).map((post: any) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    category: post.category_id || 'Uncategorized',
    date: post.published_at || new Date().toISOString(),
    imageUrl:
      post.featured_image_url ||
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop',
    content: post.content || '',
    meta_title: post.meta_title || '',
    meta_description: post.meta_description || '',
    focus_keyword: post.focus_keyword || '',
    lifecycle_state: post.lifecycle_state || 'draft',
    index_status: post.is_indexed ? 'indexed' : 'pending',
  }));
};

export const fetchBlogPostBySlug = async (
  slug: string
): Promise<BlogPostData | null> => {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('posts')
    .select(`
      title,
      slug,
      excerpt,
      category_id,
      content,
      featured_image_url,
      published_at,
      meta_title,
      meta_description,
      focus_keyword,
      lifecycle_state,
      is_indexed
    `)
    .eq('slug', slug)
    .eq('lifecycle_state', 'published')
    .single();

  if (error || !data) {
    console.error(
      'Supabase fetch failed for single post or NOT PUBLISHED:',
      error
    );
    return null;
  }

  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || '',
    category: data.category_id || 'Uncategorized',
    date: data.published_at || new Date().toISOString(),
    imageUrl:
      data.featured_image_url ||
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop',
    content: data.content || '',
    meta_title: data.meta_title || '',
    meta_description: data.meta_description || '',
    focus_keyword: data.focus_keyword || '',
    lifecycle_state: data.lifecycle_state || 'draft',
    index_status: data.is_indexed ? 'indexed' : 'pending',
  };
};