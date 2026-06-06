import React, { useState } from 'react';
import { Property, AppData } from '../../../types';
import { useIntent } from '../../hooks/useIntent';
import { AdaptiveConversionBlock } from './AdaptiveConversionBlock';
import { conversionService } from '../../services/conversionService';
import LazyLoader from '../../shared/loaders/LazyLoader';
import ConciergeLeadForm from './ConciergeLeadForm';
import { X } from 'lucide-react';

interface FunnelSidebarProps {
    property: Property;
    appData: AppData;
}

export const PropertyFunnelSidebar: React.FC<FunnelSidebarProps> = ({ property, appData }) => {
    const { intent, sessionId, trackEvent } = useIntent(property.property_id);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleStartBooking = async () => {
        setIsModalOpen(true);
        if (!sessionId) return;
        setIsBooking(true);
        trackEvent('booking_started', { property_id: property.property_id });

        try {
            const id = await conversionService.createBooking(sessionId, {
                property_id: property.property_id,
                check_in: new Date().toISOString().split('T')[0], // Default to today
                check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 day
                guest_info: {
                    name: "Prospective Guest",
                    phone: "",
                    email: ""
                }
            });
            setBookingId(id);
        } catch (error) {
            console.error("Booking Intent Failed:", error);
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="sticky top-32 space-y-6">
            {/* 1. Price Anchor (Authority) */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nightly Rate</span>
                        <span className="text-4xl font-black text-gray-900">
                            {appData.meta.currency_symbol}{property.nightly_rate.toLocaleString()}
                        </span>
                    </div>
                    {intent === 'high_intent' && (
                        <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                            Best Price Guaranteed
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Intent-Driven Adaptive Block */}
            <AdaptiveConversionBlock 
                intent={intent} 
                propertyName={property.name} 
                onBook={handleStartBooking} 
            />

            {/* 3. Scarcity & Proof (Conversion Accelerators) */}
            {(intent === 'ready_to_book' || intent === 'high_intent') && (
                <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex items-center gap-4 animate-bounce-subtle">
                    <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-600">
                        🔥
                    </div>
                    <div>
                        <p className="text-xs font-black text-orange-700 uppercase tracking-widest">High Demand</p>
                        <p className="text-[10px] text-orange-600 font-bold">5 people viewed this in the last hour</p>
                    </div>
                </div>
            )}

            {/* 4. Trust Reinforcement */}
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Secure Booking Guarantee</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-bold text-gray-700">Instant Confirmation</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-bold text-gray-700">Verified Professional Host</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-bold text-gray-700">24/7 Concierge Support</span>
                    </div>
                </div>
            </div>

            {isBooking && <LazyLoader label="Securing inventory..." />}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="relative bg-white rounded-3xl max-w-lg w-full p-2 border border-gray-100 shadow-2xl my-8">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <ConciergeLeadForm 
                            propertyId={property.property_id}
                            propertyName={property.name}
                            initialCity={property.city}
                            className="!shadow-none !border-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
