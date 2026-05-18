import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import LazyLoader from './components/LazyLoader';

// ═══════════════════════════════════════════════════════════════
// EAGER IMPORTS — Public SEO-critical pages (must be in initial bundle)
// ═══════════════════════════════════════════════════════════════
import Home from './pages/Home';
import Stays from './pages/Stays';
import PropertyDetail from './pages/PropertyDetail';
import Services from './pages/Services';
import Food from './pages/Food';
import Transport from './pages/Transport';
import Host from './pages/Host';

import { View, Property, AppData } from './types';
import { loadAppData, getPropertyById } from './dataStore';
import { AuthProvider } from './src/auth/AuthProvider';
import ProtectedRoute from './src/auth/ProtectedRoute';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initMetaPixel } from './src/analytics/metaPixel';

// Lightweight global components (small footprint — keep eager)
import AdminShield from './components/AdminShield';
import ExitIntentPopup from './components/ExitIntentPopup';
import { CmsErrorBoundary } from './src/cms/components/CmsErrorBoundary';

// ═══════════════════════════════════════════════════════════════
// LAZY IMPORTS — Admin, CMS, and non-critical routes
// These modules are split into separate chunks and loaded on demand.
// Admin infrastructure NEVER loads on public routes.
// ═══════════════════════════════════════════════════════════════
const SecureAdminLogin = lazy(() => import('./pages/SecureAdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminBlogCMS = lazy(() => import('./src/cms/AdminBlogCMS'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (view === 'blog-post' && property) {
      navigate(`/blog/${property.property_id}`);
    } else if (property) {
      navigate(`/stays/${property.property_id}`);
    } else {
      navigate(view === 'home' ? '/' : `/${view}`);
    }
    window.scrollTo(0, 0);
  };

  if (loading || !appData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C46210] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading Umunna Stays...</p>
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
          <Route path="/secure-admin-login" element={<Suspense fallback={<LazyLoader label="Loading admin..." />}><SecureAdminLogin /></Suspense>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="viewer"><Suspense fallback={<LazyLoader label="Loading dashboard..." />}><AdminDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/admin-blog-cms" element={<ProtectedRoute requiredRole="writer"><Suspense fallback={<LazyLoader label="Loading CMS..." />}><CmsErrorBoundary><AdminBlogCMS /></CmsErrorBoundary></Suspense></ProtectedRoute>} />
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
  
  if (!property) return <Navigate to="/stays" replace />;
  return <PropertyDetail property={property} appData={appData} />;
};

const BlogPostWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <BlogPost slug={slug || ''} />;
};

export default App;
