import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export type IntentState = 'browsing' | 'comparing' | 'ready_to_book' | 'high_intent';

export const useIntent = (propertyId?: string) => {
    const [intent, setIntent] = useState<IntentState>('browsing');
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('umunna_session_id'));

    // 1. Session Initialization (Deterministic)
    useEffect(() => {
        const initSession = async () => {
            if (!sessionId) {
                const { data, error } = await supabase
                    .from('user_sessions')
                    .insert([{ fingerprint: navigator.userAgent }])
                    .select()
                    .single();
                
                if (data) {
                    setSessionId(data.id);
                    localStorage.setItem('umunna_session_id', data.id);
                }
            } else {
                // Sync current intent from backend
                const { data } = await supabase
                    .from('user_sessions')
                    .select('intent_state')
                    .eq('id', sessionId)
                    .single();
                if (data) setIntent(data.intent_state as IntentState);
            }
        };
        initSession();
    }, []);

    // 2. Behavioral Tracking (Signals)
    const trackEvent = useCallback(async (eventType: string, metadata: any = {}) => {
        if (!sessionId) return;

        const { data: newState } = await supabase.rpc('track_intent_event', {
            p_session_id: sessionId,
            p_event_type: eventType,
            p_property_id: propertyId || 'global',
            p_metadata: metadata
        });

        if (newState) setIntent(newState as IntentState);
    }, [sessionId, propertyId]);

    // 3. Automatic Dwell Time Tracking
    useEffect(() => {
        const timer = setTimeout(() => {
            trackEvent('dwell_time_30s', { duration: 30 });
        }, 30000);
        return () => clearTimeout(timer);
    }, [trackEvent]);

    return { intent, sessionId, trackEvent };
};
