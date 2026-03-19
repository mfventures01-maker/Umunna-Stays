
export interface BlogPostData {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    date: string;
    imageUrl: string;
    content?: string;
    meta_title?: string;
    meta_description?: string;
}

export const BLOG_POSTS: BlogPostData[] = [
    {
        title: 'Luxury Shortlet in Asaba (2026 Guide) | Umunna Stays',
        slug: 'luxury-shortlet-asaba-2026-guide',
        excerpt: 'Stay in premium serviced apartments in Asaba with concierge, 24/7 power, airport pickup & executive comfort. Book Umunna Stays today.',
        category: 'Luxury Apartments Asaba',
        date: '2026-03-10',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
    },
    {
        title: 'Best Shortlet in Asaba for Executives',
        slug: 'best-shortlet-in-asaba-for-executives',
        excerpt: 'Discover why top executives, diaspora, and business travelers choose Umunna Stays over traditional hotels in Asaba.',
        category: 'Asaba Business Travel Guide',
        date: '2026-03-05',
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop'
    }
];
