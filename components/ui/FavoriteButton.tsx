import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';

interface FavoriteButtonProps {
    propertyId: string;
    className?: string; // Additional classes for positioning/styling
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ propertyId, className = '' }) => {
    const { favorites, toggleFavorite, user, openAuthModal } = useAuth();
    const [animating, setAnimating] = useState(false);

    const isFavorited = favorites.includes(propertyId);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card navigation
        e.preventDefault();

        if (!user) {
            openAuthModal('login');
            return;
        }

        setAnimating(true);
        await toggleFavorite(propertyId);
        setTimeout(() => setAnimating(false), 300);
    };

    return (
        <button
            onClick={handleClick}
            className={`group relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isFavorited
                    ? 'bg-red-50 hover:bg-red-100'
                    : 'bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm'
                } ${className}`}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart
                size={20}
                className={`transition-all duration-300 ${isFavorited
                        ? 'fill-red-500 text-red-500 scale-100'
                        : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
                    } ${animating ? 'scale-125' : ''}`}
            />
            {isFavorited && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20 pointer-events-none" />
            )}
        </button>
    );
};

export default FavoriteButton;
