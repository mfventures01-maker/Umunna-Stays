import React, { useState, useMemo } from 'react';
import { Property, AppData } from '../types';
import { Calendar, MessageCircle, Info, ArrowRight } from 'lucide-react';
import ConciergeLeadForm from './concierge/ConciergeLeadForm';

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

      <ConciergeLeadForm
        propertyId={property.property_id}
        propertyName={property.name}
        initialCity={property.city}
        className="!shadow-none !border-none !p-0"
      />

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