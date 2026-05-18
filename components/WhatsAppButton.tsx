import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { loadAppData } from '../dataStore';

const WhatsAppButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("17048033575");

  useEffect(() => {
    const fetchMeta = async () => {
      const data = await loadAppData();
      if (data?.meta?.whatsapp_main_number) {
        setWhatsappNumber(data.meta.whatsapp_main_number);
      }
    };
    fetchMeta();
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello%20Umunna%20Stays,%20I'm%20interested%20in%20a%20luxury%20stay.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-semibold">Chat Concierge</span>
      <div className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </div>
    </a>
  );
};

export default WhatsAppButton;