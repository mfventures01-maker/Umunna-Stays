
import React, { useState } from 'react';
import { View, Property, AppData } from '../types';
import { getFeaturedProperties, getServicesByType } from '../dataStore';
import PropertyCarousel from '../components/PropertyCarousel';
import ConciergeLeadForm from '../components/concierge/ConciergeLeadForm';
import { Search, ChevronRight, ArrowRight } from 'lucide-react';
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
            badge: "Stay",
            title: "Premium Short-Stay Apartments",
            subtitle: "Clean, secure, and ready — book fast, check-in easier.",
            ctaText: "View Properties",
            route: "/properties",
            imageUrl: nateImg
          },
          {
            id: "food",
            badge: "Eat",
            title: "Food & Kitchen Delivery",
            subtitle: "Hot meals delivered — comfort without leaving your stay.",
            ctaText: "Browse Food",
            route: "/food",
            imageUrl: foodImg
          },
          {
            id: "transport",
            badge: "Move",
            title: "Transport & Chauffeur Services",
            subtitle: "Airport pickups, city trips, and premium rides.",
            ctaText: "Book a Ride",
            route: "/transport",
            imageUrl: transportImg
          },
          {
            id: "security",
            badge: "Secure",
            title: "Private Security Escort",
            subtitle: "Professional coverage for personal movement and high-value trips.",
            ctaText: "Request Security",
            route: "/security",
            imageUrl: "https://i.postimg.cc/W1Vtsm99/PRIVATE-SECURITY.png"
          }
        ]}
        autoPlayMs={4500}
      />
      <LeadCapturePopup />

      {/* Legacy Search (Hidden on Mobile if Carousel is present? Or kept? Keeping purely for potential utility below if desired, but user asked for hero replacement. I will comment out the old hero section completely to avoid visual clutter, as implied by 'hero position' replacement.) */}
      {/*
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        ... (Old Hero Content) ...
      </section>
      */}

      {/* Restoring Search Bar in a separate container if needed? 
          USER INSTRUCTION: "Wire carousel into the homepage... Render the carousel at the TOP of the page (hero position)".
          The prompt didn't strictly say "delete the old hero", but keeping two heroes is bad UI. 
          I will provide the Carousel. 
      */}

      <section className="py-12 bg-white relative -mt-20 z-20 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto shadow-2xl rounded-3xl overflow-hidden">
            <ConciergeLeadForm />
          </div>
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
