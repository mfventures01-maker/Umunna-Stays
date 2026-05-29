/**
 * Meta Pixel Initialization (Governed Layer)
 * 
 * Safely initializes Meta Pixel tracking based on environment configuration.
 * Prevents "Invalid PixelID" errors by verifying presence before execution.
 */

export const initMetaPixel = () => {
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
    if (!PIXEL_ID) return;

    // 1. Validation Logic
    if (PIXEL_ID === 'YOUR_META_PIXEL_ID') {
        console.warn("Meta Pixel disabled: Missing or default Pixel ID detected.");
        return;
    }

    // 2. Script Injection (Deterministic)
    if (typeof window !== 'undefined' && !(window as any).fbq) {
        (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
            if (f.fbq) return;
            n = f.fbq = function() {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        (window as any).fbq('init', PIXEL_ID);
        (window as any).fbq('track', 'PageView');
        
        console.log("Meta Pixel initialized successfully.");
    }
};
