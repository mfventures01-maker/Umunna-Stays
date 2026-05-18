# QA Automated Test Failures Report
**Generated:** 2026-02-09 18:20 WAT  
**Test Target:** http://localhost:4173 (Production Build)  
**TestSpec:** qa-local-preview.spec.ts

---

## 🔴 OVERALL STATUS: **FAILED**

**1 Test Failed** | Total Runtime: ~18 seconds

---

## ❌ FAILURE BREAKDOWN

### **Test Case:** "Connectivity, routing, mobile layout, stability, console"

#### ✅ **Passed Steps (Before Failure):**
1. **Homepage Load** - PASS
2. **/rides Redirect to #/transport** - PASS  
3. **Navigate to /#/stays** - PASS
4. **Click "Details" Button on Property Card** - PASS

---

#### ❌ **FAILURE POINT:**

**Step:** Property Detail Page Verification  
**Action:** Expecting `Check Availability` button OR `Nightly From` text to be visible  
**Timeout:** 10,000ms  
**Result:** `Error: element(s) not found`

**Selector Used:**
```typescript
const uniqueElement = page.getByRole("button", { name: /Check Availability/i }).first();
const textCheck = page.getByText(/Nightly From/i).first();
await expect(uniqueElement.or(textCheck)).toBeVisible({ timeout: 10000 });
```

---

## 🧪 ROOT CAUSE ANALYSIS

### **Challenge 1: Missing or Non-Rendered Property Detail Page**
- **Symptom:** After clicking "Details" on a property card, the detail page fails to render critical UI elements within 10 seconds.
- **Likely Causes:**
  1. **Supabase Data Loading Failure:**
     - The `BookingWidget` component renders `ConciergeLeadForm`, which contains the "Check Availability" button.
     - If `appData` or `property` is `null`/`undefined`, the component may crash silently or render a blank page.
     - Supabase `property_amenities` fetch in `PropertyDetail.tsx` might be timing out or failing.
  
  2. **Routing/Navigation Issue:**
     - Hash-based routing (`#/property/:id`) may not be triggering the detail view properly in the production build.
     - The `onNavigate` function in `App.tsx` may not be updating `currentView` or `selectedProperty` state.

  3. **ErrorBoundary Catching Silent Crash:**
     - If `PropertyDetail.tsx` throws an error (e.g., `Cannot read property 'nightly_rate' of undefined`), the `ErrorBoundary` might be rendering a fallback UI without the expected elements.

---

### **Challenge 2: Stale Production Build (Resolved via Rebuild)**
- **Issue:** The preview server (`npm run preview --port 4173`) was running for 2h+ with a stale `dist` folder.
- **Impact:** Code changes and `.env.local` updates were not reflected in the production build.
- **Resolution:** Executed `npm run build` successfully (11.28s build time).
- **Note:** Despite rebuild, the test still fails, indicating the issue is **not** a stale build but a **runtime data/routing problem**.

---

### **Challenge 3: Playwright Selector Mismatch**
- **Issue:** The test looks for `Check Availability` button, but if the component fails to mount, the button never renders.
- **Fallback Selector:** The test uses `.or(textCheck)` to look for "Nightly From" text as a fallback, but **both selectors fail**.
- **Implication:** The entire `PropertyDetail` page or `BookingWidget` is **not rendering**.

---

## 🔍 ADDITIONAL EVIDENCE

### **Console Logs (from test):**
```
PASS: Homepage loaded
PASS: /rides redirect successful
PASS: Navigated to /#/stays
PASS: Clicked Details
[TEST TIMEOUT - 10,000ms]
Error: element(s) not found
```

### **Supabase Connection Status:**
- **Properties Table:** 19 records ✅
- **Property Images Table:** 0 records ✅
- **Food Vendors:** 1 record ✅
- **Food Items:** 8 records ✅

**Observation:** `property_images` table is **empty**. The `PropertyDetail` page relies on `getPhotosByPropertyId()`, which may return an empty array, potentially causing UI breakage if not handled gracefully.

---

## 🚨 CRITICAL ISSUES TO FIX

### **Priority 1: Property Detail Page Not Rendering**
**Hypothesis:** The page crashes or renders blank due to:
- Missing `property_images` data
- Undefined `property` object
- Supabase fetch timeout/failure

**Recommended Fix:**
1. Add defensive null checks in `PropertyDetail.tsx` for `property`, `appData`, and `propertyPhotos`.
2. Ensure `BookingWidget` and `ConciergeLeadForm` render even if data is incomplete.
3. Add fallback UI for missing photos (already exists in `getPhotosByPropertyId`, but verify it works).

---

### **Priority 2: Hash Routing State Management**
**Hypothesis:** Clicking "Details" updates the URL hash but doesn't trigger a state change in `App.tsx`.

**Recommended Fix:**
1. Verify `onNavigate('property-detail', property)` is called correctly in `PropertyCard.tsx`.
2. Add console logging in `App.tsx` to trace `currentView` and `selectedProperty` state updates.
3. Confirm `PropertyDetail` receives non-null `property` prop.

---

### **Priority 3: ErrorBoundary Silent Failures**
**Hypothesis:** The `ErrorBoundary` might be catching errors and rendering a fallback UI that doesn't match the test selectors.

**Recommended Fix:**
1. Add `data-testid` attributes to the ErrorBoundary fallback UI for easier detection in tests.
2. Log errors to console even when caught by ErrorBoundary.

---

## 📊 TEST EXECUTION SUMMARY

| Step | Status | Time |
|------|--------|------|
| 1. Homepage Load | ✅ PASS | ~2s |
| 2. /rides Redirect | ✅ PASS | ~3s |
| 3. Navigate to /#/stays | ✅ PASS | ~2s |
| 4. Click "Details" Button | ✅ PASS | ~1s |
| 5. Property Detail Verification | ❌ **FAIL** | 10s (timeout) |
| 6. Mobile Viewport Test | ⏭️ SKIPPED | - |
| 7. Stress Test | ⏭️ SKIPPED | - |
| 8. Console Errors | ⏭️ SKIPPED | - |

---

## 🎯 NEXT STEPS

1. **Manual Inspection:**
   - Open `http://localhost:4173/#/stays` in a browser.
   - Click any "Details" button.
   - Check if Property Detail page renders correctly.
   - Inspect browser DevTools console for errors.

2. **Add Logging:**
   - Add `console.log` statements in `PropertyDetail.tsx`, `BookingWidget.tsx`, and `App.tsx` to trace data flow.

3. **Fix Data Handling:**
   - Seed `property_images` table with at least 1 image per property.
   - Add error boundaries around `PropertyDetail` components.

4. **Re-run Test:**
   - After fixes, re-run `npx playwright test qa-local-preview.spec.ts`.

---

## 📝 NOTES

- **No Console Errors Logged:** The test does not capture console errors during the Property Detail page load, suggesting either:
  - No errors were logged (silent failure).
  - Errors were suppressed by ErrorBoundary.

- **Supabase Data Integrity:** All core tables exist and contain data, but `property_images` is empty, which may break photo carousels.

- **Test Reliability:** The test successfully navigates and interacts with the Stays list, indicating basic routing and data loading works. The failure is **isolated to the Property Detail view**.

---

**End of Report**
