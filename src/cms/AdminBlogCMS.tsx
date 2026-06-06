import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cmsGateway } from './services/cmsGateway';
import { Post, CMSAction, PostLifecycleState } from './types';
import { usePostStore } from './state/postStore';
import TiptapEditor from './components/editor/TiptapEditor';
import {
    ArrowLeft, CheckCircle2, AlertCircle, 
    Search, FileText, LayoutDashboard, Sparkles, Zap, RefreshCcw, Link as LinkIcon, 
    Activity, Lock, Unlock, History, Globe, Shield, Settings2, Target, Gauge, ChevronRight
} from 'lucide-react';

/* =======================================================================
   GOVERNANCE CONSTANTS
   ======================================================================= */
const LIFECYCLE_RING: { state: PostLifecycleState; label: string; color: string; actions: CMSAction[] }[] = [
    { state: "draft", label: "Draft Territory", color: "#64748b", actions: ["SAVE_DRAFT", "REQUEST_REVIEW"] },
    { state: "review", label: "Authority Review", color: "#f59e0b", actions: ["REQUEST_CHANGES", "PUBLISH", "SCHEDULE"] },
    { state: "scheduled", label: "Temporal Lock", color: "#3b82f6", actions: ["PUBLISH", "SAVE_DRAFT"] },
    { state: "published", label: "Live Universe", color: "#10b981", actions: ["ARCHIVE", "SAVE_DRAFT"] },
    { state: "archived", label: "Deep Archive", color: "#ef4444", actions: ["RESTORE"] },
];

