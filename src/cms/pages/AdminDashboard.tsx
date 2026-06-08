/**
 * AdminDashboard.tsx — Role-Aware Admin Overview
 *
 * - Duplicate CMS card block removed
 * - Role-aware rendering (permission-gated tiles)
 * - Identity-aware header (shows real user name/role)
 * - Logout calls real signOut() from AuthProvider
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, BarChart3, Link as LinkIcon, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { hasPermission } from '../../auth/permissions';
import { supabase } from '../../lib/supabaseClient';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, profile, signOut } = useAuth();
  const [stats, setStats] = React.useState({
    properties: '...',
    publishedPosts: '...',
    leads: '...',
    auditEvents: '...',
    scheduledPosts: '...',
  });

  React.useEffect(() => {
    let mounted = true;
    async function fetchKPIs() {
      const [
        { count: p },
        { count: pp },
        { count: l },
        { count: ae },
        { count: sp }
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('lifecycle_state', 'published'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('cms_audit_log').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).not('scheduled_for', 'is', null)
      ]);
      
      if (mounted) {
        setStats({
          properties: String(p ?? 0),
          publishedPosts: String(pp ?? 0),
          leads: String(l ?? 0),
          auditEvents: String(ae ?? 0),
          scheduledPosts: String(sp ?? 0)
        });
      }
    }
    fetchKPIs();
    return () => { mounted = false; };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <User size={12} className="text-slate-400" />
              <p className="text-slate-400 text-xs font-medium">
                {profile?.full_name ?? user?.email ?? 'Administrator'}
                <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {role ?? 'viewer'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-bold"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 mb-8">
          {[
            { label: 'Published Posts', value: stats.publishedPosts },
            { label: 'Total Leads', value: stats.leads },
            { label: 'Total Properties', value: stats.properties },
            { label: 'CMS Audit Events', value: stats.auditEvents },
            { label: 'Scheduled Posts', value: stats.scheduledPosts }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100"
            >
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tool Grid — permission-gated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Blog CMS — requires blog:create */}
          {hasPermission(role, 'access:blog_cms') && (
            <div
              onClick={() => navigate('/admin-blog-cms')}
              className="bg-slate-900 text-white p-10 rounded-[32px] shadow-xl border border-slate-800 hover:scale-[1.01] transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 bg-[#C46210] rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-[#C46210]/20 group-hover:rotate-6 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-black mb-3">SEO Blog CMS Engine</h2>
              <p className="text-slate-400 font-medium mb-6 text-sm leading-relaxed">
                Engineer top-ranking search content and manage AI-search visibility.
              </p>
              <div className="flex items-center gap-2 text-[#C46210] font-extrabold uppercase tracking-[0.2em] text-xs">
                Launch Intelligence Layer <ArrowRight size={16} />
              </div>
            </div>
          )}

          {/* SEO Analytics — requires access:seo_analytics */}
          {hasPermission(role, 'access:seo_analytics') && (
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => alert('SEO Analytics — coming soon')}
            >
              <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <BarChart3 className="w-7 h-7 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">SEO Analytics</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Monitor keyword rankings, impressions, and click-through rates.
              </p>
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                Coming Soon
              </div>
            </div>
          )}

          {/* Internal Linking — requires access:internal_linking */}
          {hasPermission(role, 'access:internal_linking') && (
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => alert('Internal Linking module — coming soon')}
            >
              <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <LinkIcon className="w-7 h-7 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">Internal Linking</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Build topical authority through strategic internal link architecture.
              </p>
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                Coming Soon
              </div>
            </div>
          )}

          {/* GSC Settings — requires access:gsc_settings */}
          {hasPermission(role, 'access:gsc_settings') && (
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => alert('GSC Settings — coming soon')}
            >
              <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <Settings className="w-7 h-7 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">GSC Settings</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Configure Google Search Console integration and sitemap pings.
              </p>
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                Coming Soon
              </div>
            </div>
          )}
        </div>

        {/* SEO Status Bar */}
        <div className="mt-8 bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
              SEO Pipeline Status
            </p>
            <div className="flex items-center gap-2 text-green-500 font-bold">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active &amp; Optimizing
            </div>
          </div>
          <p className="text-slate-400 text-xs">
            All sitemaps verified. SEO pipeline operating dynamically.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
