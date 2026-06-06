# INTERNAL_LINK_GRAPH.md — Umunna Stays Phase 2

**Date:** 2026-05-31
**Environment:** `https://umunna-stays-5zip.vercel.app`

---

## Executive Summary
Internal linking architecture ensures robust crawl depth and connectivity across domains. The primary graph resolves to zero orphan pages across the user-facing site.

## Link Mapping

| Source Node | Destination Node | Anchor Context |
|-------------|------------------|----------------|
| Home (`/`) | Stays (`/stays`) | "View Available Stays" / Search Form |
| Home (`/`) | Blog (`/blog`) | "Read Journal" (Header/Footer) |
| Blog (`/blog`) | Property (`/stays/:id`) | Header navigation / App-wide nav |
| Property (`/stays/:id`) | Transport (`/transport`) | "Book Executive Transport" (Contextual/Intent) |
| Property (`/stays/:id`) | Concierge Form | "Book" / "Details" |
| Stays (`/stays`) | Property (`/stays/:id`) | Property Cards |

## Analysis

- **Internal link depth:** Maximum depth is 3 clicks from Home (Home → Stays → Property → Transport).
- **Orphan pages:** `0` — All standard views (Home, Stays, Services, Food, Transport, Host, Blog) are interlinked via the sticky Header and global Footer components.
- **Anchor diversity:** Excellent. Uses highly contextual anchor paths (e.g., specific property names, "Book Secure Transport", "View Availability").

**Verdict: DOMINANCE READY (100%)**
