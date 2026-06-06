/**
 * LazyLoader.tsx — Reusable Suspense Fallback
 * 
 * Deterministic loading state for lazy-loaded route modules.
 * Prevents blank-screen rendering during chunk fetches.
 * Matches Umunna Stays brand identity.
 */
import React from 'react';

interface LazyLoaderProps {
  /** Optional label shown during loading */
  label?: string;
  /** Minimal mode — smaller spinner, no label */
  minimal?: boolean;
}

const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  label = 'Loading...', 
  minimal = false 
}) => {
  if (minimal) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-[#C46210] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-[#C46210] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-medium tracking-wide">{label}</p>
      </div>
    </div>
  );
};

export default LazyLoader;
