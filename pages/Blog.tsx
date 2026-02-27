import React from 'react';

const Blog: React.FC = () => {
    const posts = [
        {
            title: 'Luxury Shortlet in Asaba (2026 Guide) | Umunna Stays',
            slug: 'luxury-shortlet-asaba-2026-guide',
            excerpt: 'Stay in premium serviced apartments in Asaba with concierge, 24/7 power, airport pickup & executive comfort. Book Umunna Stays today.',
            category: 'Luxury Apartments Asaba'
        },
        {
            title: 'Best Shortlet in Asaba for Executives',
            slug: 'best-shortlet-in-asaba-for-executives',
            excerpt: 'Discover why top executives, diaspora, and business travelers choose Umunna Stays over traditional hotels in Asaba.',
            category: 'Asaba Business Travel Guide'
        }
    ];

    return (
        <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-charcoal mb-4">
                        Umunna Stays Insider: Asaba Travel Guide
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the ultimate luxury shortlet experience, executive travel tips, and the best things to do in Asaba, Delta State.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post.slug} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.hash = `blog/${post.slug}`}>
                            <div className="h-48 bg-gray-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop" alt={post.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6">
                                <div className="text-xs font-semibold text-brand tracking-wider uppercase mb-2">{post.category}</div>
                                <h3 className="text-xl font-bold text-charcoal mb-3 line-clamp-2">{post.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                                <div className="text-brand font-medium group flex items-center text-sm">
                                    Read Guide
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
