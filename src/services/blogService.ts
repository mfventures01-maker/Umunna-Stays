import { supabase } from '../lib/supabaseClient';
import { BLOG_POSTS, BlogPostData } from '../../blogData';

export const fetchBlogPosts = async (): Promise<BlogPostData[]> => {
    // If Supabase is not configured yet, fallback to local data
    if (!supabase) return BLOG_POSTS;

    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                title, 
                slug, 
                excerpt, 
                content,
                featured_image_url, 
                published_at,
                meta_title,
                meta_description,
                categories ( name )
            `)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error || !data || data.length === 0) {
            console.warn('Supabase fetch failed or no posts, falling back to local data.', error);
            return BLOG_POSTS;
        }

        return data.map((post: any) => ({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            category: post.categories?.name || 'Uncategorized',
            date: post.published_at || new Date().toISOString(),
            imageUrl: post.featured_image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop',
            content: post.content,
            meta_title: post.meta_title,
            meta_description: post.meta_description
        }));
    } catch (e) {
        console.error('Exception fetching blog posts:', e);
        return BLOG_POSTS;
    }
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPostData | null> => {
    if (!supabase) {
        return BLOG_POSTS.find(p => p.slug === slug) || null;
    }

    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                title, 
                slug, 
                excerpt, 
                content,
                featured_image_url, 
                published_at,
                meta_title,
                meta_description,
                categories ( name )
            `)
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error || !data) {
            console.warn('Supabase fetch failed for single post, falling back.', error);
            return BLOG_POSTS.find(p => p.slug === slug) || null;
        }

        return {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || '',
            category: data.categories?.name || 'Uncategorized',
            date: data.published_at || new Date().toISOString(),
            imageUrl: data.featured_image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop',
            content: data.content,
            meta_title: data.meta_title,
            meta_description: data.meta_description
        };
    } catch (e) {
        console.error('Exception fetching single blog post:', e);
        return BLOG_POSTS.find(p => p.slug === slug) || null;
    }
};
