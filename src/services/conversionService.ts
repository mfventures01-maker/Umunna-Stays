import { supabase } from '../lib/supabaseClient';

export interface BookingIntent {
    property_id: string;
    check_in: string;
    check_out: string;
    guest_info: {
        name: string;
        phone: string;
        email: string;
    };
}

export const conversionService = {
    /**
     * Creates a deterministic booking intent bound to the current session and active shift.
     */
    async createBooking(session_id: string, intent: BookingIntent) {
        const { data, error } = await supabase.rpc('create_booking_intent', {
            p_session_id: session_id,
            p_property_id: intent.property_id,
            p_check_in: intent.check_in,
            p_check_out: intent.check_out,
            p_guest_info: intent.guest_info
        });

        if (error) throw error;
        return data; // Returns booking UUID
    },

    /**
     * Fetches verified social proof for a property (real bookings).
     */
    async getSocialProof(property_id: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select('guest_name, created_at')
            .eq('property_id', property_id)
            .eq('status', 'confirmed')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) return [];
        return data;
    },

    /**
     * Record conversion event for audit trail.
     */
    async logConversion(booking_id: string, event: string) {
        const { error } = await supabase
            .from('bookings')
            .update({
                audit_trail: supabase.rpc('append_to_audit_trail', { p_booking_id: booking_id, p_event: event })
            })
            .eq('id', booking_id);
        
        return !error;
    }
};
