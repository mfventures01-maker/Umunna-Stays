import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Stays from './pages/Stays';
import PropertyDetail from './pages/PropertyDetail';
import Services from './pages/Services';
import Food from './pages/Food';
import Transport from './pages/Transport';
import Host from './pages/Host';
import Profile from './pages/Profile';
import { View, Property, AppData } from './types';
import { loadAppData, getPropertyById } from './dataStore';
import { AuthProvider } from './src/contexts/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// New Pages & Components
import SecureAdminLogin from './pages/SecureAdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminBlogCMS from './pages/AdminBlogCMS';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminShield from './components/AdminShield';
import ExitIntentPopup from './components/ExitIntentPopup';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
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
    if (path.startsWith('blog/')) return 'blog-post';
    
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
          <Route path="/profile" element={<Profile appData={appData} onNavigate={navigateTo} />} />
          <Route path="/favorites" element={<Profile appData={appData} onNavigate={navigateTo} />} />
          <Route path="/secure-admin-login" element={<SecureAdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-blog-cms" element={<AdminBlogCMS />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostWrapper />} />
          
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
