
import React, { useState } from 'react';
import { X, Send, MapPin, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { AppData, TransportService, TransportVendor, TransportVehicle } from '../types';
import { buildTransportWhatsAppClickUrl } from '../dataStore';
import { supabase } from '../src/lib/supabaseClient';
import { useAuth } from '../src/contexts/AuthContext';

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
  const { user } = useAuth();
  const [form, setForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    city: vendor?.coverage_cities?.[0] || 'Asaba',
    property_id: '',
    pickup_location: '',
    dropoff_location: '',
    date_needed: '',
    time_needed: '',
    passengers: '',
    budget_ngn: '',
    notes: initialNotes || (selectedVehicle ? `Interested in: ${selectedVehicle.make_model} (${selectedVehicle.category})` : '')
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // 1. Prepare WhatsApp Prefill
    let prefillText = vendor?.whatsapp_prefill || "Hello Umunna Stays, I need transport service: [service_type] in [city] on [date]. Pickup: [pickup_location].";
    prefillText = prefillText
      .replace('[service_type]', service?.service_title || 'Transport')
      .replace('[city]', form.city)
      .replace('[date]', form.date_needed)
      .replace('[pickup_location]', form.pickup_location);

    if (form.passengers) prefillText += ` Passengers: ${form.passengers}.`;
    if (form.notes) prefillText += ` Notes: ${form.notes}.`;

    const whatsappUrl = buildTransportWhatsAppClickUrl(vendor?.whatsapp_number || appData.meta.whatsapp_main_number, prefillText);

    // 2. Prepare Supabase Payload
    const leadPayload = {
      user_id: user?.id || null,
      full_name: form.guest_name,
      phone: form.guest_phone,
      city: form.city,
      service_type: 'TRANSPORT', // Consistent with user request
      status: 'new',
      details: {
        guest_email: form.guest_email,
        pickup_location: form.pickup_location,
        dropoff_location: form.dropoff_location,
        date_needed: form.date_needed,
        time_needed: form.time_needed,
        passengers: form.passengers,
        budget_ngn: form.budget_ngn,
        notes: form.notes,
        vehicle_id: selectedVehicle?.vehicle_id || null,
        vehicle_name: selectedVehicle?.make_model || null,
        vehicle_type: selectedVehicle?.vehicle_type || null,
        vendor_id: vendor.vendor_id,
        service_id: service?.service_id || null,
        whatsapp_click_url: whatsappUrl
      }
    };

    try {
      // 3. Insert into Supabase
      const { error } = await supabase.from('leads').insert(leadPayload);

      if (error) {
        throw error;
      }

      // 4. Success: Open WhatsApp & Close
      window.open(whatsappUrl, '_blank');
      onClose();

    } catch (err) {
      console.error('Failed to save transport lead:', err);

      // Fallback: Save to Local Storage
      try {
        const existingLeads = JSON.parse(localStorage.getItem('umunna_transport_leads') || '[]');
        existingLeads.push({
          ...leadPayload,
          id: `LOCAL_${Date.now()}`,
          created_at: new Date().toISOString(),
          is_synced: false // Flag for future sync
        });
        localStorage.setItem('umunna_transport_leads', JSON.stringify(existingLeads));
        console.log('⚠️ Lead saved to LocalStorage fallback');
      } catch (lsError) {
        console.error('LocalStorage fallback failed', lsError);
      }

      // 5. Fallback: Show error and allow manual open
      setSubmitError("Could not connect to server. Please click below to open WhatsApp manually.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualOpen = () => {
    let prefillText = vendor?.whatsapp_prefill || "Hello...";
    // Re-construct basic logic or just save state? 
    // Simpler to just re-use URL logic.
    // Instead of duplicating, we can store url in state or generic fallback.
    // For simplicity, re-run builder:
    const whatsappUrl = buildTransportWhatsAppClickUrl(vendor?.whatsapp_number || appData.meta.whatsapp_main_number, "Hello, I am trying to book transport but the form failed. Please assist.");
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Request Quote</h2>
              <p className="text-sm text-gray-500 font-medium">Service: <span className="text-[#C46210]">{service?.service_title || 'Private Transport'}</span></p>
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
                  value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">WhatsApp #</label>
                <input required type="tel" className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold"
                  value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} placeholder="+234..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input required type="text" className="w-full pl-12 pr-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold"
                    value={form.pickup_location} onChange={e => setForm({ ...form, pickup_location: e.target.value })} placeholder="Airport, Address..." />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">City</label>
                <select className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold appearance-none"
                  value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                  {vendor?.coverage_cities?.map(c => <option key={c} value={c}>{c}</option>) || <option>Asaba</option>}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Date Needed</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input required type="date" className="w-full pl-12 pr-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold"
                    value={form.date_needed} onChange={e => setForm({ ...form, date_needed: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input type="time" className="w-full pl-12 pr-5 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold"
                    value={form.time_needed} onChange={e => setForm({ ...form, time_needed: e.target.value })} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Additional Notes</label>
              <textarea rows={3} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C46210]/20 outline-none text-sm font-bold resize-none"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Special requests, flight number, drop-off location..." />
            </div>

            {submitError && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div className="flex-grow">
                  <p className="text-red-600 text-xs font-bold mb-2">{submitError}</p>
                  <button
                    type="button"
                    onClick={handleManualOpen}
                    className="text-[#C46210] underline text-xs font-black uppercase tracking-widest hover:text-black"
                  >
                    Open WhatsApp Anyway
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-[#C46210] transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Starting Request...
                </>
              ) : (
                <>
                  Confirm & Book via WhatsApp
                  <Send size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransportLeadForm;
