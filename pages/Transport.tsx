
import React, { useState, useMemo } from 'react';
import { AppData, TransportService, TransportVendor, TransportVehicle } from '../types';
import { 
  getTransportServices, 
  extractPrice, 
  parsePipes, 
  getTransportVendors,
  getBestTransportVendor,
  getVehiclesByVendor,
  getVehicleFleet,
  extractVehiclePrice,
  splitVehicleImages,
  buildVehicleWhatsAppUrl
} from '../dataStore';
import VehicleImageGallery from '../components/VehicleImageGallery';
import TransportLeadForm from '../components/TransportLeadForm';
import { Check, Clock, ShieldCheck, Zap, Plane, MessageCircle, MapPin, Users, Star, ArrowRight, Info } from 'lucide-react';

interface TransportProps {
  appData: AppData;
}

const Transport: React.FC<TransportProps> = ({ appData }) => {
  const [selectedCity, setSelectedCity] = useState(appData.meta.default_city || 'Asaba');
  const [selectedServiceType, setSelectedServiceType] = useState<'car_hire' | 'car_hire_escort' | 'escort_only' | 'private_jet'>('car_hire');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [activeService, setActiveService] = useState<TransportService | null>(null);
  const [leadNotes, setLeadNotes] = useState('');

  const availableCities = ['Asaba', 'Benin', 'Lagos', 'Port Harcourt', 'Uyo', 'Abuja'];
  
  const bestVendor = useMemo(() => 
    getBestTransportVendor(appData, selectedCity, selectedServiceType) || getTransportVendors(appData)[0],
    [appData, selectedCity, selectedServiceType]
  );

  const filteredServices = useMemo(() => {
    return getTransportServices(appData).filter(s => s.service_type === selectedServiceType);
  }, [appData, selectedServiceType]);

  const vehicles = useMemo(() => {
    // Return the entire fleet for all tabs to ensure maximum visibility, 
    // sorting by the defined sort_order
    return getVehicleFleet(appData);
  }, [appData]);

  const handleRequestQuote = (service: TransportService) => {
    setActiveService(service);
    setLeadNotes('');
    setIsLeadFormOpen(true);
  };

  const handleVehicleSelect = (vehicle: TransportVehicle) => {
    const serviceType = vehicle.category.toLowerCase().includes('jet') ? 'private_jet' : 'car_hire';
    const service = getTransportServices(appData).find(s => s.service_id === getBestServiceForVehicle(vehicle)) || null;
    
    setActiveService(service);
    setLeadNotes(`Interested in Vehicle: ${vehicle.make_model} (ID: ${vehicle.vehicle_id})`);
    setIsLeadFormOpen(true);
  };

  const getBestServiceForVehicle = (vehicle: TransportVehicle): string => {
    const cat = vehicle.category.toLowerCase();
    if (cat === 'private jet') return 'TRS_004';
    if (cat === 'escort') return 'TRS_002';
    if (cat === 'van') return 'TRS_003';
    return 'TRS_001';
  };

  return (
    <div className="pt-24 md:pt-36 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Fleet & Aviation</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-none">Umunna Rides</h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Premium Nigerian Movement. Car Hire • Escort • Private Jet Itinerary.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 mb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* City Selection */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block ml-1">Select City</label>
              <div className="relative">
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-[#C46210] transition-all"
                >
                  {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C46210]" size={20} />
              </div>
            </div>

            {/* Service Type Tabs */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block ml-1">Service Category</label>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {(['car_hire', 'car_hire_escort', 'escort_only', 'private_jet'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedServiceType(type)}
                    className={`whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedServiceType === type 
                      ? 'bg-[#C46210] text-white border-[#C46210] shadow-lg shadow-orange-100' 
                      : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white'
                    }`}
                  >
                    {type.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Info (If Matched) */}
        {bestVendor && (
          <div className="mb-12 flex items-center justify-between bg-[#C46210]/5 p-6 rounded-3xl border border-[#C46210]/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
                {bestVendor.logo_url ? <img src={bestVendor.logo_url} alt={bestVendor.vendor_name} className="w-full h-full object-contain" /> : <Star className="text-[#C46210]" />}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-[#C46210] tracking-widest">Selected Provider</p>
                <h3 className="font-black text-gray-900">{bestVendor.vendor_name}</h3>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Coverage</p>
                <p className="text-xs font-bold text-gray-600">{bestVendor.coverage_cities.join(' • ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="mb-24">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map(service => (
                <div key={service.service_id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 flex flex-col hover:shadow-2xl transition-all duration-500 group">
                  <div className="mb-6 flex justify-between items-start">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#C46210] group-hover:bg-[#C46210] group-hover:text-white transition-all duration-500">
                      {service.service_type === 'private_jet' ? <Plane size={28} /> : <Zap size={28} />}
                    </div>
                    {service.available_24_7 === "Yes" && (
                      <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-green-100">24/7 Live</span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-[#C46210] transition-colors">{service.service_title}</h3>
                  
                  <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Estimated Cost</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl md:text-2xl font-black text-gray-900">{extractPrice(service.starting_price_ngn)}</span>
                      {service.pricing_unit !== 'quote' && (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/{service.pricing_unit.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-grow">{service.description}</p>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-3 text-[#C46210] text-[10px] font-black uppercase tracking-widest">
                      <Clock size={16} /> Ready in {service.lead_time_hours}hr
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-3">What's Included</span>
                      <div className="flex flex-wrap gap-2">
                        {(parsePipes(service.includes) as string[]).map(inc => (
                          <span key={inc} className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-600 border border-gray-100 uppercase tracking-tighter">
                            {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={bestVendor ? `https://wa.me/${bestVendor.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello Umunna Rides, I'm interested in the ${service.service_title} service in ${selectedCity}. Please provide details and availability.`)}` : '#'}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C46210] transition-all shadow-lg"
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                    <button 
                      onClick={() => handleRequestQuote(service)}
                      className="flex items-center justify-center gap-2 bg-[#C46210] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-100"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No specialized vendor in {selectedCity}</h3>
              <p className="text-gray-400 font-medium mb-8">But don't worry, our main concierge can handle this for you.</p>
              <a 
                href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=Hello, I need ${selectedServiceType.replace(/_/g, ' ')} in ${selectedCity}. Can you help?`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#C46210] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-100"
              >
                Contact Main Concierge <ArrowRight size={18} />
              </a>
            </div>
          )}
        </div>

        {/* Vehicle Fleet Section */}
        {vehicles.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Available Fleet</h2>
              <div className="h-px flex-grow bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {vehicles.map((v) => (
                <div 
                  key={v.vehicle_id} 
                  className={`group bg-white rounded-[40px] overflow-hidden border shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col ${
                    v.category.toLowerCase().includes('jet') 
                    ? 'border-yellow-200 ring-1 ring-yellow-100/50' 
                    : 'border-gray-100'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <VehicleImageGallery images={splitVehicleImages(v.image_url)} alt={v.make_model} />
                    <div className={`absolute top-4 left-4 px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl border text-[10px] font-black uppercase tracking-widest ${
                      v.category.toLowerCase().includes('jet')
                      ? 'bg-yellow-50/90 border-yellow-200 text-yellow-700'
                      : 'bg-white/95 border-white/20 text-gray-900'
                    }`}>
                      {v.category}
                    </div>
                    {/* Price Tag Overlay */}
                    <div className={`absolute bottom-4 right-4 px-4 py-2 backdrop-blur-md rounded-xl shadow-lg border ${
                      v.category.toLowerCase().includes('jet')
                      ? 'bg-yellow-900/80 border-yellow-500/30 text-yellow-100'
                      : 'bg-black/80 border-white/10 text-white'
                    }`}>
                      <span className={`text-[8px] font-black uppercase tracking-widest block -mb-0.5 ${
                        v.category.toLowerCase().includes('jet') ? 'text-yellow-400' : 'text-gray-400'
                      }`}>Rate</span>
                      <span className="text-sm font-black">{extractVehiclePrice(v.daily_rate_ngn)}</span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className={`text-xl font-black transition-colors ${
                          v.category.toLowerCase().includes('jet') ? 'text-yellow-900 group-hover:text-yellow-700' : 'text-gray-900 group-hover:text-[#C46210]'
                        }`}>{v.make_model}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {v.vehicle_id}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 font-black text-xs">
                        <Users size={16} className="text-[#C46210]" /> {v.seats} Seats
                      </div>
                    </div>

                    <div className="mb-8 flex flex-wrap gap-2">
                      {(parsePipes(v.features) as string[]).map((feat, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-600 border border-gray-100 uppercase tracking-tight">
                          {feat}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-2 gap-3">
                      <a 
                        href={bestVendor ? buildVehicleWhatsAppUrl(bestVendor, v, selectedCity) : '#'}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                      <button 
                        onClick={() => handleVehicleSelect(v)}
                        className="bg-[#C46210] text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-100"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Bar */}
        <div className="p-12 bg-white rounded-[48px] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#C46210]/10 rounded-2xl flex items-center justify-center text-[#C46210] mb-6">
              <ShieldCheck size={32} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-2">Vetted Drivers</h4>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[200px]">Rigorous security clearance for all personnel.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#C46210]/10 rounded-2xl flex items-center justify-center text-[#C46210] mb-6">
              <Clock size={32} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-2">Punctuality</h4>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[200px]">Strict adherence to schedules and timelines.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#C46210]/10 rounded-2xl flex items-center justify-center text-[#C46210] mb-6">
              <Plane size={32} />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-2">Global Standards</h4>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[200px]">Luxury fleet maintained to aviation standards.</p>
          </div>
        </div>
      </div>

      {isLeadFormOpen && (
        <TransportLeadForm 
          appData={appData}
          selectedService={activeService}
          selectedVendor={bestVendor}
          selectedCity={selectedCity}
          initialNotes={leadNotes}
          onClose={() => setIsLeadFormOpen(false)}
        />
      )}
    </div>
  );
};

export default Transport;
