import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';

import Header from './src/shared/ui/Header';
import Footer from './src/shared/ui/Footer';
import WhatsAppButton from './src/concierge/components/WhatsAppButton';
import LazyLoader from './src/shared/loaders/LazyLoader';

// ═══════════════════════════════════════════════════════════════
// EAGER IMPORTS — Public SEO-critical pages (must be in initial bundle)
// ═══════════════════════════════════════════════════════════════
import Home from './src/app/pages/Home';
import Stays from './src/stays/pages/Stays';
import PropertyDetail from './src/stays/pages/PropertyDetail';
import Services from './src/app/pages/Services';
import Food from './src/app/pages/Food';
import Transport from './src/transport/pages/Transport';
import Host from './src/app/pages/Host';

import { View, Property, AppData } from './types';
import { loadAppData, getPropertyById } from './dataStore';
import { AuthProvider } from './src/auth/AuthProvider';
import ProtectedRoute from './src/auth/ProtectedRoute';
import ErrorBoundary from './src/shared/ui/ErrorBoundary';
import { initMetaPixel } from './src/analytics/metaPixel';

// Lightweight global components (small footprint — keep eager)
import AdminShield from './src/auth/AdminShield';
import ExitIntentPopup from './src/shared/ui/ExitIntentPopup';
import { CmsErrorBoundary } from './src/cms/components/CmsErrorBoundary';

// ═══════════════════════════════════════════════════════════════
// LAZY IMPORTS — Admin, CMS, and non-critical routes
// These modules are split into separate chunks and loaded on demand.
// Admin infrastructure NEVER loads on public routes.
// ═══════════════════════════════════════════════════════════════
const AdminLogin = lazy(() => import('./src/auth/pages/SecureAdminLogin'));
const AdminDashboard = lazy(() => import('./src/cms/pages/AdminDashboard'));
const AdminBlogCMS = lazy(() => import('./src/cms/AdminBlogCMS'));
const Blog = lazy(() => import('./src/cms/pages/Blog'));
const BlogPost = lazy(() => import('./src/cms/pages/BlogPost'));
const Profile = lazy(() => import('./src/auth/pages/Profile'));
const NotFound = lazy(() => import('./src/app/pages/NotFound'));
const SetPassword = lazy(() => import('./src/auth/pages/SetPassword'));
const ForgotPassword = lazy(() => import('./src/auth/pages/ForgotPassword'));

import { useAuth } from './src/auth/AuthProvider';
import { useAuthFlowHandler } from './src/hooks/useAuthFlowHandler';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

