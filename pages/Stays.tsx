import React, { useState, useMemo } from 'react';
import { Property, View, AppData } from '../types';
import PropertyCarousel from '../components/PropertyCarousel';
import { getFeaturedProperties, getCities, getPropertiesByCity } from '../dataStore';
import { Search, X, SlidersHorizontal, MapPin } from 'lucide-react';

interface StaysProps {
  onNavigate: (view: View, property?: Property) => void;
  appData: AppData;
}

const Stays: React.FC<StaysProps> = ({ onNavigate, appData }) => {
  const [activeCity, setActiveCity] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Recommended');

  const cities = getCities(appData);
  const featured = getFeaturedProperties(appData);

  const filteredResults = useMemo(() => {
    // Defensive check: Ensure properties array exists
    const properties = appData?.properties || [];

    // We filter based on the active city selection first
    return getPropertiesByCity(appData, activeCity)
      .filter(p => {
        if (!p) return false;
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (p.name || '').toLowerCase().includes(query) ||
          (p.city || '').toLowerCase().includes(query) ||
          (p.state || '').toLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'Price Low') return (a.nightly_rate || 0) - (b.nightly_rate || 0);
        if (sortBy === 'Price High') return (b.nightly_rate || 0) - (a.nightly_rate || 0);
        return (a.display_order || 0) - (b.display_order || 0);
      });
  }, [appData, activeCity, search, sortBy]);

  const resultsTitle = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (activeCity !== 'All') return `${activeCity} Registry`;
    return 'Full Registry';
  }, [search, activeCity]);

  return (
    <div className="pt-24 md:pt-36 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        {/* Featured Section (Fixed Highlights) */}
        {!search && activeCity === 'All' && (
          <div className="mb-10">
            <PropertyCarousel
              properties={featured}
              appData={appData}
              title="The Sanctuaries"
              subtitle="Fortresses of silence and infrastructure. Vetted for power, pressure, and ping."
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* Registry / Search Section */}
        <div className="px-4">
          <div className="mb-12 border-t border-gray-200 pt-16">
            <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Discover More</span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
              {search ? 'Search Stays' : 'The Registry'}
            </h1>
            <p className="text-gray-500 text-base md:text-lg font-medium">
              {search
                ? `Exploring available options matching your request.`
                : 'Browse our full collection of vetted short-stay residences.'
              }
            </p>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="relative flex-grow max-w-xl group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C46210] transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search name, city or state..."
                className="w-full pl-14 pr-12 py-4 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-[#C46210]/5 focus:border-[#C46210] outline-none shadow-sm font-medium transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all"
                  aria-label="Clear search"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeCity === city
                      ? 'bg-[#C46210] text-white border-[#C46210] shadow-xl -translate-y-0.5'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <div className="flex-shrink-0">
              <select
                className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-[#C46210] transition-colors appearance-none pr-12 relative"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Recommended">Sort: Recommended</option>
                <option value="Price Low">Price: Low to High</option>
                <option value="Price High">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results Display */}
          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-grow bg-gray-200" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {resultsTitle} • {filteredResults.length} Found
                </span>
                <div className="h-px flex-grow bg-gray-200" />
              </div>

              <PropertyCarousel
                properties={filteredResults}
                appData={appData}
                onNavigate={onNavigate}
              />
            </div>
          ) : (
            <div className="text-center py-24 md:py-40 bg-white rounded-[40px] border border-gray-100 shadow-sm px-6">
              <div className="inline-flex w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full items-center justify-center mb-8 text-[#C46210]/20">
                <Search size={40} className="animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">No matches for "{search}"</h3>
              <p className="text-gray-500 mb-10 font-medium max-w-sm mx-auto">
                We couldn't find any stays matching your criteria {activeCity !== 'All' && `in ${activeCity}`}.
                Try checking another city or adjusting your keywords.
              </p>
              <button
                onClick={() => { setActiveCity('All'); setSearch(''); }}
                className="bg-black text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#C46210] transition-all active:scale-95 shadow-xl"
              >
                Show All Properties
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stays;