import React from 'react';
import { TransportVehicle, AppData, TransportVendor } from '../types';
import { Users, CheckCircle2, MessageCircle, Star } from 'lucide-react';
import VehicleImageGallery from './VehicleImageGallery';
import { 
  extractVehiclePrice, 
  splitVehicleImages, 
  parsePipes, 
  buildVehicleWhatsAppUrl,
  getTransportVendors
} from '../dataStore';

interface VehicleFleetProps {
  appData: AppData;
}

const VehicleFleet: React.FC<VehicleFleetProps> = ({ appData }) => {
  const vehicles = appData.transport_vehicles || [];
  const vendors = getTransportVendors(appData);

  const getVendorForVehicle = (vendorId: string): TransportVendor | undefined => {
    return vendors.find(v => v.vendor_id === vendorId);
  };

  return (
    <div className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-1.5 bg-[#C46210] rounded-full" />
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Our Premium <span className="text-[#C46210]">Fleet</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((vehicle) => {
          const images = splitVehicleImages(vehicle.image_url);
          const features = parsePipes(vehicle.features);
          const isPremium = vehicle.category.toLowerCase() === 'private jet';
          const vendor = getVendorForVehicle(vehicle.vendor_id);
          const whatsappUrl = vendor 
            ? buildVehicleWhatsAppUrl(vendor, vehicle, appData.meta.default_city)
            : '#';

          return (
            <div 
              key={vehicle.vehicle_id}
              className={`group bg-white rounded-[32px] overflow-hidden border transition-all duration-500 hover:shadow-2xl ${
                isPremium ? 'border-yellow-400 shadow-yellow-100/50' : 'border-gray-100'
              }`}
            >
              {/* Vehicle Image Section - 60% height approx */}
              <div className="relative h-64 overflow-hidden">
                <VehicleImageGallery images={images} alt={vehicle.make_model} />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                    isPremium 
                      ? 'bg-yellow-400 text-black' 
                      : 'bg-white/90 text-gray-900'
                  }`}>
                    {vehicle.category}
                  </span>
                </div>

                {/* Availability Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {vehicle.is_available === 'Yes' ? (
                    <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      Available Now
                    </span>
                  ) : (
                    <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      Check Availability
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicle Info Section */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-[#C46210] transition-colors">
                      {vehicle.make_model}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                      <Users size={14} />
                      <span className="text-xs font-bold uppercase tracking-tighter">Up to {vehicle.seats} Passengers</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting at</span>
                    <span className="text-lg font-black text-[#C46210]">
                      {extractVehiclePrice(vehicle.daily_rate_ngn)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      <CheckCircle2 size={12} className="text-[#C46210]" />
                      <span className="text-[10px] font-bold text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Booking Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all ${
                    isPremium
                      ? 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shadow-yellow-100'
                      : 'bg-gray-900 text-white hover:bg-[#C46210] shadow-lg'
                  }`}
                >
                  <MessageCircle size={20} />
                  {isPremium ? 'Request Jet Itinerary' : 'Book This Vehicle'}
                </a>
              </div>

              {isPremium && (
                <div className="px-6 pb-4 flex items-center gap-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600">Premium Concierge Highlight</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleFleet;
