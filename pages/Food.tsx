import React, { useState, useMemo } from 'react';
import { AppData, FoodVendor, Dish } from '../types';
import { getFoodVendors, getJudithMenu } from '../dataStore';
import { MessageCircle, Clock, MapPin, Utensils, Search, ArrowRight, ExternalLink } from 'lucide-react';

interface FoodProps {
  appData: AppData;
}

const Food: React.FC<FoodProps> = ({ appData }) => {
  const vendors = getFoodVendors();
  const mainVendor = vendors[0]; // Judith Amazing Kitchen
  const menuItems = getJudithMenu();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return ['All', ...cats];
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    return menuItems
      .filter(item => item.is_available === 'Yes')
      .filter(item => activeCategory === 'All' || item.category === activeCategory)
      .filter(item => 
        item.dish_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [menuItems, activeCategory, searchTerm]);

  const groupedMenu = useMemo(() => {
    const groups: Record<string, Dish[]> = {};
    filteredMenu.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredMenu]);

  const handleOrder = (dish: Dish) => {
    const message = `Hello Judith Amazing Kitchen, I'd like to order ${dish.dish_name}.\n\nPlease let me know about availability and delivery to my location via Umunna Concierge.`;
    const whatsappLink = `https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  const quickOrderMessage = `Hello Judith Amazing Kitchen, I'd like to place a custom order via Umunna Concierge. Please send me your latest menu options.`;

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Umunna Concierge Dining</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-none">
            Food & Catering
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Exquisite private dining and everyday meals curated for Umunna guests. 
            Freshly prepared by Judith Amazing Kitchen.
          </p>
        </div>

        {/* Vendor Profile Card */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C46210]/5 rounded-bl-[200px]" />
          <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex w-20 h-20 bg-[#C46210] rounded-3xl items-center justify-center text-white shadow-2xl mb-8">
                <Utensils size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">{mainVendor.name}</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-xl">
                {mainVendor.description} Authentic local delicacies delivered to your stay across Asaba, Benin, and Awka.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={20} className="text-[#C46210]" />
                  <span className="font-bold">Asaba • Benin • Awka</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={20} className="text-[#C46210]" />
                  <span className="font-bold">30-90 Mins Delivery</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <a 
                href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent(quickOrderMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl"
              >
                <MessageCircle size={24} />
                Chat Concierge
              </a>
              <a 
                href={mainVendor.menu_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-lg border border-gray-200 hover:border-[#C46210] transition-all shadow-sm"
              >
                <ExternalLink size={24} />
                Full Price List
              </a>
            </div>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="sticky top-20 z-30 bg-gray-50/95 backdrop-blur-md py-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C46210] transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search dishes..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#C46210]/5 focus:border-[#C46210] shadow-sm font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 overflow-x-auto w-full hide-scrollbar pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    activeCategory === cat 
                    ? 'bg-[#C46210] text-white border-[#C46210] shadow-xl' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="space-y-24">
          {(Object.entries(groupedMenu) as [string, Dish[]][]).map(([category, dishes]) => (
            <div key={category} className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-0.5 w-12 bg-[#C46210]" />
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {category}
                </h3>
                <div className="h-0.5 flex-grow bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dishes.map((dish) => (
                  <div key={dish.dish_id} className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img 
                        src={dish.image_url} 
                        alt={dish.dish_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-white/20">
                        <span className="text-sm font-black text-gray-900">
                          {appData.meta.currency_symbol}{dish.price_ngn.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <h4 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#C46210] transition-colors line-clamp-1">
                        {dish.dish_name}
                      </h4>
                      <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">
                        {dish.description}
                      </p>
                      
                      <div className="mt-auto">
                        <button 
                          onClick={() => handleOrder(dish)}
                          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#C46210] transition-all active:scale-95 shadow-lg group-hover:translate-y-[-4px]"
                        >
                          Order Now <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bespoke Order Section */}
        <div className="mt-32 bg-gray-900 rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 adinkra-pattern pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8">Craving something else?</h2>
            <p className="text-gray-400 text-lg mb-12 leading-relaxed">
              Our chefs specialize in native soups, intercontinental dishes, and multi-course feasts for events. 
              Talk to the concierge for custom catering.
            </p>
            <a 
              href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent("Hello Umunna Concierge, I have a custom catering request for my stay.")}`}
              className="inline-flex items-center gap-3 bg-[#C46210] text-white px-12 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl"
            >
              Request Custom Catering
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Food;