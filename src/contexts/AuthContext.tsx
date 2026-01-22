import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import AuthModal from '../../components/auth/AuthModal';

interface UserProfile {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    email: string | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    favorites: string[];
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    openAuthModal: (view?: 'login' | 'signup') => void;
    toggleFavorite: (propertyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Global AuthModal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

    const openAuthModal = (view: 'login' | 'signup' = 'login') => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
    };

    // Fetch profile helper
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) setProfile(data);
        } catch (err) {
            console.error('Profile fetch error:', err);
        }
    };

    // Fetch favorites helper
    const fetchFavorites = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('favorites')
                .select('property_id')
                .eq('user_id', userId);

            if (data) {
                setFavorites(data.map(f => f.property_id));
            }
        } catch (err) {
            console.error('Favorites fetch error:', err);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchFavorites(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id);
                fetchFavorites(session.user.id);
            } else {
                setProfile(null);
                setFavorites([]);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) return { error };

        // If signup successful and we have a user, upsert profile
        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                // phone: phone, // Assuming database schema supports it, if not it will be ignored or error. Safest to trust prompt constraint that RLS allows it.
                updated_at: new Date().toISOString(),
            });
            fetchProfile(data.user.id);
        }

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
        setFavorites([]);
    };

    const toggleFavorite = async (propertyId: string) => {
        if (!user) {
            openAuthModal('login');
            return;
        }

        const isFavorited = favorites.includes(propertyId);

        // Optimistic UI update
        const newFavorites = isFavorited
            ? favorites.filter(id => id !== propertyId)
            : [...favorites, propertyId];
        setFavorites(newFavorites);

        try {
            if (isFavorited) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('property_id', propertyId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, property_id: propertyId });
                if (error) throw error;
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            // Rollback
            setFavorites(favorites);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, session, profile, loading, favorites,
            signIn, signUp, signOut,
            openAuthModal, toggleFavorite
        }}>
            {children}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialView={authModalView}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
