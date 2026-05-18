import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  photo_id: string;
  sequence_order: number;
  image_url: string;
  caption?: string;
  alt_text?: string;
  room_category?: string;
}

interface PropertyData {
  property_id: string;
  about_this_space?: string;
  photos: Photo[];
}

interface PropertyPhotoCardCarouselProps {
  propertyData: PropertyData;
}

const PropertyPhotoCardCarousel: React.FC<PropertyPhotoCardCarouselProps> = ({ propertyData }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. Carousel Logic: Sort slides by sequence_order
  const sortedPhotos = [...propertyData.photos].sort((a, b) => a.sequence_order - b.sequence_order);
  const totalPhotos = sortedPhotos.length;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== currentIndex) setCurrentIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: index * clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => scrollToIndex(Math.min(currentIndex + 1, totalPhotos - 1));
  const prevSlide = () => scrollToIndex(Math.max(currentIndex - 1, 0));

  // 2. "About this space" Logic
  const aboutText = propertyData.about_this_space || "";
  const shouldTruncate = aboutText.length > 350;
  const displayAbout = isExpanded || !shouldTruncate ? aboutText : `${aboutText.slice(0, 350)}...`;

  return (
    <div 
      className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
      id={`${propertyData.property_id}-carousel`}
      data-property-id={propertyData.property_id}
    >
      {/* Photo Carousel Container */}
      <div className="relative aspect-[16/10] bg-gray-50 group">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        >
          {sortedPhotos.map((photo, i) => (
            <div 
              key={photo.photo_id} 
              data-photo-id={photo.photo_id}
              className="flex-shrink-0 w-full h-full snap-start relative"
            >
              {photo.image_url ? (
                <img 
                  src={photo.image_url} 
                  alt={photo.alt_text || ""} 
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  {...(i === 0 ? { fetchpriority: "high" } : {})}
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}

              {/* Slide Metadata Overlays (Caption & Category) */}
              {(photo.caption || photo.room_category) && (
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                  {photo.room_category && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 block mb-1">
                      {photo.room_category}
                    </span>
                  )}
                  {photo.caption && (
                    <p className="text-sm font-medium">{photo.caption}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Counter UI (e.g. 1/9) */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-widest z-10 border border-white/10">
          {currentIndex + 1} / {totalPhotos}
        </div>

        {/* Navigation Arrows (Desktop) */}
        {totalPhotos > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all opacity-0 md:group-hover:opacity-100 hover:bg-white/40 ${currentIndex === 0 ? 'pointer-events-none !opacity-0' : ''}`}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button 
              onClick={nextSlide}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all opacity-0 md:group-hover:opacity-100 hover:bg-white/40 ${currentIndex === totalPhotos - 1 ? 'pointer-events-none !opacity-0' : ''}`}
              aria-label="Next slide"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </>
        )}

        {/* Dots Pagination */}
        {totalPhotos > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {sortedPhotos.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* "About this space" Section */}
      {propertyData.about_this_space && (
        <div className="p-8 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-[#C46210] rounded-full" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">About this space</h3>
          </div>
          
          <div 
            className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-medium"
          >
            {displayAbout}
          </div>

          {shouldTruncate && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-[#C46210] text-xs font-black uppercase tracking-widest hover:underline transition-all"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyPhotoCardCarousel;