import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export type IntentState =
  | 'browsing'
  | 'comparing'
  | 'ready_to_book'
  | 'high_intent';

type SessionRow = {
  id: string;
  intent_state: IntentState;
};

export const useIntent = (propertyId?: string) => {
  const [intent, setIntent] = useState<IntentState>('browsing');
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('umunna_session_id')
  );

  /**
   * 1. SESSION INITIALIZATION
   * Creates or restores a session in Supabase
   */
  useEffect(() => {
    const initSession = async () => {
      try {
        // No session yet → create one
        if (!sessionId) {
          const { data, error } = await supabase
            .from('user_sessions')
            .insert([
              {
                fingerprint: navigator.userAgent,
                intent_state: 'browsing',
              },
            ])
            .select()
            .single();

          if (error) {
            console.error('Session creation failed:', error.message);
            return;
          }

          if (data) {
            setSessionId(data.id);
            localStorage.setItem('umunna_session_id', data.id);
            setIntent(data.intent_state);
          }

          return;
        }

        // Existing session → sync intent state
        const { data, error } = await supabase
          .from('user_sessions')
          .select('id, intent_state')
          .eq('id', sessionId)
          .single();

        if (error) {
          console.error('Session fetch failed:', error.message);
          return;
        }

        if (data) {
          setIntent(data.intent_state);
        }
      } catch (err) {
        console.error('initSession error:', err);
      }
    };

    initSession();
  }, [sessionId]);

  /**
   * 2. INTENT EVENT TRACKING (RPC)
   */
  const trackEvent = useCallback(
    async (eventType: string, metadata: Record<string, any> = {}) => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase.rpc('track_intent_event', {
          p_session_id: sessionId,
          p_event_type: eventType,
          p_property_id: propertyId || 'global',
          p_metadata: metadata,
        });

        if (error) {
          console.error('track_intent_event RPC failed:', error.message);
          return;
        }

        if (data) {
          setIntent(data as IntentState);
        }
      } catch (err) {
        console.error('trackEvent error:', err);
      }
    },
    [sessionId, propertyId]
  );

  /**
   * 3. DWELL TIME SIGNAL (30s engagement trigger)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      trackEvent('dwell_time_30s', { duration: 30 });
    }, 30000);

    return () => clearTimeout(timer);
  }, [trackEvent]);

  return {
    intent,
    sessionId,
    trackEvent,
  };
};