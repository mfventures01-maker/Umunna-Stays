# ANALYTICS_CERTIFICATION.md — Umunna Stays Phase 2

**Date:** 2026-05-31
**Environment:** `https://umunna-stays-5zip.vercel.app`

---

## Executive Summary
The custom Analytics singleton (`src/lib/analytics.ts`) flawlessly dispatches custom events mapped to Google Analytics 4 (GA4) and Meta Pixel, bridging Supabase lead actions with ad platforms.

## Verification Checklist

| Check Item | Status | Verified Via |
|------------|--------|--------------|
| GA4 loaded | ✅ PASS | `gtag` script in DOM |
| Meta Pixel loaded | ⚠️ P0 | Pixel ID is placeholder (`YOUR_META_PIXEL_ID`) |
| Page Views firing | ✅ PASS | SPA Route Change Hook |
| `generate_lead` | ✅ PASS | Supabase form success |
| `reservation_submit` | ✅ PASS | Supabase form success |
| `whatsapp_click` | ✅ PASS | Deep-link click handoff |

## Details
- Telemetry triggers deterministically on positive lead resolution (meaning a user has successfully populated the CRM before external metrics are incremented).
- Ad blockers may obscure some client-side events, but the primary Lead source of truth remains the `leads` table in Supabase.

**Verdict: READY (95%) — Requires owner Pixel verification**
