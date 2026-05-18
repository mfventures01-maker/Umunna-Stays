import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBlogPostBySlug, BlogPostData } from '../src/cms/services/blogService';

const DOMAIN = "https://www.umunnastays.com.ng";

const BlogPost: React.FC<{ slug?: string }> = ({ slug }) => {
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPostData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            navigate('/blog', { replace: true });
            return;
        }

        fetchBlogPostBySlug(slug).then(data => {
            if (!data) {
                // GOVERNANCE ENFORCEMENT: 404 for non-existent or unpublished
                console.error("[SEO Protection] Access denied: Content not in 'published' state.");
                navigate('/404', { replace: true });
            } else {
                setPost(data);
            }
            setLoading(false);
        });
    }, [slug, navigate]);

    useEffect(() => {
        if (!post) return;

        // DYNAMIC SEO HEAD INJECTION (REFLECTING BACKEND TRUTH)
        document.title = post.meta_title || `${post.title} | Umunna Stays Blog`;
        
        // Update Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute("content", post.meta_description || post.excerpt);

        // Update Robots (Indexing Truth Layer)
        let metaRobots = document.querySelector('meta[name="robots"]');
        if (!metaRobots) {
            metaRobots = document.createElement('meta');
            metaRobots.setAttribute('name', 'robots');
            document.head.appendChild(metaRobots);
        }
        // Only allow indexing if explicitly published and marked indexed
        const canIndex = post.lifecycle_state === 'published' && post.index_status === 'indexed';
        metaRobots.setAttribute("content", canIndex ? "index, follow" : "noindex, nofollow");

        // Update Canonical
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute("href", `${DOMAIN}/blog/${post.slug}`);

    }, [post]);

    if (loading) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex flex-col justify-center items-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-[#C46210] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Verifying Authority...</p>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="pt-24 pb-16 bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Structured Data (Schema.org Reflection) */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.title,
                        "description": post.meta_description || post.excerpt,
                        "image": post.imageUrl,
                        "datePublished": post.date,
                        "author": {
                            "@type": "Organization",
                            "name": "Umunna Stays"
                        }
                    })}
                </script>

                <div className="text-center mb-10">
                    <div className="text-xs font-black text-[#C46210] tracking-[0.2em] uppercase mb-4">{post.category}</div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>Authority Verified</span>
                    </div>
                </div>

                <div className="w-full h-[500px] bg-slate-100 rounded-[40px] overflow-hidden mb-12 shadow-2xl border border-slate-100">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                    />
                </div>

                <article className="prose prose-lg prose-slate max-w-none text-slate-700">
                    <div className="font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
                    
                    <div className="mt-20 p-12 bg-slate-900 rounded-[50px] text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C46210] rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
                        <h3 className="text-3xl font-black mb-4 tracking-tighter">Ready for Asaba Luxury?</h3>
                        <p className="mb-8 text-slate-400 font-medium">Experience exclusive concierge-backed hospitality in Asaba.</p>
                        <button 
                            onClick={() => navigate('/stays')}
                            className="bg-[#C46210] text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
                        >
                            Explore Our Properties
                        </button>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPost;
