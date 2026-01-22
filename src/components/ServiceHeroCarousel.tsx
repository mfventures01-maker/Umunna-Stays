
import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

// Define the slide interface
export interface SlideData {
    id: string;
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
    href?: string;
    route: string;
    imageUrl?: string;
}

interface ServiceHeroCarouselProps {
    slides: SlideData[];
    autoPlayMs?: number;
}

const ServiceHeroCarousel: React.FC<ServiceHeroCarouselProps> = ({
    slides,
    autoPlayMs = 4500
}) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    // Autoplay functionality
    useEffect(() => {
        if (!emblaApi || !isPlaying) return;

        const interval = setInterval(() => {
            emblaApi.scrollNext();
        }, autoPlayMs);

        return () => clearInterval(interval);
    }, [emblaApi, isPlaying, autoPlayMs]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') scrollPrev();
        if (e.key === 'ArrowRight') scrollNext();
    };

    const handleImageError = (id: string) => {
        setFailedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    };

    // Pause on hover
    const onMouseEnter = () => setIsPlaying(false);
    const onMouseLeave = () => setIsPlaying(true);

    return (
        <div
            className="relative w-full overflow-hidden shadow-xl md:rounded-3xl mt-4 md:mt-8 mx-auto max-w-[98%] md:max-w-[95%] focus:outline-none focus:ring-2 focus:ring-[#C46210]/50 rounded-2xl"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Service/Offer Carousel"
        >
            {/* Carousel Viewport */}
            <div className="overflow-hidden bg-gray-900 h-[320px] md:h-[420px] rounded-2xl md:rounded-3xl" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="relative flex-[0_0_100%] min-w-0 h-[320px] md:h-[420px]"
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${index + 1} of ${slides.length}`}
                        >
                            <Link
                                to={slide.route}
                                className="block w-full h-full relative focus:outline-none"
                                onClick={() => trackEvent('carousel_slide_click', { slideId: slide.id, route: slide.route })}
                            >
                                {/* Background */}
                                <div className="absolute inset-0 z-0 bg-gray-900">
                                    {(slide.imageUrl && !failedImages.has(slide.id)) ? (
                                        <img
                                            src={slide.imageUrl}
                                            alt={slide.title}
                                            className="w-full h-full object-cover transition-opacity duration-300"
                                            loading={index === 0 ? "eager" : "lazy"}
                                            onError={() => handleImageError(slide.id)}
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900`} />
                                    )}
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-12 pb-12 md:pb-16 max-w-4xl">
                                    <AnimatePresence mode="wait">
                                        {selectedIndex === index && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-white uppercase bg-[#C46210] rounded-full">
                                                    {slide.badge}
                                                </span>
                                                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-4 leading-tight">
                                                    {slide.title}
                                                </h2>
                                                <p className="text-white/90 text-sm md:text-lg font-medium mb-6 max-w-xl">
                                                    {slide.subtitle}
                                                </p>

                                                <span
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold text-sm md:text-base hover:bg-gray-100 transition-colors"
                                                >
                                                    {slide.ctaText} <ArrowRight size={16} />
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows (Desktop) */}
            <div className="hidden md:flex absolute bottom-12 right-12 gap-3 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Next slide"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Dots (Pagination) */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20" role="tablist">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        role="tab"
                        aria-selected={index === selectedIndex}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${index === selectedIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                        onClick={(e) => { e.stopPropagation(); scrollTo(index); }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ServiceHeroCarousel;
