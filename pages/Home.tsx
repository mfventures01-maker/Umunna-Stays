
import React, { useState } from 'react';
import { View, Property, AppData } from '../types';
import { getFeaturedProperties, getServicesByType } from '../dataStore';
import PropertyCarousel from '../components/PropertyCarousel';
import ConciergeLeadForm from '../components/concierge/ConciergeLeadForm';
import { Search, ChevronRight, ArrowRight, ShieldCheck, Zap, Wifi, Droplets, AlertTriangle } from 'lucide-react';
import ServiceHeroCarousel from '../src/components/ServiceHeroCarousel';
import LeadCapturePopup from '../src/components/LeadCapturePopup';
import nateImg from '../src/assets/nate-signature-hero.jpg';
import foodImg from '../src/assets/rice-chicken.png';
import transportImg from '../src/assets/land-cruiser.png';

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
      <ServiceHeroCarousel
        slides={[
          {
            id: "apartments",
            badge: "Sanctuary",
            title: "Arrive. Exhale. No Stories.",
            subtitle: "The only short-let where 24/7 power is guaranteed, not prayed for.",
            ctaText: "Check Availability",
            route: "/properties",
            imageUrl: nateImg
          },
          {
            id: "transport",
            badge: "Ghost Protocol",
            title: "Secure Logistics",
            subtitle: "Unmarked assets. Tinted SUVs. Drivers vetted for silence.",
            ctaText: "Secure Movement",
            route: "/transport",
            imageUrl: transportImg
          },
          {
            id: "food",
            badge: "Fuel",
            title: "Kitchen Logic",
            subtitle: "Hot meals delivered. Comfort without leaving your fortress.",
            ctaText: "Order Intake",
            route: "/food",
            imageUrl: foodImg
          }
        ]}
        autoPlayMs={5000}
      />
      <LeadCapturePopup />

      {/* Concierge Command Form */}
      <section className="py-12 bg-white relative -mt-20 z-20 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
            <ConciergeLeadForm />
          </div>
        </div>
      </section>

      {/* Video Pattern Interrupt */}
      <section className="py-12 bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto border border-gray-800 p-8 rounded-3xl bg-gray-900/50 backdrop-blur-sm">
            <p className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4">The Standard</p>
            <h3 className="text-2xl md:text-4xl font-black mb-6">"Clean is not luxury. It is the minimum."</h3>
            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden group">
              {/* Placeholder for silent video */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="border border-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                  Silent Walkthrough Loading...
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Audit */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4 block">No Stories</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Infrastructure Audit</h2>
            <p className="text-gray-500 mt-4 font-medium">Physics over promises. We don't hope for light, we engineer it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} fill="currentColor" />
              </div>
              <h4 className="font-black text-xl mb-2">Power Redundancy</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Grid + Solar + Diesel Gen. <br />
                <span className="text-green-600 font-bold">0ms Transfer Switch.</span> <br />
                We do not "manage" light.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Wifi size={24} />
              </div>
              <h4 className="font-black text-xl mb-2">Connectivity</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Starlink Primary + Fiber Failover. <br />
                <span className="text-blue-600 font-bold">150Mbps+ Verified.</span> <br />
                Video calls do not freeze here.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Droplets size={24} />
              </div>
              <h4 className="font-black text-xl mb-2">Water Pressure</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Industrial treatment plant. <br />
                <span className="text-cyan-600 font-bold">6.5 Bar Pressure.</span> <br />
                Showers that actually work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Not For Everyone Filter */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 md:p-12 md:flex items-center gap-12 max-w-4xl mx-auto">
            <div className="flex-shrink-0 mb-6 md:mb-0">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-red-900 mb-4">Umunna is not for everyone.</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-red-800 font-medium text-sm">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                  We do not negotiate prices on arrival.
                </li>
                <li className="flex items-start gap-3 text-red-800 font-medium text-sm">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                  We do not accept cash at the gate.
                </li>
                <li className="flex items-start gap-3 text-red-800 font-medium text-sm">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                  We do not do surprise fees. We adhere to protocol.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Collection */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-4 gap-6">
            <div className="max-w-2xl">
              <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4 block">The Assets</span>
              <h2 className="text-3xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Signature Collection</h2>
              <p className="text-gray-500 text-lg md:text-xl font-medium">Extraordinary residences vetted for design, security, and silence.</p>
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

      {/* Logistics / Concierge */}
      <section className="py-24 bg-gray-900 text-white rounded-t-[50px] mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-12">Logistics handled so you don't think.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {mainServices.map((service) => (
              <div key={service.service_id} className="bg-gray-800 p-10 rounded-[40px] shadow-2xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                <p className="text-gray-400 mb-8">{service.description}</p>
                <a
                  href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent(service.whatsapp_prefill)}`}
                  className="text-[#C46210] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-white transition-colors"
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
