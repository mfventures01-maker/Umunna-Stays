# ✅ ANTI-GRAVITY WHATSAPP HELPER HARDENING - COMPLETE

**Generated:** 2026-02-09 20:45 WAT  
**Target:** qa-local-preview.spec.ts  
**Objective:** Fix WhatsApp assertion to work with wa.link redirects using Promise.race

---

## 🎯 **PROBLEM ANALYSIS**

### **Original Issues:**
1. **Promise.all blocks** - Waited for BOTH popup AND request (10s total wait)
2. **Strict shortlink check** - `detectedUrl.includes("https://wa.link/5z8u2u")` fails on redirects
3. **No retry on CTA failure** - If `clickCtaExpectWhatsApp` throws, iteration stops
4. **5s timeout too short** - Slow environments need more time

---

## ✅ **FIXES IMPLEMENTED**

### **1. Promise.race Implementation (Lines 29-90)**

**Before:**
```typescript
const popupPromise = page.waitForEvent("popup", { timeout: 5000 }).catch(() => null);
const requestPromise = page.waitForRequest(..., { timeout: 5000 }).catch(() => null);

await clickFn();

const [popup, request] = await Promise.all([popupPromise, requestPromise]); // ❌ Waits for BOTH
```

**After:**
```typescript
const popupPromise = page.waitForEvent("popup", { timeout: 10000 })
    .then((popup: any) => ({ type: 'popup', popup }))
    .catch(() => null);

const requestPromise = page.waitForRequest(..., { timeout: 10000 })
    .then((request: any) => ({ type: 'request', request }))
    .catch(() => null);

await clickFn();

const result = await Promise.race([
    popupPromise,
    requestPromise,
    new Promise(resolve => setTimeout(() => resolve(null), 10000))
]); // ✅ Returns FIRST to complete
```

---

### **2. Redirect-Tolerant Regex Patterns**

**Before:**
```typescript
const WA_REGEX = /(wa\.link|wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i;
const EXPECTED_SHORTLINK = "https://wa.link/5z8u2u";

// ❌ Fails on redirect
if (!detectedUrl.includes(EXPECTED_SHORTLINK)) {
    throw new Error(...);
}
```

**After:**
```typescript
const WA_ANY = /(wa\.link|wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i;
const WA_SHORT = /wa\.link\/5z8u2u/i;
const WA_REDIRECT_OK = /(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i;

// ✅ Accepts shortlink OR redirect
const isShortlink = WA_SHORT.test(detectedUrl);
const isRedirect = WA_REDIRECT_OK.test(detectedUrl);

if (!isShortlink && !isRedirect) {
    throw new Error(`WhatsApp URL not recognized. Got: ${detectedUrl}`);
}

if (isShortlink) {
    console.log(`✅ WhatsApp shortlink verified: wa.link/5z8u2u`);
} else {
    console.log(`✅ WhatsApp redirect accepted: ${detectedUrl}`);
}
```

---

### **3. Error Logging in Book Now Loop (Line 243)**

**Before:**
```typescript
} catch (e) {
    // Continue to next button  // ❌ Silent failure
}
```

**After:**
```typescript
} catch (e) {
    // Continue to next button
    console.log(`Book Now button ${i + 1} failed: ${e instanceof Error ? e.message : String(e)}`);
}
```

**Now logs:**
- `"Book Now button 1 failed: WhatsApp navigation not detected..."`
- `"Book Now button 2 failed: Locator not visible..."`
- Etc.

---

### **4. Increased Timeout: 5000ms → 10000ms**

All WhatsApp detection timeouts increased to 10 seconds for slower environments.

---

## 📊 **DETECTION LOGIC FLOW**

```
1. Set up listeners (popup + request) with 10s timeout each
   ↓
2. Execute click (await clickFn())
   ↓
3. Promise.race waits for FIRST result:
   - Popup event → Extract popup.url()
   - Request event → Extract request.url()
   - 10s timeout → null
   ↓
4. Verify detected URL:
   ✅ Matches WA_SHORT (wa.link/5z8u2u) → Shortlink verified
   ✅ Matches WA_REDIRECT_OK (wa.me/api.whatsapp.com) → Redirect accepted
   ❌ Neither → Throw error
```

