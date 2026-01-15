
import React, { useState } from 'react';
import { AppData, TransportVendor, TransportService, TransportVehicle } from '../types';
import { buildTransportWhatsAppLink } from '../dataStore';
import { X, Send, MapPin, Calendar, Clock, Users } from 'lucide-react';

interface TransportLeadFormProps {
  appData: AppData;
  vendor: TransportVendor;
  service: TransportService | null;
  selectedVehicle?: TransportVehicle | null;
  initialNotes?: string;
  onClose: () => void;
}

const TransportLeadForm: React.FC<TransportLeadFormProps> = ({ 
  appData, 
  vendor, 
  service, 
  selectedVehicle, 
  initialNotes = '',
  onClose 
}) => {
  const [form, setForm] = useState({
    guest_name: '',
    guest_phone: '',
    city: vendor.coverage_cities[0] || 'Asaba',
    property_id: '',
    pickup_location: '',
    dropoff_location: '',
    date_needed: '',
    time_needed: '',
    passengers: '',
    notes: initialNotes || (selectedVehicle ? `Interested in: ${selectedVehicle.make_model} (${selectedVehicle.category})` : '')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const waUrl = buildTransportWhatsAppLink({
      vendorWhatsapp: vendor.whatsapp_number,
      fallbackWhatsapp: appData.meta.whatsapp_main_number,
      template: vendor.whatsapp_prefill,
      formValues: {
        ...form,
        service_type: service?.service_title || 'General Transport Inquiry'
      }
    });

    // Save lead locally
    const existingLeads = JSON.parse(localStorage.getItem('umunna_transport_leads') || '[]');
    const newLead = {
      ...form,
      lead_id: `TL_${Date.now()}`,
      created_at: new Date().toISOString(),
      service_id: service.service_id,
      vendor_id: vendor.vendor_id,
      whatsapp_click_url: waUrl,
      status: 'new'
    };
    localStorage.setItem('umunna_transport_leads', JSON.stringify([...existingLeads, newLead]));

    // Open WhatsApp
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Request Quote</h2>
              <p className="text-sm text-gray-500 font-medium">Service: <span className="text-[#C46210]">{service.service_title}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 hide-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                <input required type="text" className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold" 
                  value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">WhatsApp #</label>
                <input required type="tel" className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold" 
                  value={form.guest_phone} onChange={e => setForm({...form, guest_phone: e.target.value})} placeholder="+234..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input required type="text" className="w-full pl-12 pr-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold" 
                    value={form.pickup_location} onChange={e => setForm({...form, pickup_location: e.target.value})} placeholder="Airport, Address..." />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">City</label>
                <select className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold appearance-none"
                  value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                  {vendor.coverage_cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Date Needed</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input required type="date" className="w-full pl-12 pr-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold" 
                    value={form.date_needed} onChange={e => setForm({...form, date_needed: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input type="time" className="w-full pl-12 pr-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold" 
                    value={form.time_needed} onChange={e => setForm({...form, time_needed: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Additional Notes</label>
              <textarea rows={3} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold resize-none" 
                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Special requests, flight number, drop-off location..." />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-3 bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-[#C46210] transition-all shadow-xl active:scale-95">
              Confirm & Book via WhatsApp
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransportLeadForm;
