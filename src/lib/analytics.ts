/**
 * analytics.ts — Centralized Analytics Infrastructure
 *
 * Implements route-aware, SPA-compatible event tracking for GA4 and Meta Pixel.
 * All tracking calls must route through here to ensure deduplication and safety.
 */

// Global declarations for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/** Check if analytics are loaded (prevents crashes during hydration or blocked requests) */
const isAnalyticsReady = () => typeof window !== 'undefined' && window.gtag && window.fbq;

/**
 * Standard Events
 */
export const Analytics = {
  /** Track a page view (route change) */
  pageView: (path: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'page_view', { page_path: path });
    window.fbq('track', 'PageView');
  },

  /** Track when a user initiates a booking flow */
  bookingStart: (propertyName: string, value: number) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'booking_start', {
      item_name: propertyName,
      value: value,
      currency: 'NGN',
    });
    window.fbq('track', 'InitiateCheckout', {
      content_name: propertyName,
      value: value,
      currency: 'NGN',
    });
  },

  /** Track a completed booking */
  bookingComplete: (propertyName: string, value: number, transactionId: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'booking_complete', {
      transaction_id: transactionId,
      item_name: propertyName,
      value: value,
      currency: 'NGN',
    });
    window.fbq('track', 'Purchase', {
      content_name: propertyName,
      value: value,
      currency: 'NGN',
    });
  },

  /** Track when a property/room is viewed */
  roomView: (propertyName: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'room_view', { item_name: propertyName });
    window.fbq('track', 'ViewContent', { content_name: propertyName });
  },

  /** Track general call-to-action clicks */
  ctaClick: (buttonName: string, destinationUrl: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'CTA_click', {
      button_name: buttonName,
      destination: destinationUrl,
    });
  },

  /** Track clicks on WhatsApp links (high intent) */
  whatsappClick: (context: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'WhatsApp_click', { context });
    window.fbq('trackCustom', 'WhatsAppClick', { context });
  },

  /** Track form submissions */
  reservationSubmit: (formType: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'reservation_submit', { form_type: formType });
    window.fbq('track', 'CompleteRegistration', { content_name: formType });
  },

  /** Track user scrolling past a certain point */
  scrollDepth: (depthPercent: number) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'scroll_depth', { percent: depthPercent });
  },

  /** Track contact initiations */
  contact: (method: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'contact_initiation', { method });
    window.fbq('track', 'Contact', { method });
  },

  /** Track a lead generated (e.g., from Concierge or Transport) */
  lead: (serviceType: string) => {
    if (!isAnalyticsReady()) return;
    window.gtag('event', 'generate_lead', { service_type: serviceType });
    window.fbq('track', 'Lead', { content_category: serviceType });
  },
};

/** Compatibility helper for older tracking calls */
export const trackEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};
