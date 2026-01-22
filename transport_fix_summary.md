
# Transport & Amenities Fixes

## 1. Transport Lead Pipeline (Supabase Integrated)
*   **Problem**: Transport requests were only saved to the user's browser (Local Storage), meaning you (the admin) never saw them.
*   **Fix**: Rewrote `TransportLeadForm.tsx` to write directly to your **Supabase Database** (`leads` table).
*   **Flow**:
    1.  User fills out the form.
    2.  Data is sent to Supabase (User ID, Name, Phone, Pickup, Vendor, etc.).
    3.  **Only on success**, the WhatsApp chat opens with the pre-filled message.
    4.  If the connection fails, an error message appears with a "Open WhatsApp Anyway" button 

## 2. Amenities UX Polish
*   **Problem**: The property page would "flash" standard amenities (WiFi/AC) for 0.5s before the premium amenities (Power/Jacuzzi) loaded.
*   **Fix**: Implemented a **Skeleton Loader** (gray pulse effect).
*   **Result**: The section now stays stable while loading and then smoothly reveals the correct amenities, preventing the "layout shift" or "wrong content" glitch.

## 3. Verification
*   **Build**: Passed `npm run build`.
*   **Code Integrity**: No TypeScript errors.
