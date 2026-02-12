import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </HashRouter>
  );
};

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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
      // Load main AppData
      const data = await loadAppData();
      setAppData(data);
      setLoading(false);

      // Load Transport Data immediately to ensure it's available
      // or we could do it lazily when the user navigates. 
      // Given the user flow, loading it now ensures smoothness.
      setTransportLoading(true);
      import('./dataStore').then(async (ds) => {
        const tData = await ds.loadTransportData();
        setTransportData(tData);
        setTransportLoading(false);
      });
    };
    init();
  }, []);

  useEffect(() => {
    if (!appData) return;

    const handleHashChange = () => {
      // Redirect clean paths to hash paths if necessary (for Vercel rewrites)
      if (window.location.pathname === '/rides') {
        window.location.href = '/#/transport';
        return;
      }

      let hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/')) hash = hash.substring(1); // Handle /stays vs stays

      // Map conversion-optimized routes to internal views
      if (hash === 'properties') hash = 'stays';
      if (hash === 'security') hash = 'services';
      if (hash === 'rides') hash = 'transport'; // Alias for Rides

      if (hash.startsWith('stays/')) {
        const identifier = hash.replace('stays/', '');
        const prop = getPropertyById(appData, identifier);
        if (prop) {
          setSelectedProperty(prop);
          setCurrentView('property-detail');
        } else {
          setCurrentView('stays');
        }
      } else if (['stays', 'services', 'host', 'food', 'transport', 'profile', 'favorites'].includes(hash)) {
        setCurrentView(hash as View);
      } else {
        setCurrentView('home');
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [appData]);

  const navigateTo = (view: View, property?: Property) => {
    if (property) {
      window.location.hash = `stays/${property.property_id}`;
    } else {
      window.location.hash = view === 'home' ? '' : view;
    }
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
      <Header currentView={currentView} onNavigate={navigateTo} appData={appData} />

      <main className="flex-grow">
        {currentView === 'home' && <Home onNavigate={navigateTo} appData={appData} />}
        {currentView === 'stays' && <Stays onNavigate={navigateTo} appData={appData} />}
        {currentView === 'property-detail' && selectedProperty && (
          <PropertyDetail property={selectedProperty} appData={appData} />
        )}
        {currentView === 'services' && <Services appData={appData} />}
        {currentView === 'food' && <Food appData={appData} />}
        {currentView === 'transport' && (
          <Transport
            appData={appData}
            transportData={transportData}
            isLoading={transportLoading}
          />
        )}
        {currentView === 'host' && <Host appData={appData} />}
        {(currentView === 'profile' || currentView === 'favorites') && (
          <Profile appData={appData} onNavigate={navigateTo} />
        )}
      </main>

      <Footer onNavigate={navigateTo} appData={appData} />
      <WhatsAppButton />
    </div>
  );
};

export default App;
