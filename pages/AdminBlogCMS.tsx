
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    Link as LinkIcon,
    BarChart3,
    Settings,
    ChevronLeft,
    Eye,
    Save,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Smartphone,
    Monitor,
    Search,
    Type,
    Image as ImageIcon,
    Plus,
    Layout,
    ArrowLeft,
    Trash2,
    Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabaseClient';
import { BlogPostData, BLOG_POSTS } from '../blogData';

interface PostDraft {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    featured_image_url: string;
    focus_keyword: string;
    meta_title: string;
    meta_description: string;
    search_intent: string;
    status: 'draft' | 'published';
    tags: string[];
}

const generateSlug = (title: string): string =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminBlogCMS: React.FC = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
    const [posts, setPosts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [draft, setDraft] = useState<PostDraft>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Luxury Apartments',
        featured_image_url: '',
        focus_keyword: '',
        meta_title: '',
        meta_description: '',
        search_intent: 'informational',
        status: 'draft',
        tags: [],
    });

    // Load existing posts
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        if (!supabase) {
            // Fallback to local data
            setPosts(BLOG_POSTS.map((p, i) => ({ id: `local-${i}`, ...p, status: 'published' })));
            return;
        }
        const { data, error } = await supabase
            .from('posts')
            .select('id, title, slug, excerpt, status, published_at, created_at, focus_keyword')
            .order('created_at', { ascending: false });

        if (data && data.length > 0) {
            setPosts(data);
        } else {
            // Fallback
            setPosts(BLOG_POSTS.map((p, i) => ({ id: `local-${i}`, ...p, status: 'published' })));
        }
    };

    // Auto-generate slug from title
    useEffect(() => {
        if (draft.title) {
            setDraft(prev => ({ ...prev, slug: generateSlug(prev.title) }));
        }
    }, [draft.title]);

    // Auto-generate meta_title from title
    useEffect(() => {
        if (draft.title && !draft.meta_title) {
            setDraft(prev => ({ ...prev, meta_title: `${prev.title} | Umunna Stays` }));
        }
    }, [draft.title]);

    // SEO Score Calculator
    const calculateSEOScore = (): number => {
        let score = 0;
        const kw = draft.focus_keyword.toLowerCase();
        
        if (draft.title && kw && draft.title.toLowerCase().includes(kw)) score += 15;
        if (draft.slug && kw && draft.slug.includes(kw.replace(/\s+/g, '-'))) score += 10;
        
        const words = draft.content.split(/\s+/).filter(Boolean);
        if (kw && words.length > 0) {
            const kwCount = (draft.content.toLowerCase().match(new RegExp(kw, 'g')) || []).length;
            const density = (kwCount / words.length) * 100;
            if (density > 1) score += 10;
        }

        if (draft.meta_description.length >= 120 && draft.meta_description.length <= 160) score += 10;
        
        // Image Alt Tags (Simulated since we only have one featured image URL field for now)
        if (draft.featured_image_url) score += 10;
        
        if (words.length > 800) score += 10;
        
        if (/<h[1-3]>/.test(draft.content)) score += 10;
        
        if (/<a[^>]*href=["'](?:(?!http).*?)["']/.test(draft.content)) score += 5; // Internal links
        
        if (/<a[^>]*href=["']http/.test(draft.content)) score += 5; // External links
        
        // Readability (Simulated simple check: sentence length)
        score += 5; 
        
        // Image Optimization (Simulated)
        if (draft.featured_image_url) score += 10;

        return Math.min(score, 100);
    };

    const seoScore = calculateSEOScore();

    // Save / Publish handler
    const handleSave = async (publishStatus: 'draft' | 'published') => {
        setSaving(true);
        setSaveStatus('idle');

        const postPayload = {
            title: draft.title,
            slug: draft.slug,
            excerpt: draft.excerpt,
            content: draft.content,
            featured_image_url: draft.featured_image_url,
            focus_keyword: draft.focus_keyword,
            meta_title: draft.meta_title || `${draft.title} | Umunna Stays`,
            meta_description: draft.meta_description,
            search_intent: draft.search_intent,
            status: publishStatus,
            published_at: publishStatus === 'published' ? new Date().toISOString() : null,
            tags: draft.tags,
            category: draft.category
        };

        if (!supabase) {
            // Local-only mode: add to local state
            setPosts(prev => [{ id: `local-${Date.now()}`, ...postPayload, created_at: new Date().toISOString() }, ...prev]);
            setSaveStatus('success');
            setSaving(false);
            setTimeout(() => { setSaveStatus('idle'); setActiveView('list'); }, 1500);
            return;
        }

        const { data, error } = await supabase
            .from('posts')
            .insert([postPayload])
            .select();

        if (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
        } else {
            setSaveStatus('success');
            await loadPosts();
            setTimeout(() => {
                setSaveStatus('idle');
                setActiveView('list');
                resetDraft();
            }, 1500);
        }
        setSaving(false);
    };

    const resetDraft = () => {
        setDraft({
            title: '', slug: '', excerpt: '', content: '',
            category: 'Luxury Apartments', featured_image_url: '',
            focus_keyword: '', meta_title: '', meta_description: '',
            search_intent: 'informational', status: 'draft', tags: [],
        });
    };

    const publishToGMB = async () => {
        const payload = {
            summary: draft.excerpt,
            callToAction: {
                actionType: "LEARN_MORE",
                url: `https://umunnastays.com.ng/blog/${draft.slug}`
            },
            media: [{
                mediaFormat: "PHOTO",
                sourceUrl: draft.featured_image_url
            }]
        };
        console.log("Publishing to GMB with payload:", payload);
        alert("Published to Google My Business successfully! (Simulated)");
    };

    const startNewPost = () => {
        resetDraft();
        setActiveView('editor');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col gap-8 flex-shrink-0">
                <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-[#C46210] rounded-lg flex items-center justify-center font-black italic">U</div>
                    <span className="font-black tracking-tight text-xl">Umunna <span className="text-[#C46210]">CMS</span></span>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                    <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={false} onClick={() => navigate('/admin-dashboard')} />
                    <NavItem icon={<FileText size={18} />} label="Blog Engine" active={true} onClick={() => setActiveView('list')} />
                    <NavItem icon={<LinkIcon size={18} />} label="Internal Linking" active={false} />
                    <NavItem icon={<BarChart3 size={18} />} label="SEO Analytics" active={false} />
                    <NavItem icon={<Settings size={18} />} label="GSC Settings" active={false} />
                </nav>

                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                >
                    <ChevronLeft size={18} /> Exit CMS
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-10 overflow-auto">
                {activeView === 'list' ? (
                    /* ======================== ALL POSTS VIEW ======================== */
                    <>
                        <header className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-2">Search Domination Engine</h1>
                                <p className="text-slate-500 font-medium">All blog posts • {posts.length} total</p>
                            </div>
                            <button
                                onClick={startNewPost}
                                className="flex items-center gap-2 bg-[#C46210] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#a3520d] transition-all"
                            >
                                <Plus size={18} /> New Post
                            </button>
                        </header>

                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                                        <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Keyword</th>
                                        <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((post: any) => (
                                        <tr key={post.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-sm text-slate-900">{post.title}</p>
                                                <p className="text-xs text-slate-400 mt-1">/{post.slug}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {post.status || 'published'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-medium text-slate-500">{post.focus_keyword || '—'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/blog/${post.slug}`)}
                                                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={16} className="text-slate-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    /* ======================== POST EDITOR VIEW ======================== */
                    <>
                        <header className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveView('list')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight mb-1">New Post</h1>
                                    <p className="text-slate-500 font-medium text-sm">Fill in the fields below and publish when ready.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleSave('draft')}
                                    disabled={saving || !draft.title}
                                    className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                >
                                    <Save size={18} /> Save Draft
                                </button>
                                <button
                                    onClick={() => handleSave('published')}
                                    disabled={saving || !draft.title || seoScore < 60}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50"
                                >
                                    {saving ? '⏳ Publishing...' : saveStatus === 'success' ? '✅ Published!' : <><Save size={18} /> Post Now 🚀</>}
                                </button>
                                <button
                                    onClick={publishToGMB}
                                    className="flex items-center gap-2 bg-[#4285F4] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#3367d6] transition-all"
                                    title="Publish to Google My Business"
                                >
                                    GMB Sync
                                </button>
                            </div>
                        </header>

                        {saveStatus === 'error' && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 font-bold text-sm">
                                ❌ Failed to save. Make sure the Supabase <code>posts</code> table exists. Run the SQL schema first.
                            </div>
                        )}

                        <div className="grid grid-cols-12 gap-8">
                            {/* Left Column: Editor */}
                            <div className="col-span-8 flex flex-col gap-8">
                                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-10">
                                    {/* Title */}
                                    <input
                                        type="text"
                                        value={draft.title}
                                        onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full text-4xl font-black focus:outline-none mb-4 border-b border-transparent focus:border-slate-100 placeholder-slate-300"
                                        placeholder="Enter Article Title..."
                                    />

                                    {/* Slug */}
                                    <div className="flex items-center gap-2 mb-8">
                                        <span className="text-xs font-bold text-slate-400">Slug:</span>
                                        <input
                                            type="text"
                                            value={draft.slug}
                                            onChange={(e) => setDraft(prev => ({ ...prev, slug: e.target.value }))}
                                            className="flex-grow bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-600 focus:outline-none"
                                        />
                                        <CheckCircle2 size={14} className={draft.slug ? 'text-green-500' : 'text-slate-300'} />
                                    </div>

                                    {/* Excerpt */}
                                    <div className="mb-8">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Post Excerpt / Meta Summary</label>
                                        <textarea
                                            value={draft.excerpt}
                                            onChange={(e) => setDraft(prev => ({ ...prev, excerpt: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none resize-none"
                                            rows={3}
                                            placeholder="Write a compelling 1-2 sentence summary for Google snippets..."
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">{draft.excerpt.length}/160 characters</p>
                                    </div>

                                    {/* Category & Tags */}
                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Category</label>
                                            <select
                                                value={draft.category}
                                                onChange={(e) => setDraft(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none appearance-none"
                                            >
                                                <option value="Luxury Apartments">Luxury Apartments</option>
                                                <option value="Travel Tips">Travel Tips</option>
                                                <option value="Local Guides">Local Guides</option>
                                                <option value="Company News">Company News</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Tags (Comma separated)</label>
                                            <input
                                                type="text"
                                                value={draft.tags.join(', ')}
                                                onChange={(e) => setDraft(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none"
                                                placeholder="e.g. Asaba, Luxury, Vacation"
                                            />
                                        </div>
                                    </div>

                                    {/* Featured Image URL */}
                                    <div className="mb-8">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Featured Image URL</label>
                                        <input
                                            type="url"
                                            value={draft.featured_image_url}
                                            onChange={(e) => setDraft(prev => ({ ...prev, featured_image_url: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>

                                    {/* Content Editor */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Post Content (HTML supported)</label>
                                        <textarea
                                            value={draft.content}
                                            onChange={(e) => setDraft(prev => ({ ...prev, content: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-medium text-slate-700 focus:outline-none resize-none font-mono"
                                            rows={16}
                                            placeholder="<h2>Your first heading...</h2>&#10;<p>Write your SEO-optimized content here...</p>"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">{draft.content.length} characters • ~{Math.ceil(draft.content.split(/\s+/).filter(Boolean).length / 250)} min read</p>
                                    </div>
                                </div>

                                {/* Technical SEO Panel */}
                                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-10">
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                        <Settings size={20} className="text-[#C46210]" /> Technical SEO Modules
                                    </h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Meta Title</label>
                                            <input
                                                type="text"
                                                value={draft.meta_title}
                                                onChange={(e) => setDraft(prev => ({ ...prev, meta_title: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 focus:outline-none"
                                                placeholder="SEO Title | Umunna Stays"
                                            />
                                            <p className="text-[10px] text-slate-400">{draft.meta_title.length}/60 px</p>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Meta Description</label>
                                            <input
                                                type="text"
                                                value={draft.meta_description}
                                                onChange={(e) => setDraft(prev => ({ ...prev, meta_description: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none"
                                                placeholder="Compelling description for Google SERP..."
                                            />
                                            <p className="text-[10px] text-slate-400">{draft.meta_description.length}/160 characters</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: SEO Intelligence */}
                            <div className="col-span-4 flex flex-col gap-8">
                                {/* The SEO Score Gauge */}
                                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 text-center bg-gradient-to-b from-white to-slate-50">
                                    <div className="mb-6 relative inline-block">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                                            <circle
                                                className={seoScore >= 70 ? 'text-green-500' : seoScore >= 40 ? 'text-[#C46210]' : 'text-red-500'}
                                                strokeWidth="10"
                                                strokeDasharray={351.8}
                                                strokeDashoffset={351.8 - (351.8 * seoScore) / 100}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="56"
                                                cx="64" cy="64"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-slate-900">{seoScore}%</span>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">SEO Readiness</span>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Dominance Score</h4>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">
                                        {seoScore >= 70 ? 'Excellent! Ready for Google domination.' : seoScore >= 40 ? 'Good start. Add more keyword signals.' : 'Needs work. Fill in more fields.'}
                                    </p>
                                </div>

                                {/* Focus Keyword Intel */}
                                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between">
                                        Focus Keyword
                                        <Search size={14} />
                                    </h4>
                                    <input
                                        type="text"
                                        value={draft.focus_keyword}
                                        onChange={(e) => setDraft(prev => ({ ...prev, focus_keyword: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold shadow-inner focus:outline-none"
                                        placeholder="e.g. luxury shortlet in asaba"
                                    />
                                    <div className="mt-6 space-y-4">
                                        <SEOCheck label="Keyword in Title" status={draft.focus_keyword && draft.title.toLowerCase().includes(draft.focus_keyword.toLowerCase()) ? 'good' : 'error'} suggestion="Add focus keyword to the title" />
                                        <SEOCheck label="Keyword in Slug" status={draft.focus_keyword && draft.slug.includes(draft.focus_keyword.toLowerCase().replace(/\s+/g, '-')) ? 'good' : 'error'} suggestion="Add focus keyword to the slug" />
                                        <SEOCheck label="Keyword Density (>1%)" status={(() => {
                                            if (!draft.focus_keyword) return 'error';
                                            const words = draft.content.split(/\s+/).filter(Boolean);
                                            if (words.length === 0) return 'error';
                                            const kwCount = (draft.content.toLowerCase().match(new RegExp(draft.focus_keyword.toLowerCase(), 'g')) || []).length;
                                            return (kwCount / words.length) * 100 > 1 ? 'good' : 'warning';
                                        })()} suggestion="Increase keyword usage in content" />
                                        <SEOCheck label="Meta Description (120-160 chars)" status={draft.meta_description.length >= 120 && draft.meta_description.length <= 160 ? 'good' : 'warning'} suggestion="Meta description too short/long" />
                                        <SEOCheck label="Content Length (>800 words)" status={draft.content.split(/\s+/).filter(Boolean).length > 800 ? 'good' : 'warning'} suggestion="Write more content" />
                                        <SEOCheck label="Heading Structure (H1-H3)" status={/<h[1-3]>/.test(draft.content) ? 'good' : 'warning'} suggestion="Add headings to structure content" />
                                        <SEOCheck label="Internal Links" status={/<a[^>]*href=["'](?:(?!http).*?)["']/.test(draft.content) ? 'good' : 'warning'} suggestion="Add internal links" />
                                    </div>
                                </div>

                                {/* Search Intent Analyzer */}
                                <div className="bg-slate-900 rounded-[32px] shadow-2xl p-8 text-white">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Search Intent Analyzer</h4>
                                    <div className="space-y-4">
                                        <select
                                            value={draft.search_intent}
                                            onChange={(e) => setDraft(prev => ({ ...prev, search_intent: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none appearance-none"
                                        >
                                            <option value="informational" className="text-black">Informational</option>
                                            <option value="transactional" className="text-black">Transactional</option>
                                            <option value="commercial" className="text-black">Commercial</option>
                                            <option value="navigational" className="text-black">Navigational</option>
                                        </select>
                                        <div className="text-xs font-medium text-slate-400 leading-relaxed italic">
                                            Selecting the correct intent helps AI search engines categorize your content for the right audience.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${active ? 'bg-[#C46210] text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
            }`}>
        {icon}
        {label}
    </div>
);

const BlockButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
        {icon} {label}
    </button>
);

const SEOCheck: React.FC<{ label: string; status: 'good' | 'warning' | 'error', suggestion?: string }> = ({ label, status, suggestion }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{label}</span>
            {status === 'good' && <CheckCircle2 size={16} className="text-green-500" />}
            {status === 'warning' && <AlertCircle size={16} className="text-orange-500" />}
            {status === 'error' && <AlertCircle size={16} className="text-red-500" />}
        </div>
        {status !== 'good' && suggestion && (
            <span className="text-[10px] font-medium text-slate-400 italic">Hint: {suggestion}</span>
        )}
    </div>
);

export default AdminBlogCMS;
