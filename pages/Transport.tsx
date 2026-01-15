
import React, { useState, useMemo } from 'react';
import { AppData, TransportService, TransportVendor, TransportVehicle } from '../types';
import { 
  getTransportServices, 
  extractPrice, 
  parsePipes, 
  buildTransportWhatsAppUrl, 
  getActiveTransportVendorsByCity,
  getVehicleFleet,
  extractVehiclePrice,
  splitVehicleImages,
  buildVehicleWhatsAppUrl
} from '../dataStore';
import VehicleImageGallery from '../components/VehicleImageGallery';
import { Check, Clock, ShieldCheck, Zap, Plane, MessageCircle, MapPin, Users, Star } from 'lucide-react';

interface TransportProps {
  appData: AppData;
}

const Transport: React.FC<TransportProps> = ({ appData }) => {
  const [selectedCity, setSelectedCity] = useState(appData.meta.default_city || 'Asaba');
  
  const allServices = getTransportServices(appData);
  const fleet = getVehicleFleet(appData);
  const cityVendors = getActiveTransportVendorsByCity(appData, selectedCity);
  
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    appData.transport_vendors.forEach(v => {
      if (v.is_active) v.coverage_cities.forEach(c => cities.add(c));
    });
    return Array.from(cities).sort();
  }, [appData]);

  const groupedFleet = useMemo(() => {
    const groups: Record<string, TransportVehicle[]> = {};
    fleet.forEach(v => {
      const cat = v.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(v);
    });
    return groups;
  }, [fleet]);

  return (
    <div className="pt-24 md:pt-36 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Fleet & Aviation</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-none">Umunna Rides</h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Premium Nigerian Movement. Car Hire • Escort • Private Jet.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <MapPin size={14} className="text-[#C46210]" /> Select Coverage City:
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {availableCities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedCity === city ? 'bg-[#C46210] text-white border-[#C46210]' : 'bg-white text-gray-500 border-gray-100'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Transport Packages</h2>
            <div className="h-px flex-grow bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {allServices.map((service: TransportService) => (
              <div key={service.service_id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all h-full">
                <div className="mb-6 flex justify-between items-start">
                   {service.available_24_7 === "Yes" && <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-green-100 flex items-center gap-1"><Zap size={10} /> 24/7</span>}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4">{service.service_title}</h3>
                <div className="mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Starting From</span>
                  <span className="text-2xl font-black text-gray-900">₦{extractPrice(service.starting_price_ngn)}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">/{service.pricing_unit}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 flex-grow">{service.description}</p>
                <div className="space-y-4 mb-8">
                   <div className="flex items-center gap-2 text-[#C46210] text-[10px] font-black uppercase">
                     <Clock size={14} /> Ready in {service.lead_time_hours}hr
                   </div>
                   <ul className="space-y-1">
                     {/* Fix: Directly use the return type of parsePipes and provide explicit type casting to string[] to resolve unknown type error */}
                     {(parsePipes(service.includes) as string[]).slice(0, 3).map((inc: string) => (
                       <li key={inc} className="text-[11px] font-bold text-gray-600 flex items-center gap-2"><Check size={12} className="text-green-500" /> {inc}</li>
                     ))}
                   </ul>
                </div>
                <a 
                  href={buildTransportWhatsAppUrl(appData.transport_vendors[0], { service_type: service.service_title, city: selectedCity })}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#C46210] transition-all text-center"
                >
                  {service.service_type === 'private_jet' ? 'Get Quote' : 'Book Now'}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Fleet Section */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Premium Fleet</h2>
            <div className="h-px flex-grow bg-gray-200" />
          </div>

          <div className="space-y-20">
            {Object.entries(groupedFleet).map(([category, vehicles]) => (
              <div key={category}>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#C46210] mb-8 border-l-4 border-[#C46210] pl-4">{category} Fleet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {vehicles.map((v: TransportVehicle) => {
                    const price = extractVehiclePrice(v.daily_rate_ngn);
                    const images = splitVehicleImages(v.image_url);
                    const features = parsePipes(v.features);
                    const isPremiumJet = v.category.toLowerCase() === 'private jet';
                    const vendor = appData.transport_vendors.find(vend => vend.vendor_id === v.vendor_id) || appData.transport_vendors[0];

                    return (
                      <div key={v.vehicle_id} className={`group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col ${isPremiumJet ? 'ring-2 ring-[#C46210]/20' : ''}`}>
                        {/* 60% Height Primary Image */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                          <VehicleImageGallery images={images} alt={v.make_model} />
                          <div className={`absolute top-4 left-4 px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl border border-white/20 text-[10px] font-black uppercase tracking-widest ${isPremiumJet ? 'bg-[#C46210] text-white' : 'bg-white/95 text-gray-900'}`}>
                            {v.category}
                          </div>
                          {v.is_available === "Yes" ? (
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Zap size={10} fill="currentColor" /> Available
                            </div>
                          ) : (
                            <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                              Check Availability
                            </div>
                          )}
                        </div>

                        <div className="p-8 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-black text-gray-900 group-hover:text-[#C46210] transition-colors">{v.make_model}</h4>
                            <div className="flex items-center gap-1.5 text-gray-400 font-black text-xs">
                              <Users size={16} className="text-[#C46210]" /> {v.seats}
                            </div>
                          </div>

                          <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900">{price}</span>
                          </div>

                          <div className="space-y-4 mb-10 flex-grow">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Top Features</span>
                            <ul className="flex flex-wrap gap-2">
                              {/* Fix: Provide explicit type casting for features to string[] to ensure correctness */}
                              {(features as string[]).map((feat: string, i: number) => (
                                <li key={i} className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-600 border border-gray-100 uppercase tracking-tight">
                                  {feat}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <a 
                            href={buildVehicleWhatsAppUrl(vendor, v, selectedCity)}
                            target="_blank" rel="noopener noreferrer"
                            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isPremiumJet ? 'bg-[#C46210] text-white hover:bg-black' : 'bg-gray-900 text-white hover:bg-[#C46210]'}`}
                          >
                            {isPremiumJet ? 'Inquire Luxury Jet' : 'Book This Vehicle'}
                            <MessageCircle size={16} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Bar */}
        <div className="p-12 bg-white rounded-[48px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 text-center">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-[#C46210]/10 rounded-2xl flex items-center justify-center text-[#C46210] mb-4">
              <ShieldCheck size={28} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-1">Vetted Drivers</h4>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight">Security & Clearance Checked</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-[#C46210]/10 rounded-2xl flex items-center justify-center text-[#C46210] mb-4">
              <Clock size={28} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-1">Punctuality</h4>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight">On-Time Professional Fleet</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-[#C46210]/10 rounded-2xl flex items-center justify-center text-[#C46210] mb-4">
              <Plane size={28} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-1">Elite Fleet</h4>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight">Luxury Sedans to Private Jets</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transport;
