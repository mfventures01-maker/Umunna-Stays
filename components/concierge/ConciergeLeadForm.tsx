import React, { useState } from 'react';
import { MessageCircle, Calendar, User, Wallet, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../src/lib/supabaseClient';
import { useAuth } from '../../src/contexts/AuthContext';

interface ConciergeLeadFormProps {
  propertyId?: string;
  propertyName?: string;
  initialCity?: string;
  className?: string;
}

interface FormData {
  full_name: string;
  phone: string;
  city: string;
  check_in: string;
  check_out: string;
  guests: number;
  budget_per_night: string;
}

const ConciergeLeadForm: React.FC<ConciergeLeadFormProps> = ({
  propertyId,
  propertyName,
  initialCity = 'Asaba',
  className = ''
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    city: initialCity,
    check_in: '',
    check_out: '',
    guests: 1,
    budget_per_night: '₦80k–₦150k'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number required (10+ digits)';
    if (!formData.check_in) newErrors.check_in = 'Check-in date required';
    if (!formData.check_out) newErrors.check_out = 'Check-out date required';

    if (formData.check_in && formData.check_out) {
      if (new Date(formData.check_in) >= new Date(formData.check_out)) {
        newErrors.check_out = 'Check-out must be after check-in';
      }
    }

    if (formData.guests < 1 || formData.guests > 30) newErrors.guests = 'Guests must be between 1 and 30';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getWhatsAppUrl = () => {
    let message = "Hi Umunna Concierge, I want to book a stay.\n\n";
    message += `Name: ${formData.full_name}\n`;
    message += `WhatsApp: ${formData.phone}\n`;
    message += `City: ${formData.city}\n`;
    message += `Check-in: ${formData.check_in}\n`;
    message += `Check-out: ${formData.check_out}\n`;
    message += `Guests: ${formData.guests}\n`;
    message += `Budget/Night: ${formData.budget_per_night}\n`;

    if (propertyName && propertyId) {
      message += `\nProperty Interested In: ${propertyName} (${propertyId})\n`;
    }

    message += "\nPlease share the best available options + total price.";
    return `https://wa.me/2347048033575?text=${encodeURIComponent(message)}`;
  };

  const saveToLocalStorage = () => {
    // Fallback to local storage (keep legacy behavior as backup)
    const existingLeads = JSON.parse(localStorage.getItem('umunna_leads') || '[]');
    const newLead = {
      ...formData,
      property_id: propertyId,
      created_at: new Date().toISOString()
    };
    existingLeads.push(newLead);
    localStorage.setItem('umunna_leads', JSON.stringify(existingLeads));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Prepare Lead Data
    const leadData = {
      user_id: user?.id || null,
      full_name: formData.full_name,
      phone: formData.phone,
      city: formData.city,
      service_type: 'stay',
      status: 'new',
      details: {
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: formData.guests,
        budget_per_night: formData.budget_per_night,
        property_id: propertyId || null,
        property_name: propertyName || null
      }
    };

    try {
      const { error } = await supabase.from('leads').insert(leadData);

      if (error) throw error;

      // Success: Redirect to WhatsApp
      window.open(getWhatsAppUrl(), '_blank');

    } catch (err) {
      console.error('Failed to save lead to Supabase:', err);
      setSubmitError("Could not save request automatically. Please try again or open WhatsApp directly.");
      saveToLocalStorage(); // Fallback save
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-gray-900 mb-2">Concierge Booking</h3>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Premium Service • 24/7 Support</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Name & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.full_name ? 'border-red-500' : 'border-gray-100'}`}
              />
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.full_name && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Phone (WhatsApp)</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.phone ? 'border-red-500' : 'border-gray-100'}`}
              />
              <MessageCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Row 2: City & Guests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">City</label>
            <div className="relative">
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pl-10 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-[#C46210]"
              >
                {['Asaba', 'Benin', 'Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Other'].map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Guests</label>
            <div className="relative">
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min={1}
                max={30}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.guests ? 'border-red-500' : 'border-gray-100'}`}
              />
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.guests && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.guests}</p>}
          </div>
        </div>

        {/* Row 3: Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Check-in</label>
            <div className="relative">
              <input
                type="date"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.check_in ? 'border-red-500' : 'border-gray-100'}`}
              />
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.check_in && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.check_in}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Check-out</label>
            <div className="relative">
              <input
                type="date"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                min={formData.check_in || new Date().toISOString().split('T')[0]}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all ${errors.check_out ? 'border-red-500' : 'border-gray-100'}`}
              />
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.check_out && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.check_out}</p>}
          </div>
        </div>

        {/* Row 4: Budget */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Budget Per Night</label>
          <div className="relative">
            <select
              name="budget_per_night"
              value={formData.budget_per_night}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pl-10 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-[#C46210]"
            >
              {['<₦80k', '₦80k–₦150k', '₦150k–₦300k', '300k+'].map(budget => (
                <option key={budget} value={budget}>{budget}</option>
              ))}
            </select>
            <Wallet size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p className="text-red-600 text-xs font-bold leading-relaxed">{submitError}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C46210] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-100 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><MessageCircle size={18} /> Check Availability</>}
          </button>

          {submitError && (
            <button
              type="button"
              onClick={() => window.open(getWhatsAppUrl(), '_blank')}
              className="w-full bg-white text-gray-600 border border-gray-200 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              Open WhatsApp Anyway
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConciergeLeadForm;
