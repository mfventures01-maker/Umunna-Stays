import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LazyLoader from './components/LazyLoader';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Stays = lazy(() => import('./pages/Stays'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Transport = lazy(() => import('./pages/Transport'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminLogin = lazy(() => import('./pages/SecureAdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SetPassword = lazy(() => import('./pages/SetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Food = lazy(() => import('./pages/Food'));
const Host = lazy(() => import('./pages/Host'));
const Services = lazy(() => import('./pages/Services'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth provider and route guard
import { AuthProvider } from './src/auth/AuthProvider';
import ProtectedRoute from './src/auth/ProtectedRoute';

// Data store
import { loadAppData } from './dataStore';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [appData, setAppData] = useState<any>(null);
  const [transportData, setTransportData] = useState<any>(null);
  const [transportLoading, setTransportLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadAppData();
        setAppData(data);
        setTransportData(data?.transport);
      } catch (err) {
        console.error('App init failed:', err);
      } finally {
        setTransportLoading(false);
      }
    };
    init();
  }, []);

  const navigateTo = (path: string) => navigate(path);

  if (!appData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LazyLoader label="Loading Umunna Stays..." />
      </div>
    );
  }

  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC CORE PAGES */}
        <Route path="/" element={<Home onNavigate={navigateTo} appData={appData} />} />

        {/* STAYS */}
        <Route path="/stays" element={<Stays onNavigate={navigateTo} appData={appData} />} />
        <Route path="/stays/:id" element={<PropertyDetail appData={appData} />} />

        {/* TRANSPORT */}
        <Route
          path="/transport"
          element={
            <Transport
              appData={appData}
              transportData={transportData}
              isLoading={transportLoading}
            />
          }
        />

        {/* FOOD */}
        <Route path="/food" element={<Food appData={appData} />} />

        {/* HOST */}
        <Route path="/host" element={<Host appData={appData} />} />

        {/* SERVICES */}
        <Route path="/services" element={<Services appData={appData} />} />

        {/* PROFILE */}
        <Route path="/profile" element={<Profile appData={appData} />} />

        {/* BLOG */}
        <Route
          path="/blog"
          element={
            <Suspense fallback={<LazyLoader label="Loading blog..." />}>
              <Blog />
            </Suspense>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<LazyLoader label="Loading article..." />}>
              <BlogPost />
            </Suspense>
          }
        />

        {/* LEGACY REDIRECTS */}
        <Route path="/rides" element={<Navigate to="/transport" replace />} />
        <Route path="/properties" element={<Navigate to="/stays" replace />} />
        <Route path="/security" element={<Navigate to="/stays" replace />} />

        {/* ADMIN LOGIN */}
        <Route
          path="/secure-admin-login"
          element={
            <Suspense fallback={<LazyLoader label="Loading admin..." />}>
              <AdminLogin />
            </Suspense>
          }
        />

        {/* ADMIN ROUTES — PROTECTED */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <Suspense fallback={<LazyLoader label="Loading dashboard..." />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-blog-cms"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <Suspense fallback={<LazyLoader label="Loading CMS..." />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* AUX PAGES */}
        <Route
          path="/set-password"
          element={
            <Suspense fallback={<LazyLoader label="Loading..." />}>
              <SetPassword />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<LazyLoader label="Loading..." />}>
              <ForgotPassword />
            </Suspense>
          }
        />

        {/* CATCH ALL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
