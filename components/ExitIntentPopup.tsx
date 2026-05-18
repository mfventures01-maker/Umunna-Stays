import React, { useState, useEffect } from 'react';

const ExitIntentPopup: React.FC = () => {
    const [show, setShow] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        // Only set event listener on desktop
        if (window.innerWidth < 768) return;

        const handleMouseLeave = (e: MouseEvent) => {
            // If mouse leaves the top of the window
            if (e.clientY <= 0 && !hasShown) {
                setShow(true);
                setHasShown(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [hasShown]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="h-48 bg-charcoal relative">
                    <img
                        src="https://images.unsplash.com/photo-1542314831-c6a4d1409c95?q=80&w=1000&auto=format&fit=crop"
                        alt="Asaba Executive Travel Guide PDF"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                        <h3 className="text-3xl font-bold text-white">Wait! Before You Leave...</h3>
                    </div>
                    <button
                        onClick={() => setShow(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Get the Free Asaba Executive Travel Guide PDF</h4>
                    <p className="text-gray-600 mb-6">
                        Insights on security, premium hangouts, and executive logistics. The ultimate playbook for diaspora and business travelers.
                    </p>

                    <form className="flex flex-col gap-3" onSubmit={(e) => {
                        e.preventDefault();
                        setShow(false);
                        // In a real app, send to API
                        alert('Guide sent to your email!');
                    }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand w-full"
                        />
                        <button
                            type="submit"
                            className="bg-brand text-white font-bold py-3 px-4 rounded-lg hover:bg-[#A3520D] transition-colors"
                        >
                            Send Me The Free Guide
                        </button>
                    </form>
                    <button
                        onClick={() => setShow(false)}
                        className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        No thanks, I'll pay full price later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExitIntentPopup;
