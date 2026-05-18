
import React, { useState } from 'react';
import { AppData } from '../types';
import { Home, Shield, DollarSign, MessageCircle, ArrowRight } from 'lucide-react';

interface HostProps {
  appData: AppData;
}

const Host: React.FC<HostProps> = ({ appData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    propertyName: '',
    city: '',
    bedrooms: '',
    rate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hello ${appData.meta.brand_name}! I want to host my property.\n\nHost: ${formData.name}\nPhone: ${formData.phone}\nProperty: ${formData.propertyName}\nLocation: ${formData.city}\nBedrooms: ${formData.bedrooms}\nExpected Rate: ${appData.meta.currency_symbol}${formData.rate}\n\nI'm ready for a media audit.`;
    window.open(`https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4 block">Partner with Excellence</span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">Unlock the Revenue <br/> of your <span className="text-[#C46210]">Premium Property</span></h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">{appData.meta.brand_name} isn't just a listing site; it's a closed-loop hospitality marketplace. We filter for quality so you earn premium returns with zero management fatigue.</p>
            
            <div className="space-y-8">
              {[
                { icon: <DollarSign className="text-[#C46210]" />, title: 'Premium Occupancy', desc: 'Target high-intent guests willing to pay for exclusivity.' },
                { icon: <Shield className="text-[#C46210]" />, title: 'Rigorous Vetting', desc: 'Every guest is personally screened by our concierge team.' },
                { icon: <Home className="text-[#C46210]" />, title: 'Property Audit', desc: 'Professional photography and maintenance support included.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-5">
                  <div className="shrink-0 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 md:p-14 rounded-[48px] border border-gray-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
            <h3 className="text-2xl font-bold mb-8">Property Intake</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-medium" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp #</label>
                  <input 
                    type="tel" required
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-medium" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Property Name</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-medium" 
                  value={formData.propertyName}
                  onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City/State</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-medium" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bedrooms</label>
                  <input 
                    type="number" required
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-medium" 
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-[#C46210] transition-all shadow-xl"
              >
                Submit for Onboarding
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Host;
