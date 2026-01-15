import React, { useRef, useState, useEffect } from 'react';
import { Photo } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardImageCarouselProps {
  photos: Photo[];
  onCardClick: () => void;
}

const CardImageCarousel: React.FC<CardImageCarouselProps> = ({ photos, onCardClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  if (!photos || photos.length === 0) return <div className="w-full h-full bg-gray-100" />;

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

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToIndex(Math.min(currentIndex + 1, photos.length - 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToIndex(Math.max(currentIndex - 1, 0));
  };

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || photos.length <= 1) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) setHasMoved(true);
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'smooth';
      // Snap to nearest slide
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      scrollToIndex(index);
    }
    // If we didn't move significantly, trigger the click
    if (!hasMoved) {
      onCardClick();
    }
  };

  return (
    <div className="relative w-full h-full group/card-carousel overflow-hidden">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
        className={`flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar ${photos.length > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      >
        {photos.map((photo, i) => (
          <div key={photo.photo_id} className="flex-shrink-0 w-full h-full snap-start select-none">
            <img 
              src={photo.image_url} 
              alt={photo.alt_text || photo.caption || 'Property view'} 
              className="w-full h-full object-cover pointer-events-none"
              loading={i === 0 ? "eager" : "lazy"}
              {...(i === 0 ? { fetchpriority: "high" } : {})}
              decoding="async"
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all opacity-0 md:group-hover/card-carousel:opacity-100 hover:bg-white/40 ${currentIndex === 0 ? 'pointer-events-none' : ''}`}
            aria-label="Previous image"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          <button 
            onClick={nextSlide}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all opacity-0 md:group-hover/card-carousel:opacity-100 hover:bg-white/40 ${currentIndex === photos.length - 1 ? 'pointer-events-none' : ''}`}
            aria-label="Next image"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
            {photos.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-3 bg-white' : 'w-1 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardImageCarousel;