
import React from 'react';
import { AppData } from '../types';
import { MessageCircle, ShoppingBag, Truck, Shield } from 'lucide-react';

interface ServicesProps {
  appData: AppData;
}

const Services: React.FC<ServicesProps> = ({ appData }) => {
  return (
    <div className="pt-24 md:pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Lifestyle Concierge</h1>
          <p className="text-lg text-gray-600">Elevate your stay with our curated private services, exclusively available to Umunna guests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {appData.services_catalog.map((service) => (
            /* Fixed: Service_ID -> service_id */
            <div key={service.service_id} className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full">
              <div className="p-10 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-[#C46210]/10 rounded-2xl flex items-center justify-center text-[#C46210]">
                    {/* Fixed: Type -> type */}
                    {service.type === 'Food' ? <ShoppingBag size={32} /> : service.type === 'Ride' ? <Truck size={32} /> : <Shield size={32} />}
                  </div>
                  {/* Fixed: Type -> type */}
                  <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">{service.type}</span>
                </div>
                
                {/* Fixed: Name -> name */}
                <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                {/* Fixed: Description -> description */}
                <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                  {service.description}
                </p>
                
                <div className="mb-8">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Coverage</span>
                  <div className="flex flex-wrap gap-2">
                    {/* Fixed: Coverage_Cities -> coverage_cities */}
                    {service.coverage_cities.map(city => (
                      <span key={city} className="text-xs font-bold bg-gray-50 text-gray-600 px-2 py-1 rounded">{city}</span>
                    ))}
                  </div>
                </div>

                {/* Fixed: appData.business_info -> appData.meta and WhatsApp_Prefill -> whatsapp_prefill */}
                <a 
                  href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent(service.whatsapp_prefill)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-bold hover:bg-[#C46210] transition-all group-hover:shadow-xl"
                >
                  <MessageCircle size={20} />
                  Book Service
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 bg-white rounded-[40px] p-12 md:p-20 text-center border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 adinkra-pattern pointer-events-none opacity-5" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Bespoke Requests?</h2>
            <p className="text-lg text-gray-600 mb-10">Our concierge team is standing by to facilitate private jets, corporate event planning, and exclusive tours tailored to your itinerary.</p>
            {/* Fixed: appData.business_info -> appData.meta */}
            <a 
              href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=Hello%20Umunna,%20I%20have%20a%20bespoke%20request.`}
              className="inline-flex items-center gap-3 bg-[#C46210] text-white px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl"
            >
              Contact Direct Concierge
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
