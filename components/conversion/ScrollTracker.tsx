import React, { useEffect, useRef } from 'react';

interface ScrollTrackerProps {
    onThreshold: (threshold: number) => void;
}

export const ScrollTracker: React.FC<ScrollTrackerProps> = ({ onThreshold }) => {
    const thresholdsReached = useRef<Set<number>>(new Set());

    useEffect(() => {
        const handleScroll = () => {
            const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            const percentage = Math.round(scrollPercent * 100);

            [25, 50, 75, 90].forEach(threshold => {
                if (percentage >= threshold && !thresholdsReached.current.has(threshold)) {
                    thresholdsReached.current.add(threshold);
                    onThreshold(threshold);
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [onThreshold]);

    return null; // Silent observer
};
