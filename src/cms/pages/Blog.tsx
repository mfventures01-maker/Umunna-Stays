import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBlogPosts, BlogPostData } from '../services/blogService';

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<BlogPostData[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Asaba Luxury Travel Guide & Blog | Umunna Stays";
        fetchBlogPosts().then(data => {
            setPosts(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-[#C46210] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <div className="text-xs font-black text-[#C46210] tracking-[0.3em] uppercase mb-4">Official Journal</div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">
                        Asaba Luxury Guide
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Authorized travel intelligence, executive lifestyle updates, and the Umunna Stays infrastructure report.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {posts.map((post) => (
                        <div 
                            key={post.slug} 
                            className="group bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer" 
                            onClick={() => navigate(`/blog/${post.slug}`)}
                        >
                            <div className="h-72 overflow-hidden relative">
                                <img 
                                    src={post.imageUrl} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                                <div className="absolute top-6 left-6">
                                    <div className="bg-white/90 backdrop-blur px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                        {post.category}
                                    </div>
                                </div>
                            </div>
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight tracking-tight group-hover:text-[#C46210] transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-3 mb-8 font-medium leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                        Read Analysis
                                        <div className="w-8 h-[2px] bg-[#C46210] group-hover:w-12 transition-all" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                                        {new Date(post.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {posts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[50px] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No authorized content found in discovery layer.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
