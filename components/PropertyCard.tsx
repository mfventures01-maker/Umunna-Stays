import React, { useMemo } from 'react';
import { Property, AppData } from '../types';
import { MapPin, Users, MessageCircle, Bed, ArrowRight, Plane, Utensils, Tag } from 'lucide-react';
import CardImageCarousel from './CardImageCarousel';
import { getPhotosByPropertyId } from '../dataStore';

interface PropertyCardProps {
  property: Property;
  appData: AppData;
  onClick: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, appData, onClick }) => {
  const photos = useMemo(() => {
    return getPhotosByPropertyId(appData, property.property_id).slice(0, 8);
  }, [appData, property.property_id]);
  
  const whatsappBase = `https://wa.me/${property.host.host_whatsapp || appData.meta.whatsapp_main_number}`;
  
  const intents = [
    { 
      icon: <Plane size={14} />, 
      label: 'Pickup', 
      text: `Hello, I'd like to book an airport pickup for my stay at ${property.name} in ${property.city}.` 
    },
    { 
      icon: <Utensils size={14} />, 
      label: 'Dining', 
      text: `Hello, I'd like to reserve a VIP table/private chef during my stay at ${property.name}.` 
    },
    { 
      icon: <Tag size={14} />, 
      label: 'Discount', 
      text: `Hello, I'm interested in a long-stay discount for ${property.name}.` 
    }
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(property);
    }
  };

  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full focus-within:ring-2 focus-within:ring-[#C46210] outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${property.name} in ${property.city}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <CardImageCarousel 
          photos={photos} 
          onCardClick={() => onClick(property)} 
        />
        
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black text-[#C46210] flex items-center gap-1 z-10 shadow-sm border border-gray-100">
          {appData.meta.currency_symbol}{property.nightly_rate.toLocaleString()}
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          {intents.map((intent, i) => (
            <a
              key={i}
              href={`${whatsappBase}?text=${encodeURIComponent(intent.text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-800 shadow-xl hover:bg-[#C46210] hover:text-white transition-all border border-white/20"
              title={intent.label}
              onClick={(e) => e.stopPropagation()}
            >
              {intent.icon}
            </a>
          ))}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-black text-gray-900 group-hover:text-[#C46210] transition-colors cursor-pointer line-clamp-1 mb-1" onClick={() => onClick(property)}>
            {property.name}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <MapPin size={10} className="text-[#D4A017]" />
            <span>{property.city}, {property.state}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-5 text-gray-500 text-[10px] mb-6 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Bed size={14} className="text-[#C46210]" strokeWidth={3} />
            <span>{property.bedrooms} BR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[#C46210]" strokeWidth={3} />
            <span>{property.capacity}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {property.badges.slice(0, 3).map((badge, i) => (
            <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-auto flex gap-3">
          <button 
            onClick={() => onClick(property)}
            className="flex-grow flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-[0.97] shadow-lg"
          >
            Details <ArrowRight size={14} />
          </button>
          <a 
            href={`${whatsappBase}?text=${encodeURIComponent(property.booking.whatsapp_prefill)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-[#25D366] text-white p-3 rounded-2xl hover:bg-[#20bd5a] hover:shadow-xl transition-all active:scale-[0.97]"
          >
            <MessageCircle size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
