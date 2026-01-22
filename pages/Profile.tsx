import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { AppData, Property } from '../types';
import { Mail, Phone, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

interface ProfileProps {
    appData: AppData;
    onNavigate: (view: any, property?: Property) => void;
}

const Profile: React.FC<ProfileProps> = ({ appData, onNavigate }) => {
    const { user, profile, loading, favorites } = useAuth();

    // Derived state: Get property objects for favorite IDs
    const favoriteProperties = appData.properties.filter(p => favorites.includes(p.property_id));

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#C46210]" size={32} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 text-center">
                <h2 className="text-3xl font-black mb-4">Please Log In</h2>
                <p className="text-gray-500">You need to be logged in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 bg-[#C46210]/10 rounded-full flex items-center justify-center text-[#C46210] font-black text-4xl">
                            {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{profile?.full_name || 'Guest User'}</h1>
                            <div className="flex flex-col md:flex-row gap-4 text-gray-500 font-medium text-sm justify-center md:justify-start">
                                <span className="flex items-center gap-2"><Mail size={16} /> {user.email}</span>
                                {profile?.phone && <span className="flex items-center gap-2"><Phone size={16} /> {profile.phone}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Favorites Section */}
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-[#C46210] pl-4">Your Favorites</h2>
                        {favoriteProperties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                                {favoriteProperties.map(property => (
                                    <PropertyCard
                                        key={property.property_id}
                                        property={property}
                                        appData={appData}
                                        onNavigate={onNavigate}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium">No favorites yet.</p>
                                <button
                                    onClick={() => onNavigate('stays')}
                                    className="mt-4 text-[#C46210] font-bold text-sm hover:underline"
                                >
                                    Browse Stays
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
