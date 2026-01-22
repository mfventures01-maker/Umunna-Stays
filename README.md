# Umunna Stays

A premium hospitality super-app for short stays, food delivery, transport, and security services.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development
Run the local development server:
```bash
npm run dev
```

### 3. Production Build
Create an optimized production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

## Configuration

### Environment Variables
Create a `.env` or `.env.local` file for optional features:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Optional. Supabase URL for persistent analytics. |
| `VITE_SUPABASE_ANON_KEY` | Optional. Supabase Anon Key for analytics. |

*Note: The app runs fully functional without these variables (analytics will log to localStorage).*

## Architecture & Features

- **Framework**: React + Vite + Tailwind CSS.
- **Routing**: Hash-based routing (`/#stays`, `/#food`) for easy static deployment.
- **Hero Carousel**: `ServiceHeroCarousel.tsx` with hardware-accelerated animations, lazy loading, and error boundaries.
- **Lead Capture**: `LeadCapturePopup.tsx` with session-based frequency capping (once per session) and direct WhatsApp integration.
- **Analytics**: `src/lib/analytics.ts` tracks slides, lead forms, and service requests.

## Deployment

This is a **Static Site**. You can deploy the `dist/` folder to any static host:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 / CloudFront

Ensure your build script runs `npm install && npm run build`.
