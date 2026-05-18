import React from 'react';
import { IntentState } from '../../hooks/useIntent';

interface AdaptiveUIProps {
    intent: IntentState;
    propertyName: string;
    onBook: () => void;
}

export const AdaptiveConversionBlock: React.FC<AdaptiveUIProps> = ({ intent, propertyName, onBook }) => {
    // 1. Browsing State (Storytelling)
    if (intent === 'browsing') {
        return (
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm animate-fade-in">
                <h3 className="text-xl font-black mb-4">Arrive. Exhale. No Stories.</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                    Experience ${propertyName} with 24/7 guaranteed power and Starlink internet. 
                    Perfect for your next stay in Nigeria.
                </p>
                <button 
                    onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                    className="w-full bg-gray-100 text-gray-900 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                    Explore Experience
                </button>
            </div>
        );
    }

    // 2. Comparing State (Value/Benefits)
    if (intent === 'comparing') {
        return (
            <div className="bg-black text-white p-8 rounded-[32px] shadow-2xl animate-scale-up">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black">Why guests choose us</h3>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Premium Choice</span>
                </div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        24/7 Power (No Generator Stories)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Armed Security Escort Available
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Starlink High-Speed Internet
                    </li>
                </ul>
                <button 
                    onClick={onBook}
                    className="w-full bg-white text-black py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                    Check Availability
                </button>
            </div>
        );
    }

    // 3. Ready to Book / High Intent (Urgency)
    return (
        <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 shadow-xl animate-pulse-subtle">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-red-600 text-[10px] font-black uppercase tracking-widest">High Demand - Likely to sell out</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Secure ${propertyName}</h3>
            <p className="text-gray-600 text-sm mb-6">Only 1 slot remaining for your selected dates.</p>
            
            <div className="space-y-3">
                <button 
                    onClick={onBook}
                    className="w-full bg-red-600 text-white py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                >
                    Reserve Now
                </button>
                <a 
                    href={`https://wa.me/2347048033575?text=I'm ready to book ${propertyName} now!`}
                    target="_blank"
                    className="flex justify-center items-center gap-2 w-full border-2 border-red-200 text-red-600 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                >
                    Book via WhatsApp
                </a>
            </div>
        </div>
    );
};
