import React, { useState, useMemo } from 'react';
import { Property, AppData } from '../types';
import { Calendar, MessageCircle, Info, ArrowRight } from 'lucide-react';

interface BookingWidgetProps {
  property: Property;
  appData: AppData;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ property, appData }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const bookingSummary = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffNights <= 0) return { error: 'Check-out must be after Check-in' };
    
    const minStay = property.booking.minimum_stay || 1;
    if (diffNights < minStay) {
      return { error: `Minimum stay is ${minStay} ${minStay === 1 ? 'night' : 'nights'}` };
    }

    const total = diffNights * property.nightly_rate;
    return {
      nights: diffNights,
      total,
      isValid: true
    };
  }, [checkIn, checkOut, property]);

  const generateWhatsAppUrl = () => {
    const base = `https://wa.me/${property.host.host_whatsapp || appData.meta.whatsapp_main_number}`;
    let message = property.booking.whatsapp_prefill;
    
    if (bookingSummary && 'isValid' in bookingSummary) {
      message = `Hello Umunna Stays! I'd like to book ${property.name} in ${property.city}.\n\n` +
                `📅 Check-in: ${checkIn}\n` +
                `📅 Check-out: ${checkOut}\n` +
                `🌙 Nights: ${bookingSummary.nights}\n` +
                `💰 Total: ${appData.meta.currency_symbol}${bookingSummary.total.toLocaleString()}\n\n` +
                `Is this available?`;
    }
    
    return `${base}?text=${encodeURIComponent(message)}`;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-2xl sticky top-32">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-1">Nightly From</span>
          <span className="text-3xl font-black text-[#C46210]">{appData.meta.currency_symbol}{property.nightly_rate.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 p-2 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex flex-col p-2">
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 ml-1">Check-in</label>
          <input 
            type="date" 
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-900"
          />
        </div>
        <div className="flex flex-col p-2 border-l border-gray-200">
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 ml-1">Check-out</label>
          <input 
            type="date" 
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-900"
          />
        </div>
      </div>

      {bookingSummary && 'error' in bookingSummary && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider animate-pulse">
          <Info size={14} />
          {bookingSummary.error}
        </div>
      )}

      {bookingSummary && 'isValid' in bookingSummary && (
        <div className="mb-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium underline decoration-gray-200">
              {appData.meta.currency_symbol}{property.nightly_rate.toLocaleString()} x {bookingSummary.nights} nights
            </span>
            <span className="font-bold text-gray-900">
              {appData.meta.currency_symbol}{bookingSummary.total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Concierge Service Fee</span>
            <span className="text-green-600 font-bold uppercase text-[10px]">Included</span>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="font-black text-gray-900 uppercase text-xs tracking-widest">Total</span>
            <span className="text-xl font-black text-gray-900">
              {appData.meta.currency_symbol}{bookingSummary.total.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <a 
          href={generateWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all shadow-xl ${
            bookingSummary && 'isValid' in bookingSummary 
            ? 'bg-[#25D366] text-white hover:bg-[#20bd5a] hover:scale-[1.02] active:scale-[0.98]' 
            : 'bg-gray-900 text-white hover:bg-black opacity-90'
          }`}
        >
          <MessageCircle size={24} />
          {bookingSummary && 'isValid' in bookingSummary ? 'Confirm on WhatsApp' : 'WhatsApp to Inquire'}
        </a>
        
        <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-[0.15em]">
          Zero booking fees for direct guests
        </p>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">
            {property.host.host_photo_url ? (
               <img src={property.host.host_photo_url} alt={property.host.host_name} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-[#C46210] font-black text-xl">
                 {property.host.host_name.charAt(0)}
               </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Hosted by</p>
            <p className="font-bold text-gray-900">{property.host.host_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;