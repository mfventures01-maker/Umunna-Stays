
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VehicleImageGalleryProps {
  images: string[];
  alt: string;
}

const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Image Unavailable</span>
      </div>
    );
  }

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full group/gallery overflow-hidden">
      <img 
        src={images[currentIndex]} 
        alt={`${alt} view ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-700 group-hover/gallery:scale-110"
        loading="lazy"
        decoding="async"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-white/40"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          <button 
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-white/40"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-4 bg-white' : 'w-1 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VehicleImageGallery;
