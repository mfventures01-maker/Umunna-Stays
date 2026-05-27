import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL?.trim()),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY?.trim())
    },
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // ── Core React runtime ──────────────────────────
            'vendor-react': ['react', 'react-dom'],
            // ── Router (used globally, isolate from app code) ─
            'vendor-router': ['react-router-dom'],
            // ── Supabase client SDK ─────────────────────────
            'vendor-supabase': ['@supabase/supabase-js'],
            // ── TipTap editor (admin-only, heavy) ───────────
            'vendor-editor': [
              '@tiptap/react',
              '@tiptap/starter-kit',
              '@tiptap/extension-image',
              '@tiptap/extension-link',
              '@tiptap/extension-placeholder'
            ],
            // ── Animation engine ────────────────────────────
            'vendor-animation': ['framer-motion'],
            // ── Carousel engine ─────────────────────────────
            'vendor-carousel': ['embla-carousel-react'],
            // ── UI utilities ────────────────────────────────
            'vendor-ui': ['lucide-react', 'zustand']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});

