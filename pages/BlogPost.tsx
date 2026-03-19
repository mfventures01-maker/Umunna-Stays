import React, { useState, useEffect } from 'react';
import { BlogPostData, BLOG_POSTS } from '../blogData';
import { fetchBlogPostBySlug } from '../src/services/blogService';

const BlogPost: React.FC<{ slug?: string }> = ({ slug }) => {
    const [post, setPost] = useState<BlogPostData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setPost(BLOG_POSTS[0]);
            setLoading(false);
            return;
        }

        fetchBlogPostBySlug(slug).then(data => {
            setPost(data || BLOG_POSTS[0]);
            setLoading(false);
        });
    }, [slug]);

    useEffect(() => {
        if (!post) return;
        // Dynamic SEO changes
        document.title = post.meta_title || post.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", post.meta_description || post.excerpt);
        }
    }, [post]);

    if (loading || !post) {
        return <div className="pt-24 pb-16 min-h-screen flex justify-center items-center">Loading...</div>;
    }

    return (
        <div className="pt-24 pb-16 bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb Schema Placeholder */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: `
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.umunnastays.com.ng"
          },{
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://www.umunnastays.com.ng/#blog"
          },{
            "@type": "ListItem",
            "position": 3,
            "name": "Luxury Shortlet in Asaba (2026 Guide)"
          }]
        }
        `}} />

                {/* FAQ Schema Placeholder */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: `
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [{
            "@type": "Question",
            "name": "Is Asaba safe for visitors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Asaba is generally safe, especially when staying in private, secure shortlet apartments like Umunna Stays which offer 24/7 security and concierge services."
            }
          }]
        }
        `}} />

                <div className="text-center mb-10">
                    <div className="text-sm font-semibold text-brand tracking-wider uppercase mb-4">{post.category}</div>
                    <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="text-gray-500 text-sm">Updated for 2026 • 5 min read</div>
                </div>

                <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden mb-12">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <article className="prose prose-lg prose-brand max-w-none text-gray-700">
                    {post.content ? (
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    ) : (
                        <>
                            <p>
                                When traveling to Asaba, Delta State for business or leisure, choosing the right accommodation makes all the difference. While there are many hotels, finding a truly luxury shortlet apartment in Asaba that meets executive standards can be challenging.
                            </p>

                            <h2 className="text-2xl font-bold text-charcoal mt-10 mb-5">Why Choose a Serviced Apartment in Asaba?</h2>
                            <p>
                                For diaspora visitors and premium travelers, a serviced apartment offers unparalleled privacy, space, and a home-away-from-home feel. At <a href="#home" className="text-brand hover:underline">Umunna Stays</a>, we provide exclusive concierge-backed hospitality designed specifically for you. We guarantee 24/7 power, high-speed Starlink internet, and premium amenities.
                            </p>

                            <h3 className="text-xl font-bold text-charcoal mt-8 mb-4">Unmatched Executive Comfort</h3>
                            <p>
                                Our luxury shortlets in Asaba come fully furnished with modern decor. Whether you are hosting an intimate gathering or focusing on business, our properties offer the perfect environment. A premium shortlet in Asaba ensures you aren't tied to the strict rules and limited spaces of traditional hotels.
                            </p>

                            <p>
                                Explore our curated <a href="#stays" className="text-brand hover:underline">Stays page</a> to view our catalog of premium estates.
                            </p>

                            <h2 className="text-2xl font-bold text-charcoal mt-10 mb-5">Top Things to Do in Asaba</h2>
                            <p>
                                Asaba is a growing hub of culture, business, and entertainment. After settling into your luxury apartment in Asaba, explore local attractions. For authoritative information on local tourism, check out the <a href="https://deltastate.gov.ng" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Delta State Official Tourism Guide</a>.
                            </p>

                            <h3 className="text-xl font-bold text-charcoal mt-8 mb-4">The Ultimate Asaba Business Travel Guide</h3>
                            <ul>
                                <li><strong>Airport Access:</strong> Choose accommodations close to the airport to minimize commute times. At Umunna Stays, we offer secure unmarked transport options. Check out our <a href="#transport" className="text-brand hover:underline">Executive Transport</a> services.</li>
                                <li><strong>Connectivity:</strong> Reliable internet is non-negotiable for executives. Ensure your shortlet in Asaba provides Starlink or fiber optic coverage.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-charcoal mt-10 mb-5">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-charcoal">Are shortlets in Asaba safe?</h4>
                                    <p>Yes. Our properties are located in secure, gated estates with 24/7 security personnel and surveillance.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-charcoal">Do luxury apartments in Asaba offer concierge services?</h4>
                                    <p>Most don't, but Umunna Stays is a notable exception. We provide private chefs, grocery shopping, and errand running services.</p>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mt-12 p-8 bg-brand/5 border border-brand/20 rounded-xl text-center">
                        <h3 className="text-2xl font-bold text-charcoal mb-4">Book Your Luxury Shortlet in Asaba Today</h3>
                        <p className="mb-6 text-gray-600">Experience exclusive concierge-backed hospitality in Asaba.</p>
                        <a href="#stays" className="inline-block px-8 py-3 bg-brand text-white font-bold rounded-lg hover:bg-[#A3520D] transition-colors">
                            View Available Properties
                        </a>
                    </div>
                </article>

            </div>
        </div>
    );
};

export default BlogPost;
