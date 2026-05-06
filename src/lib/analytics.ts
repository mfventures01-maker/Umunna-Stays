
// Basic analytics utility for local logging and optional Supabase integration

// Define event types
export type EventName =
    | 'carousel_slide_click'
    | 'lead_popup_opened'
    | 'lead_popup_submitted'
    | 'whatsapp_chat_started'
    | 'page_view';

interface AnalyticsEvent {
    id: string;
    name: EventName;
    payload?: any;
    path: string;
    created_at: string;
    session_id: string;
}

// Get or create session ID
const getSessionId = () => {
    let sid = sessionStorage.getItem('umunna_analytics_sid');
    if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem('umunna_analytics_sid', sid);
    }
    return sid;
};

// Supabase config (optional)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ring buffer for local storage
const MAX_LOCAL_EVENTS = 200;

export const trackEvent = async (name: EventName, payload?: any) => {
    const event: AnalyticsEvent = {
        id: crypto.randomUUID(),
        name,
        payload,
        path: window.location.pathname || window.location.hash,
        created_at: new Date().toISOString(),
        session_id: getSessionId(),
    };

    // 1. Log to console in dev
    if (import.meta.env.DEV) {
        console.log('[Analytics]', name, payload);
    }

    // 2. Store in local storage (audit trail)
    try {
        const history = JSON.parse(localStorage.getItem('umunna_analytics_history') || '[]');
        history.unshift(event);
        if (history.length > MAX_LOCAL_EVENTS) {
            history.length = MAX_LOCAL_EVENTS;
        }
        localStorage.setItem('umunna_analytics_history', JSON.stringify(history));
    } catch (e) {
        console.warn('Analytics local storage failed', e);
    }

    // 3. Send to Supabase if configured
    if (SUPABASE_URL && SUPABASE_KEY) {
        try {
            fetch(`${SUPABASE_URL}/rest/v1/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ApiKey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    name: event.name,
                    payload: event.payload,
                    session_id: event.session_id,
                    path: event.path
                })
            }).catch(err => {
                // Silent fail for analytics
                if (import.meta.env.DEV) console.warn('Supabase analytics failed', err);
            });
        } catch (e) {
            // Fallback
        }
    }
};
