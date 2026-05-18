import React, { useEffect } from 'react';
import { Property, AppData } from '../types';
import {
  MapPin, Users, Wifi, Wind, Shield, Coffee, CheckCircle2, Clock,
  Home as HomeIcon, Plane, Utensils, Tag, Bed, Check,
  Star, Heart,
  type LucideIcon
} from 'lucide-react';
import PropertyPhotoCardCarousel from '../components/PropertyPhotoCardCarousel';
import { getPhotosByPropertyId } from '../dataStore';
import { supabase } from '../src/lib/supabaseClient';
import { Amenity } from '../types';

import { useIntent } from '../src/hooks/useIntent';
import { PropertyFunnelSidebar } from '../components/PropertyFunnelSidebar';
import { ScrollTracker } from '../components/conversion/ScrollTracker';

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  Wifi, Zap: (props) => <Wifi {...props} />, // Fallback
  Tv: (props) => <Wifi {...props} />, // Fallback
  Wind, Snowflake: (props) => <Wind {...props} />, 
  Sun: (props) => <Wind {...props} />, 
  Moon: (props) => <Wind {...props} />, 
  Flame: (props) => <Wind {...props} />,
  Shield, Lock: (props) => <Shield {...props} />, 
  Key: (props) => <Shield {...props} />, 
  Eye: (props) => <Shield {...props} />,
  Coffee, Utensils, Refrigerator: (props) => <Coffee {...props} />,
  Bed, HomeIcon, Bath: (props) => <Bed {...props} />, 
  Shirt: (props) => <Bed {...props} />,
  Car: (props) => <MapPin {...props} />, 
  ParkingCircle: (props) => <MapPin {...props} />, 
  Plane,
  Dumbbell: (props) => <Users {...props} />, 
  Waves: (props) => <Users {...props} />, 
  Droplets: (props) => <Users {...props} />,
  Users, Baby: (props) => <Users {...props} />, 
  Dog: (props) => <Users {...props} />, 
  Cigarette: (props) => <Users {...props} />,
  CheckCircle2, Check, Star, Heart,
  MapPin, Tag,
  Music: (props) => <Wifi {...props} />,
};

interface PropertyDetailProps {
  property: Property;
  appData: AppData;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, appData }) => {
  const { intent, trackEvent } = useIntent(property.property_id);

  useEffect(() => {
    const brand = appData.meta.brand_name;
    document.title = `${property.name} | ${property.city} | ${brand}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const seoSnippet = `${property.name} in ${property.city}, ${property.state}. ${property.category} with ${property.bedrooms} bedrooms. ${property.about_this_space.slice(0, 150)}...`;
      metaDesc.setAttribute('content', seoSnippet);
    }
    window.scrollTo(0, 0);
    trackEvent('page_view', { property_id: property.property_id, entry_intent: intent });
  }, [property, appData, trackEvent]);

  const [topAmenities, setTopAmenities] = React.useState<Amenity[]>([]);
  const [groupedAmenities, setGroupedAmenities] = React.useState<Record<string, Amenity[]>>({});
  const [loadingAmenities, setLoadingAmenities] = React.useState(true);

  useEffect(() => {
    async function fetchAmenities() {
      setLoadingAmenities(true);
      const { data, error } = await supabase
        .from('property_amenities')
        .select('property_id, amenity:amenities_master(*)')
        .eq('property_id', property.property_id);

      if (error || !data) {
        setLoadingAmenities(false);
        return;
      }

      const allAmenities = data.map((item: any) => item.amenity as Amenity);
      const sorted = [...allAmenities].sort((a, b) => a.sort_rank - b.sort_rank);
      setTopAmenities(sorted.slice(0, 6));

      const groups: Record<string, Amenity[]> = {};
      sorted.forEach(a => {
        if (!groups[a.category]) groups[a.category] = [];
        groups[a.category].push(a);
      });
      setGroupedAmenities(groups);
      setLoadingAmenities(false);
    }
    fetchAmenities();
  }, [property.property_id]);

  const getIcon = (iconName: string) => {
    const Icon = AMENITY_ICON_MAP[iconName] || CheckCircle2;
    return <Icon size={20} />;
  };

  const propertyPhotos = getPhotosByPropertyId(appData, property.property_id);
  const carouselData = {
    property_id: property.property_id,
    about_this_space: property.about_this_space,
    photos: propertyPhotos
  };

  const host = property.host ?? {};
  const booking = property.booking ?? {};
  const badges = property.badges ?? [];

  const whatsappBase = `https://wa.me/${host.host_whatsapp || appData.meta.whatsapp_main_number}`;

  const intents = [
    {
      icon: <Plane size={20} />,
      label: 'Airport Pickup',
      text: `Hello, I'd like to book an airport pickup for my stay at ${property.name}.`
    },
    {
      icon: <Utensils size={20} />,
      label: 'Private Chef/Dining',
      text: `Hello, I'd like to reserve a private chef/dining experience during my stay at ${property.name}.`
    },
    {
      icon: <Tag size={20} />,
      label: 'Long Stay Inquiry',
      text: `Hello, I'm interested in a long-stay discount for ${property.name}.`
    }
  ];

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-white">
      <ScrollTracker onThreshold={(t) => trackEvent('scroll_threshold', { depth: t })} />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div 
              onClick={() => trackEvent('gallery_click', { property_id: property.property_id })}
              className="cursor-pointer"
            >
              <PropertyPhotoCardCarousel propertyData={carouselData} />
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {intents.map((item, i) => (
                <a
                  key={i}
                  href={`${whatsappBase}?text=${encodeURIComponent(item.text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('intent_cta_click', { label: item.label })}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#C46210] shadow-sm group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Inquire</span>
                    <span className="block font-bold text-gray-900 text-sm">{item.label}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-16">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{property.category}</span>
                {(property.badges ?? []).map((badge, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-gray-200">
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-10 leading-tight">{property.name}</h1>

              <div className="prose prose-lg max-w-none mb-16">
                <p className="text-gray-600 leading-relaxed text-lg">{property.about_this_space}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                <div className="space-y-12">
                  <div>
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-[#C46210] rounded-full" />
                      Premium Amenities
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {loadingAmenities ? (
                        Array(6).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                            <div className="w-24 h-4 bg-gray-200 rounded" />
                          </div>
                        ))
                      ) : (
                        topAmenities.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 text-gray-700 group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#C46210] shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                              {getIcon(item.icon_name)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{item.category}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {Object.keys(groupedAmenities).length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-[#C46210] rounded-full" />
                        All Features
                      </h3>
                      <div className="space-y-8">
                        {Object.entries(groupedAmenities).map(([category, items]) => (
                          <div key={category}>
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">{category}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                  <Check className="text-green-500" size={16} />
                                  <span className="text-gray-700 text-sm font-medium">{item.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Quick Overview</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-[#C46210]" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Location</span>
                          <span className="font-bold text-sm text-gray-800">{property.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="text-[#C46210]" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Capacity</span>
                          <span className="font-bold text-sm text-gray-800">{property.capacity} Guests</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Bed className="text-[#C46210]" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Bedrooms</span>
                          <span className="font-bold text-sm text-gray-800">{property.bedrooms} Ensuite</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="text-[#C46210]" size={20} />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Min. Stay</span>
                          <span className="font-bold text-sm text-gray-800">{(property.booking ?? {}).minimum_stay || 1} Night(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#C46210] rounded-full" />
                    Global Policies
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg text-[#D4A017]"><Clock size={18} /></div>
                      <div>
                        <span className="block font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-1">Check-in/out</span>
                        <p className="text-gray-700 text-sm font-medium">{appData.policies_global.check_in} / {appData.policies_global.check_out}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg text-[#D4A017]"><Users size={18} /></div>
                      <div>
                        <span className="block font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-1">Children & Beds</span>
                        <p className="text-gray-700 text-sm font-medium">{appData.policies_global.children} / {appData.policies_global.beds}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg text-[#D4A017]"><Shield size={18} /></div>
                      <div>
                        <span className="block font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-1">Guest Safety</span>
                        <p className="text-gray-700 text-sm font-medium">{appData.policies_global.self_check_in}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adaptive Funnel Sidebar (Phase 4) */}
          <div className="lg:col-span-4">
            <PropertyFunnelSidebar property={property} appData={appData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;