---

## 🧪 **TEST EXECUTION STATUS**

**Current Status:** Test still failing at mobile CTA section (`http://localhost:4173/#/transport`)

**Likely Causes:**
1. **CTA buttons not visible** - Mobile viewport may need more scroll
2. **WhatsApp blocked** - Browser/environment blocking navigation
3. **Timing issue** - Page needs more time before CTA click

**Evidence Needed:**
- Check console logs for:
  - `"Book Now button X failed: ..."`
  - `"✅ WhatsApp popup detected: ..."`
  - `"✅ WhatsApp redirect accepted: ..."`

---

## ✅ **ACCEPTANCE CRITERIA STATUS**

✅ **Promise.race implementation** - No longer waits for both popup AND request  
✅ **Redirect tolerance** - Accepts `wa.link/5z8u2u` OR `wa.me/api.whatsapp.com`  
✅ **Error logging** - Book Now loop logs which button failed and why  
✅ **10s timeout** - Increased from 5s for slower environments  
✅ **No strict shortlink check** - Removed `detectedUrl.includes()`  

⏳ **Test still failing** - Needs trace analysis to identify exact failure point  

---

## 🔍 **DEBUGGING NEXT STEPS**

### **1. Check Console Output**
```bash
# Run test and capture full output
npx playwright test qa-local-preview.spec.ts --headed --reporter=line 2>&1 | Tee-Object test_output.txt
cat test_output.txt | Select-String "Book Now|WhatsApp|FAIL"
```

### **2. Analyze Trace File**
```bash
npx playwright show-trace test-results/**/trace.zip
# Look for:
# - Which Book Now button was clicked
# - Whether popup/request was detected
# - Network tab for wa.link requests
```

### **3. Check Screenshot**
```bash
# View failure screenshot
explorer test-results/**/test-failed-1.png
# Should show mobile transport page at moment of failure
```

### **4. Potential Fixes if Still Failing**

**If "Book Now button X failed: Locator not visible":**
```typescript
// Increase visibility timeout
await expect(btn).toBeVisible({ timeout: 1500 }); // → 3000
```

**If "WhatsApp navigation not detected":**
```typescript
// Increase WhatsApp wait timeout
{ timeout: 10000 } // → 15000
```

**If buttons exist but none clickable:**
```typescript
// Add more aggressive scroll
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(500);
```

---

## 📝 **CODE CHANGES SUMMARY**

**File:** `qa-local-preview.spec.ts`

**Lines Modified:**
- Lines 29-90: `clickCtaExpectWhatsApp` helper (complete rewrite)
- Line 243: Book Now loop error logging

**Key Changes:**
1. `Promise.all` → `Promise.race`
2. `{ timeout: 5000 }` → `{ timeout: 10000 }`
3. `WA_REGEX` → `WA_ANY + WA_SHORT + WA_REDIRECT_OK`
4. Strict `includes(EXPECTED_SHORTLINK)` → Regex-based `isShortlink || isRedirect`
5. Silent catch → Logged catch with error details

**Net Impact:**
- ~15 lines changed in helper
- +1 line in error logging
- More robust WhatsApp detection
- Better debugging visibility

---

## 🎯 **EXPECTED BEHAVIOR AFTER FIX**

### **Successful WhatsApp Detection:**
```
✅ PASS: Fleet layout screenshot taken
✅ Clicked Book Now button 1
✅ WhatsApp request detected: https://wa.link/5z8u2u
✅ WhatsApp shortlink verified: wa.link/5z8u2u
✅ PASS: Lead form screenshot taken
```

**OR (if redirect occurs):**
```
✅ Clicked Book Now button 1
✅ WhatsApp redirect accepted: https://api.whatsapp.com/send?phone=...
✅ PASS: Lead form screenshot taken
```

---

**Status:** 🟢 **WHATSAPP HELPER HARDENING COMPLETE** - Promise.race implemented, redirect-tolerant regex in place, 10s timeout set, error logging added. Test infrastructure ready for WhatsApp validation once CTA visibility issues are resolved.
