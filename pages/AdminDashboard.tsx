import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center mb-8 border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm">Welcome back, Super Admin</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* 🚀 PROMOTED: SEO Blog CMS Intelligence Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div
                        onClick={() => navigate('/admin-blog-cms')}
                        className="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-800 hover:scale-[1.01] transition-all cursor-pointer group"
                    >
                        <div className="w-14 h-14 bg-orange-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-orange-600/20 group-hover:rotate-6 transition-transform">
                            <ArrowRight className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black mb-4">SEO Blog CMS Engine</h2>
                        <p className="text-slate-400 font-medium mb-8">Launch the search domination panel to engineer top-ranking SEO content and AI-search visibility.</p>
                        <div className="flex items-center gap-2 text-orange-500 font-extrabold uppercase tracking-[0.2em] text-sm">
                            Launch Intelligence Layer <ArrowRight size={18} />
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">SEO Status</h3>
                        <div className="flex items-center gap-2 text-green-500 font-bold mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Pipeline: Active & Optimizing
                        </div>
                        <p className="text-gray-500 text-sm italic">All deployments verified. Next automated indexing ping in 12 hours.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Active Bookings</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">14</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Pending Transport</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Total Properties</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">20</p>
                    </div>
                </div>

                {/* Blog CMS Intelligence Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        onClick={() => navigate('/admin-blog-cms')}
                        className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-gray-800"
                    >
                        <div className="w-12 h-12 bg-orange-600 rounded-xl mb-6 flex items-center justify-center group-hover:rotate-6 transition-transform">
                            <ArrowRight className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Blog CMS Engine</h2>
                        <p className="text-gray-400 text-sm mb-6">Manage the search domination panel to engineer top-ranking SEO content and intelligence.</p>
                        <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-xs">
                            Open Intelligence Layer <ArrowRight size={14} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">System Status</h3>
                        <div className="flex items-center gap-2 text-green-500 font-bold mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            SEO Pipeline: Active
                        </div>
                        <p className="text-gray-500 text-xs">All sitemaps verified. Next automated indexing ping in 12 hours.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
