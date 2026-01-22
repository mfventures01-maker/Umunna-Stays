
import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../lib/analytics';

const LeadCapturePopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const popupRef = React.useRef<HTMLDivElement>(null);
    const hasTrackedOpen = React.useRef(false);

    useEffect(() => {
        // Check if we've already shown this in the session
        const hasShown = sessionStorage.getItem('umunna_lead_popup_seen');
        if (hasShown) return;

        const timer = setTimeout(() => {
            setIsVisible(true);
            sessionStorage.setItem('umunna_lead_popup_seen', '1');
            if (!hasTrackedOpen.current) {
                trackEvent('lead_popup_opened');
                hasTrackedOpen.current = true;
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Close on click outside
    useEffect(() => {
        if (!isVisible) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                handleDismiss();
            }
        };

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleDismiss();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic normalization: remove spaces, dashes
        const rawPhone = phone.replace(/\D/g, '');

        if (rawPhone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }

        // Create standard International format if possible (assume NG if starts with 0)
        const formattedPhone = rawPhone.startsWith('0') ? '234' + rawPhone.substring(1) : rawPhone;

        trackEvent('lead_popup_submitted', { hasName: !!name });
        trackEvent('whatsapp_chat_started', { source: 'popup' });

        // Construct WhatsApp message
        const message = `Hello Umunna Stays, I need help booking. My name is ${name || 'Guest'} and my phone number is ${phone}.`;
        // Use the specific provided number
        const whatsappUrl = `https://wa.me/2347048033575?text=${encodeURIComponent(message)}`;

        // Redirect
        window.open(whatsappUrl, '_blank');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={popupRef}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 w-[90vw] md:w-[380px] bg-white rounded-2xl shadow-2xl p-6 border border-gray-100"
                    role="dialog"
                    aria-modal="false"
                    aria-label="Lead Capture"
                >
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#E8F5E9] p-2 rounded-full">
                            <MessageCircle className="text-[#25D366]" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">Need help booking?</h3>
                            <p className="text-xs text-gray-500">Fastest response via WhatsApp</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <input
                                type="text"
                                placeholder="Name (Optional)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C46210]/20 focus:border-[#C46210] transition-all text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="tel"
                                required
                                placeholder="Phone Number (Required)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoFocus
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C46210]/20 focus:border-[#C46210] transition-all text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                        >
                            Start Chat <MessageCircle size={18} />
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LeadCapturePopup;