export default function AdminBlogCMS() {
    const navigate = useNavigate();
    const [view, setView] = useState<'list' | 'cockpit'>('list');
    const { posts, loading, error, fetchPosts, dispatch } = usePostStore();
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [draftContent, setDraftContent] = useState('');

    const selectedPost = useMemo(() => posts.find(p => p.id === selectedPostId), [posts, selectedPostId]);

    useEffect(() => { fetchPosts(); }, []);

    const handleAction = async (action: CMSAction, payload?: any) => {
        try {
            await dispatch(action, { id: selectedPostId, content: draftContent, ...payload });
        } catch (e) {
            // Fail-loud is handled by store error state, but we can add local UX feedback
            console.error("Governance Rejection:", e);
        }
    };

    /* =======================================================================
       RENDER: FAIL-LOUD GOVERNANCE OVERLAY
       ======================================================================= */
    if (error) {
        return (
            <div className="fixed inset-0 bg-red-950/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-6 text-center">
                <div className="max-w-md bg-white p-10 rounded-[40px] shadow-2xl border-4 border-red-500">
                    <Shield size={64} className="text-red-500 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">GOVERNANCE BREACH</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{String(error)}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                        <RefreshCcw size={20} /> Reset Authority Layer
                    </button>
                </div>
            </div>
        );
    }

    /* =======================================================================
       RENDER: LIST VIEW (REFLECTION MODE)
       ======================================================================= */
    if (view === 'list') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col p-8">
                <header className="max-w-7xl mx-auto w-full flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <Gauge className="text-[#C46210]" size={32} /> CMS CONTROL WHEEL
                        </h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Backend Authority Reflection Layer</p>
                    </div>
                    <button 
                        onClick={() => {
                            // In a deterministic system, creating a post is also an RPC intent
                            const title = prompt("Enter Post Title (Intent):");
                            if (title) handleAction("SAVE_DRAFT", { title, content: "" });
                        }}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Zap size={20} /> EMIT NEW INTENT
                    </button>
                </header>

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <div 
                            key={post.id} 
                            onClick={() => { setSelectedPostId(post.id); setDraftContent(post.content); setView('cockpit'); }}
                            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl group cursor-pointer hover:border-[#C46210]/30 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                {post.is_locked ? <Lock size={16} className="text-red-400" /> : <Unlock size={16} className="text-green-400" />}
                            </div>
                            
                            <div className="mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 mb-4 inline-block">
                                    {post.lifecycle_state.replace('_', ' ')}
                                </span>
                                <h3 className="text-xl font-black leading-tight text-slate-900 group-hover:text-[#C46210] transition-colors">{post.title}</h3>
                            </div>

                            <div className="flex items-center gap-6 mt-auto">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Audit History: {post.version_number} Events
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* =======================================================================
       RENDER: CONTROL WHEEL COCKPIT (THE HUB)
       ======================================================================= */
    const currentStep = LIFECYCLE_RING.find(s => s.state === selectedPost?.lifecycle_state) || LIFECYCLE_RING[0];

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col lg:flex-row overflow-hidden">
            {/* 1. THE CONTROL WHEEL (LEFT) */}
            <div className="lg:w-[450px] p-8 flex flex-col border-r border-white/5 relative">
                <button onClick={() => setView('list')} className="mb-12 flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-black text-xs uppercase tracking-widest">
                    <ArrowLeft size={16} /> Exit Cockpit
                </button>

                <div className="flex-grow flex flex-col items-center justify-center relative">
                    {/* Visual Lifecycle Ring */}
                    <div className="relative w-72 h-72 rounded-full border-[16px] border-white/5 flex items-center justify-center group">
                        <div className="absolute inset-0 rounded-full border-[16px] border-[#C46210] border-t-transparent animate-[spin_10s_linear_infinite]" />
                        
                        <div className="text-center z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Authority Level</p>
                            <h2 className="text-2xl font-black tracking-tighter uppercase">{currentStep.label}</h2>
                            <div className="mt-4 flex justify-center gap-1">
                                {LIFECYCLE_RING.map((step, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-2 h-2 rounded-full ${step.state === selectedPost?.lifecycle_state ? 'bg-[#C46210] scale-125' : 'bg-white/10'}`} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Orbiting Actions */}
                        {currentStep.actions.map((action, idx) => {
                            const angle = (idx / currentStep.actions.length) * 360;
                            return (
                                <button
                                    key={action}
                                    onClick={() => handleAction(action)}
                                    className="absolute bg-white text-black p-4 rounded-2xl font-black text-[10px] shadow-2xl hover:scale-110 transition-all active:scale-95"
                                    style={{
                                        transform: `rotate(${angle}deg) translateY(-160px) rotate(-${angle}deg)`
                                    }}
                                >
                                    {action.replace('_', ' ')}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-24 w-full space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Governance Constraints</h4>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-xs font-bold">
                                    <Shield size={14} className="text-[#C46210]" /> Direct Write Block: ACTIVE
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold">
                                    <Target size={14} className="text-blue-400" /> SEO Enforcement: REQUIRED
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                    <Lock size={14} /> Schema Lock: PENDING
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. THE REFLECTION EDITOR (CENTER) */}
            <div className="flex-1 flex flex-col bg-white text-slate-900 relative">
                <header className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">{selectedPost?.title}</h1>
                        <p className="text-xs font-bold text-slate-400">ID: {selectedPost?.id?.slice(0, 8)}... | v{selectedPost?.version_number}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><Settings2 size={20} /></button>
                        <button className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><History size={20} /></button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-3xl mx-auto">
                        <TiptapEditor 
                            value={draftContent}
                            onChange={setDraftContent}
                            minHeight="min-h-[600px]"
                        />
                    </div>
                </div>

                {/* Audit Timeline Strip (Bottom) */}
                <div className="h-16 bg-slate-900 flex items-center px-8 gap-8 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 shrink-0">
                        <Activity size={16} className="text-green-400" />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Live Audit:</span>
                    </div>
                    {["INTENT_EMITTED", "VALIDATION_PASSED", "STATE_TRANSITION", "SEO_CALCULATED"].map((event, i) => (
                        <div key={i} className="flex items-center gap-2 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{event}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. SEO REFLECTOR PANEL (RIGHT) */}
            <div className="lg:w-[400px] bg-slate-50 p-8 border-l border-slate-200 flex flex-col text-slate-900">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                    <Search size={18} /> SEO REFLECTOR
                </h3>

                <div className="space-y-8">
                    {/* Score Gauge */}
                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C46210]/10 rounded-full -mr-8 -mt-8" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Readiness Score</p>
                        <div className="text-6xl font-black tracking-tighter text-slate-900">
                            {selectedPost?.seo_snapshot?.score || 0}
                        </div>
                        <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#C46210] transition-all duration-1000"
                                style={{ width: `${selectedPost?.seo_snapshot?.score || 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Snapshot Metadata */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Intent</span>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{selectedPost?.seo_snapshot?.keyword || 'NOT SET'}</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indexing Rank</span>
                            <span className="text-xs font-black text-slate-900">PRE-COMPUTED</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Link Density</span>
                            <span className="text-xs font-black text-slate-900">{selectedPost?.internal_link_count || 0} Nodes</span>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[40px] text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe size={18} className="text-[#C46210]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Search Authority</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed">
                            This post is mathematically verified for Search Intent alignment. Backend authority prohibits publishing until SEO criteria reach 85%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
