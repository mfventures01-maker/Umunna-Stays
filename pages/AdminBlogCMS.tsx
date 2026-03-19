
import React, { useState } from 'react';
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
    Layout
} from 'lucide-react';

const AdminBlogCMS: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all-posts' | 'new-post'>('all-posts');
    const [postTitle, setPostTitle] = useState('Luxury Shortlet in Asaba: The 2026 Executive Protocol');
    const [focusKeyword, setFocusKeyword] = useState('luxury shortlet in asaba');
    const [seoScore, setSeoScore] = useState(82);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col gap-8">
                <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-[#C46210] rounded-lg flex items-center justify-center font-black italic">U</div>
                    <span className="font-black tracking-tight text-xl">Umunna <span className="text-[#C46210]">CMS</span></span>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                    <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={false} />
                    <NavItem icon={<FileText size={18} />} label="Blog Engine" active={true} />
                    <NavItem icon={<LinkIcon size={18} />} label="Internal Linking" active={false} />
                    <NavItem icon={<BarChart3 size={18} />} label="SEO Analytics" active={false} />
                    <NavItem icon={<Settings size={18} />} label="GSC Settings" active={false} />
                </nav>

                <button
                    onClick={() => window.location.hash = 'admin-dashboard'}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                >
                    <ChevronLeft size={18} /> Exit CMS
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-10 overflow-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Search Domination Engine</h1>
                        <p className="text-slate-500 font-medium">Engineering every post for ranking supremacy.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
                            <Eye size={18} /> Preview
                        </button>
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all">
                            <Save size={18} /> Publish to GSC
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Editor */}
                    <div className="col-span-8 flex flex-col gap-8">
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-10">
                            <input
                                type="text"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                className="w-full text-4xl font-black focus:outline-none mb-6 border-b border-transparent focus:border-slate-100 placeholder-slate-200"
                                placeholder="Enter Article Title..."
                            />

                            <div className="flex gap-4 mb-10">
                                <div className="bg-slate-50 px-4 py-2 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Smartphone size={14} /> Mobile Snippet
                                </div>
                                <div className="bg-slate-50 px-4 py-2 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2 border border-[#C46210]/20 text-[#C46210]">
                                    <Monitor size={14} /> Desktop Snippet
                                </div>
                            </div>

                            {/* Block Editor UI Mockup */}
                            <div className="space-y-6">
                                <div className="min-h-[400px] prose prose-slate max-w-none text-slate-500 font-medium">
                                    <p className="text-xl leading-relaxed mb-6">Arrive. Exhale. No Stories. When you seek a <span className="text-slate-900 font-bold underline decoration-[#C46210]/30 underline-offset-4">luxury shortlet in Asaba</span>, you aren't just paying for a bed; you are paying for an engineered environment of certainty.</p>

                                    <div className="bg-[#C46210]/5 border-2 border-[#C46210]/10 rounded-2xl p-8 mb-6 flex items-center justify-between group cursor-pointer hover:bg-[#C46210]/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#C46210] text-white rounded-xl flex items-center justify-center">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-slate-900 font-bold">CTA Block: Book Exclusive Protocol</h4>
                                                <p className="text-xs">High CTR Design Active</p>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Settings size={18} />
                                        </div>
                                    </div>

                                    <p>Our properties are vetted for 24/7 power, industrial-grade wifi, and executive discreetness. This guide breaks down the protocol...</p>
                                </div>

                                <div className="flex gap-4 border-t border-slate-100 pt-8">
                                    <BlockButton icon={<Type size={18} />} label="H2 Head" />
                                    <BlockButton icon={<ImageIcon size={18} />} label="Optimize Image" />
                                    <BlockButton icon={<Layout size={18} />} label="FAQ Accordion" />
                                    <BlockButton icon={<Plus size={18} />} label="Custom Block" />
                                </div>
                            </div>
                        </div>

                        {/* Technical SEO Panel */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-10">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Settings size={20} className="text-[#C46210]" /> Technical SEO Modules
                            </h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">URL Slug Protocol</label>
                                    <div className="bg-slate-50 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 border border-slate-100 flex items-center justify-between">
                                        /luxury-shortlet-asaba-2026-protocol
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Indexing Preference</label>
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Index Enabled</button>
                                        <button className="flex-1 bg-slate-50 text-slate-400 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest opacity-50">NoIndex</button>
                                    </div>
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
                                        className="text-[#C46210]"
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
                            <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">Your content is highly optimized for AI and Google Search engines.</p>
                        </div>

                        {/* Focus Keyword Intel */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between">
                                Focus Keyword
                                <Search size={14} />
                            </h4>
                            <input
                                type="text"
                                value={focusKeyword}
                                onChange={(e) => setFocusKeyword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold shadow-inner focus:outline-none"
                            />
                            <div className="mt-6 space-y-4">
                                <SEOCheck label="Keyword in Title" status="good" />
                                <SEOCheck label="Keyword in Slug" status="good" />
                                <SEOCheck label="Keyword in First 100 Words" status="good" />
                                <SEOCheck label="Keyword Density (1.8%)" status="good" />
                                <SEOCheck label="Internal Linking Rooted" status="warning" />
                            </div>
                        </div>

                        {/* Search Intent Analyzer */}
                        <div className="bg-slate-900 rounded-[32px] shadow-2xl p-8 text-white">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Search Intent Analyzer</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-[#C46210] tracking-widest mb-1">Detected Intent</p>
                                        <p className="text-lg font-bold">Transactional</p>
                                    </div>
                                    <CheckCircle2 className="text-green-400" />
                                </div>
                                <div className="text-xs font-medium text-slate-400 leading-relaxed italic">
                                    "Your inclusion of pricing and direct booking CTA blocks aligns with user intent to convert immediately."
                                </div>
                            </div>
                        </div>

                        {/* GSC Performance Sneak Peek */}
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between">
                                Live Ranking Probe
                                <BarChart3 size={14} />
                            </h4>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="h-10 w-4 bg-slate-100 rounded-t-sm"></div>
                                    <div className="h-16 w-4 bg-slate-100 rounded-t-sm"></div>
                                    <div className="h-24 w-4 bg-[#C46210] rounded-t-sm"></div>
                                    <div className="h-20 w-4 bg-slate-100 rounded-t-sm"></div>
                                    <div className="h-28 w-4 bg-slate-100 rounded-t-sm"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg Position</p>
                                        <p className="text-xl font-black text-slate-900">#1.4</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CTR Performance</p>
                                        <p className="text-xl font-black text-green-600">8.2%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean }> = ({ icon, label, active }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${active ? 'bg-[#C46210] text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
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

const SEOCheck: React.FC<{ label: string; status: 'good' | 'warning' | 'error' }> = ({ label, status }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">{label}</span>
        {status === 'good' && <CheckCircle2 size={16} className="text-green-500" />}
        {status === 'warning' && <AlertCircle size={16} className="text-orange-500" />}
        {status === 'error' && <AlertCircle size={16} className="text-red-500" />}
    </div>
);

export default AdminBlogCMS;
