
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Property, View, AppData } from '../types';
import PropertyCard from './PropertyCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyCarouselProps {
  properties: Property[];
  appData: AppData;
  title?: string;
  subtitle?: string;
  onNavigate: (view: View, property?: Property) => void;
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ properties, appData, title, subtitle, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
      
      // Calculate active index based on the center of the viewport
      const center = scrollLeft + clientWidth / 2;
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || clientWidth;
      const index = Math.floor(center / (cardWidth + 20)); // 20 is the gap
      setActiveIndex(Math.min(index, properties.length - 1));
    }
  }, [properties.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      checkScroll();
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToItem = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 0;
      const gap = 20; // gap-5 in tailwind is 20px
      scrollRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth'
      });
    }
  };

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || properties.length <= 1) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollBehavior = 'auto';
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplier for speed
    if (Math.abs(walk) > 5) setHasMoved(true);
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.style.cursor = 'grab';
    }
  };

  if (!properties || properties.length === 0) return null;

  const hasMultiple = properties.length > 1;

  return (
    <div 
      className="relative w-full py-6 md:py-10 group/carousel" 
      role="region" 
      aria-roledescription="carousel"
      aria-label={title || "Property collection"}
    >
      {(title || subtitle) && (
        <div className="mb-8 px-4">
          {title && <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight">{title}</h2>}
          {subtitle && <p className="text-gray-500 text-sm md:text-lg max-w-2xl font-medium">{subtitle}</p>}
        </div>
      )}

      <div className="relative">
        {hasMultiple && (
          <>
            <button
              onClick={() => scroll('left')}
              className={`absolute -left-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md p-4 rounded-full shadow-2xl border border-gray-100 transition-all duration-300 hover:bg-[#C46210] hover:text-white hidden lg:flex items-center justify-center ${
                showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
              aria-label="Previous stays"
            >
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            <button
              onClick={() => scroll('right')}
              className={`absolute -right-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md p-4 rounded-full shadow-2xl border border-gray-100 transition-all duration-300 hover:bg-[#C46210] hover:text-white hidden lg:flex items-center justify-center ${
                showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
              aria-label="Next stays"
            >
              <ChevronRight size={24} strokeWidth={3} />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-5 md:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 ${hasMultiple ? 'cursor-grab' : 'cursor-default'} select-none`}
          style={{ scrollBehavior: 'smooth' }}
          tabIndex={0}
        >
          {properties.map((property, idx) => (
            <div
              key={property.property_id}
              className="flex-shrink-0 w-[85vw] sm:w-[45vw] lg:w-[30vw] xl:w-[22vw] snap-start"
              aria-label={`${idx + 1} of ${properties.length}`}
              role="group"
            >
              <PropertyCard 
                property={property} 
                appData={appData} 
                onClick={(p) => {
                  if (!hasMoved) onNavigate('property-detail', p);
                }} 
              />
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <div className="flex justify-center items-center gap-2 mt-2" aria-hidden="true">
          {properties.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToItem(i)}
              className={`h-1.5 rounded-full transition-all duration-500 hover:bg-[#C46210]/50 ${
                activeIndex === i ? 'w-8 bg-[#C46210]' : 'w-2 bg-gray-200'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyCarousel;