// Helper to handle legacy hash redirects
const HashRedirector: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      let path = location.hash.replace('#', '');
      if (path.startsWith('/')) path = path.substring(1);
      
      // Map legacy aliases
      if (path === 'properties') path = 'stays';
      if (path === 'security') path = 'services';
      if (path === 'rides') path = 'transport';

      navigate('/' + path, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus } = useAuth();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Auth Lifecycle: intercept email/reset/invite callbacks ──
  useAuthFlowHandler();

  // Transport Data State
  const [transportData, setTransportData] = useState<{
    services: any[];
    vendors: any[];
    vehicles: any[];
  } | null>(null);
  const [transportLoading, setTransportLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const data = await loadAppData();
      setAppData(data);
      setLoading(false);

      // Initialize Analytics (Phase 4 Stabilization)
      initMetaPixel();

      setTransportLoading(true);
      import('./dataStore').then(async (ds) => {
        const tData = await ds.loadTransportData();
        setTransportData(tData);
        setTransportLoading(false);
      });
    };
    init();
  }, []);

  // Sync current view with path for Header highlight
  const getCurrentView = (): View => {
    const path = location.pathname.substring(1);
    if (!path) return 'home';
    if (path.startsWith('stays/')) return 'property-detail';
    
    const validViews: View[] = ['home', 'stays', 'services', 'host', 'property-detail', 'food', 'transport', 'profile', 'favorites', 'secure-admin-login', 'admin-dashboard', 'admin-blog-cms', 'blog', 'blog-post'];
    const baseView = path.split('/')[0] as View;
    if (validViews.includes(baseView)) return baseView;
    
    return 'home';
  };

  const navigateTo = (view: View, property?: Property) => {
    console.log(`[navigateTo] view: ${view}, property_id: ${property ? property.property_id : 'undefined'}`);
    if (view === 'blog-post' && property) {
      navigate(`/blog/${property.property_id}`);
    } else if (property) {
      console.log(`[navigateTo] navigating to /stays/${property.property_id}`);
      navigate(`/stays/${property.property_id}`);
    } else {
      console.log(`[navigateTo] navigating to ${view === 'home' ? '/' : `/${view}`}`);
      navigate(view === 'home' ? '/' : `/${view}`);
    }
    window.scrollTo(0, 0);
  };

  if (loading || !appData || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C46210] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">
            {authStatus === 'loading' ? 'Initializing Auth...' : 'Loading Umunna Stays...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HashRedirector />
      <Header currentView={getCurrentView()} onNavigate={navigateTo} appData={appData} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onNavigate={navigateTo} appData={appData} />} />
          <Route path="/stays" element={<Stays onNavigate={navigateTo} appData={appData} />} />
          <Route path="/stays/:id" element={<PropertyDetailWrapper appData={appData} />} />
          <Route path="/services" element={<Services appData={appData} />} />
          <Route path="/food" element={<Food appData={appData} />} />
          <Route path="/transport" element={
            <Transport
              appData={appData}
              transportData={transportData}
              isLoading={transportLoading}
            />
          } />
          <Route path="/host" element={<Host appData={appData} />} />
          <Route path="/profile" element={<Suspense fallback={<LazyLoader label="Loading profile..." />}><Profile appData={appData} onNavigate={navigateTo} /></Suspense>} />
          <Route path="/favorites" element={<Suspense fallback={<LazyLoader label="Loading profile..." />}><Profile appData={appData} onNavigate={navigateTo} /></Suspense>} />
          <Route path="/secure-admin-login" element={<Suspense fallback={<LazyLoader label="Loading admin..." />}><AdminLogin /></Suspense>} />
          <Route path="/set-password" element={<Suspense fallback={<LazyLoader label="Loading..." />}><SetPassword /></Suspense>} />
          <Route path="/forgot-password" element={<Suspense fallback={<LazyLoader label="Loading..." />}><ForgotPassword /></Suspense>} />
          <Route path="/admin" element={<ProtectedRoute><Suspense fallback={<LazyLoader label="Loading dashboard..." />}><AdminDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/admin-blog-cms" element={<ProtectedRoute><Suspense fallback={<LazyLoader label="Loading CMS..." />}><CmsErrorBoundary><AdminBlogCMS /></CmsErrorBoundary></Suspense></ProtectedRoute>} />
          <Route path="/blog" element={<Suspense fallback={<LazyLoader label="Loading blog..." />}><Blog /></Suspense>} />
          <Route path="/blog/:slug" element={<Suspense fallback={<LazyLoader label="Loading article..." />}><BlogPostWrapper /></Suspense>} />
          <Route path="/404" element={<Suspense fallback={<LazyLoader minimal />}><NotFound /></Suspense>} />
          
          {/* Legacy Redirects */}
          <Route path="/rides" element={<Navigate to="/transport" replace />} />
          <Route path="/properties" element={<Navigate to="/stays" replace />} />
          <Route path="/security" element={<Navigate to="/services" replace />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer onNavigate={navigateTo} appData={appData} />
      <WhatsAppButton />
      <AdminShield />
      <ExitIntentPopup />
    </div>
  );
};

const PropertyDetailWrapper: React.FC<{ appData: AppData }> = ({ appData }) => {
  const { id } = useParams<{ id: string }>();
  const property = id ? getPropertyById(appData, id) : null;
  
  console.log(`[PropertyDetailWrapper] id: ${id}, found property: ${property ? property.name : 'null'}, total properties in appData: ${appData?.properties?.length}`);
  
  if (!property) {
    console.warn(`[PropertyDetailWrapper] Property not found! Redirecting to /stays. Current properties:`, appData?.properties?.map(p => p.property_id));
    return <Navigate to="/stays" replace />;
  }
  return <PropertyDetail property={property} appData={appData} />;
};

const BlogPostWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <BlogPost slug={slug || ''} />;
};

export default App;
