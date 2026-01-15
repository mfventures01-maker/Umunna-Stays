
import React, { useState } from 'react';
import { View, Property, AppData } from '../types';
import { getFeaturedProperties, getServicesByType } from '../dataStore';
import PropertyCarousel from '../components/PropertyCarousel';
import { Search, ChevronRight, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: View, property?: Property) => void;
  appData: AppData;
}

const Home: React.FC<HomeProps> = ({ onNavigate, appData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const featured = getFeaturedProperties(appData);
  const mainServices = [
    ...getServicesByType(appData, 'Food').slice(0, 1),
    ...getServicesByType(appData, 'Ride').slice(0, 1),
    ...getServicesByType(appData, 'Security').slice(0, 1)
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('stays');
  };

  return (
    <div className="pt-16 md:pt-20">
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://i.postimg.cc/FRLmJ1Fc/4_bed_living_space.jpg" 
            alt="Luxury Interior Nigeria" 
            className="w-full h-full object-cover scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative container mx-auto px-4 text-center text-white z-10 max-w-4xl">
          <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
            Curated Short-Stays <br/> <span className="text-[#D4A017]">Privacy. Exclusivity.</span>
          </h1>
          <p className="text-lg md:text-2xl font-light mb-10 opacity-90 max-w-2xl mx-auto">
            {appData.meta.brand_name} — Premium concierged hospitality in {appData.meta.default_city} and beyond.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto bg-white p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-2 shadow-2xl">
            <div className="flex-grow flex items-center px-4">
              <Search className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="Where to? (Benin, Asaba, Awka...)" 
                className="w-full py-4 bg-transparent text-gray-800 outline-none placeholder:text-gray-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-[#C46210] text-white px-10 py-4 rounded-full font-black hover:bg-[#a3510d] transition-all">
              Explore
            </button>
          </form>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-4 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Signature Collection</h2>
              <p className="text-gray-500 text-lg md:text-xl font-medium">Extraordinary residences vetted for design, security, and location.</p>
            </div>
            <button 
              onClick={() => onNavigate('stays')}
              className="flex items-center gap-3 bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all"
            >
              View Full Registry <ChevronRight size={18} />
            </button>
          </div>
          <PropertyCarousel properties={featured} appData={appData} onNavigate={onNavigate} />
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-12">Concierge Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {mainServices.map((service) => (
              <div key={service.service_id} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                <p className="text-gray-500 mb-6">{service.description}</p>
                <a 
                  href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent(service.whatsapp_prefill)}`}
                  className="text-[#C46210] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  Request Service <ArrowRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
