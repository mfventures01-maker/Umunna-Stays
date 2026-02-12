import { test, expect } from "@playwright/test";

const BASE = "http://localhost:4173";

// helper: collect console errors
function attachConsoleErrorCollector(page: any, errors: string[]) {
    page.on("console", (msg: any) => {
        if (msg.type() === "error") {
            const errorMsg = `[console.error] ${msg.text()}`;
            errors.push(errorMsg);
            console.log(errorMsg); // Print to terminal
        }
        if (msg.type() === "warning") {
            console.log(`[console.warning] ${msg.text()}`);
        }
    });
    page.on("pageerror", (err: any) => {
        const errorMsg = `[pageerror] ${err?.message || String(err)}`;
        errors.push(errorMsg);
        console.error(errorMsg); // Print to terminal
    });
    page.on("requestfailed", (req: any) => {
        const errorMsg = `[requestfailed] ${req.url()} :: ${req.failure()?.errorText || "failed"}`;
        errors.push(errorMsg);
        console.log(errorMsg); // Print to terminal
    });
}


// helper: click CTA and expect WhatsApp navigation
async function clickCtaExpectWhatsApp(page: any, clickFn: () => Promise<void>) {
    const WA_ANY = /(wa\.link|wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i;
    const WA_SHORT = /wa\.link\/5z8u2u/i;
    const WA_REDIRECT_OK = /(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i;

    let whatsappDetected = false;
    let detectedUrl = "";

    // Set up listeners BEFORE clicking (increased timeout to 10s)
    const popupPromise = page.waitForEvent("popup", { timeout: 10000 })
        .then((popup: any) => ({ type: 'popup', popup }))
        .catch(() => null);

    const requestPromise = page.waitForRequest(
        (req: any) => WA_ANY.test(req.url()),
        { timeout: 10000 }
    )
        .then((request: any) => ({ type: 'request', request }))
        .catch(() => null);

    // Execute the click
    await clickFn();

    // Wait for FIRST to complete (popup OR request)
    const result = await Promise.race([
        popupPromise,
        requestPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 10000))
    ]);

    if (result && result.type === 'popup') {
        detectedUrl = result.popup.url();
        whatsappDetected = WA_ANY.test(detectedUrl);
        console.log(`✅ WhatsApp popup detected: ${detectedUrl}`);
        await result.popup.close().catch(() => { });
    } else if (result && result.type === 'request') {
        detectedUrl = result.request.url();
        whatsappDetected = WA_ANY.test(detectedUrl);
        console.log(`✅ WhatsApp request detected: ${detectedUrl}`);
    }

    // Assert WhatsApp was detected
    if (!whatsappDetected) {
        throw new Error(`WhatsApp navigation not detected. Expected popup or request matching ${WA_ANY}`);
    }

    // Assert it's the shortlink OR a valid redirect
    const isShortlink = WA_SHORT.test(detectedUrl);
    const isRedirect = WA_REDIRECT_OK.test(detectedUrl);

    if (!isShortlink && !isRedirect) {
        throw new Error(`WhatsApp URL not recognized. Expected wa.link/5z8u2u or redirect. Got: ${detectedUrl}`);
    }

    if (isShortlink) {
        console.log(`✅ WhatsApp shortlink verified: wa.link/5z8u2u`);
    } else {
        console.log(`✅ WhatsApp redirect accepted: ${detectedUrl}`);
    }
}


// helper: save failure artifacts
// captureFailureArtifacts removed - Playwright config handles screenshot/video/trace retention on failure

test.describe("Umunna Local Preview QA @4173", () => {
    test("Connectivity, routing, mobile layout, stability, console", async ({ page }) => {
        const errors: string[] = [];
        attachConsoleErrorCollector(page, errors);

        try {
            console.log("STARTING TEST: Connectivity & Routing");

            // Anti-Gravity: SPA-friendly navigation with defensive debug capture
            try {
                await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
                await page.waitForSelector('#root', { state: 'attached', timeout: 15000 });
            } catch (e) {
                console.log('NAV FAIL URL:', page.url());
                try { await page.screenshot({ path: 'NAV_FAIL.png', fullPage: true }); } catch { }
                throw e;
            }

            // Disable CSS transitions/animations for test stability
            await page.addStyleTag({
                content: `
                    *, *::before, *::after {
                        animation-duration: 0s !important;
                        transition-duration: 0s !important;
                    }
                `
            });

            // Route-lock: Ensure we're on homepage (resilient to trailing slashes)
            await expect(page).toHaveURL(/localhost:4173\/?$/, { timeout: 15000 });
            await expect(page).toHaveTitle(/Umunna/i);
            console.log("✅ PASS: Homepage loaded");

            // /rides should redirect/alias to transport
            await page.goto(`${BASE}/rides`, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(500); // Brief wait for redirect logic

            // Route-lock: Verify redirect to transport
            await expect(page).toHaveURL(/#\/transport/i, { timeout: 15000 });
            await page.screenshot({ path: "rides_redirect_result.png", fullPage: true });
            console.log("✅ PASS: /rides redirected to #/transport");

            // Go to stays hash route
            await page.goto(`${BASE}/#/stays`, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(500); // Brief animation wait

            // Route-lock: Verify we're on stays
            await expect(page).toHaveURL(/#\/stays/i, { timeout: 15000 });
            console.log("✅ PASS: Navigated to /#/stays");

            // Wait for properties to load - use stable selector instead of timeout
            await expect(page.getByRole("button", { name: /Details/i }).first()).toBeVisible({ timeout: 15000 });

            // click first "Details" button
            const viewDetails = page.getByRole("button", { name: /Details/i }).first();
            await viewDetails.click();
            console.log("✅ PASS: Clicked Details");

            await page.waitForTimeout(500); // Brief animation wait

            // Route-lock: Verify we navigated to property detail
            await expect(page).toHaveURL(/property|detail|stay/i, { timeout: 15000 });

            // Anti-Gravity: Robust anchor strategy for Property Detail page
            // Use single stable selector to avoid strict mode violation
            const container = page.locator('#root');
            await expect(container).toBeVisible({ timeout: 15000 });

            // Try to find CTA button with broader regex
            const cta = container.getByRole('button', { name: /check|availability|book|reserve|request|rates/i }).first();
            const pricing = container.getByText(/night|\/night|per night|from|₦/i).first();

            const ctaExists = await cta.count() > 0;
            const pricingExists = await pricing.count() > 0;

            if (ctaExists) {
                await cta.scrollIntoViewIfNeeded();
                await expect(cta).toBeVisible({ timeout: 15000 });
                console.log("✅ PASS: Property Detail page loaded (CTA found)");
            } else if (pricingExists) {
                await pricing.scrollIntoViewIfNeeded();
                await expect(pricing).toBeVisible({ timeout: 15000 });
                console.log("✅ PASS: Property Detail page loaded (Pricing found)");
            } else {
                // Failure: Playwright config will auto-save screenshot/video/trace
                console.error(`❌ FAIL URL: ${page.url()}`);
                throw new Error('Property Detail page missing both CTA and Pricing markers');
            }

            // Back navigation
            await page.goBack({ waitUntil: "domcontentloaded" });
            await page.waitForTimeout(500);

            // Route-lock: Verify we're back on stays
            await expect(page).toHaveURL(/#\/stays/i, { timeout: 15000 });
            await expect(page.getByRole("button", { name: /Details/i }).first()).toBeVisible();
            console.log("✅ PASS: Back navigation worked");

            // 2) Mobile Viewport & Layout
            console.log("STARTING TEST: Mobile Viewport");
            await page.setViewportSize({ width: 375, height: 812 });

            await page.goto(`${BASE}/#/transport`, { waitUntil: "domcontentloaded" });
            await page.waitForTimeout(500);

            // Route-lock: Verify we're on transport
            await expect(page).toHaveURL(/#\/transport/i, { timeout: 15000 });

            const fleetHeading = page.getByText(/Available Fleet/i).first();
            if (await fleetHeading.isVisible()) {
                await fleetHeading.scrollIntoViewIfNeeded();
            } else {
                await page.mouse.wheel(0, 500);
            }
            await page.screenshot({ path: "mobile_fleet_layout.png", fullPage: false });
            console.log("✅ PASS: Fleet layout screenshot taken");

            // Mobile viewport CTA click - robust with scroll and timeout
            let clicked = false;

            // Try Request Quote first (if it exists)
            const requestQuoteCount = await page.getByRole("button", { name: /Request Quote/i }).count();
            if (requestQuoteCount > 0) {
                try {
                    const requestQuote = page.getByRole("button", { name: /Request Quote/i }).first();
                    await requestQuote.scrollIntoViewIfNeeded();
                    await expect(requestQuote).toBeVisible({ timeout: 1500 });
                    await clickCtaExpectWhatsApp(page, async () => {
                        await requestQuote.click();
                    });
                    clicked = true;
                    console.log("✅ Clicked Request Quote");
                } catch (e) {
                    console.log("Request Quote not clickable, trying Book Now...");
                }
            }

            // If Request Quote didn't work, try Book Now buttons
            if (!clicked) {
                const bookNowButtons = page.getByRole("button", { name: /Book Now/i });
                const bookNowCount = await bookNowButtons.count();

                if (bookNowCount > 0) {
                    // Try up to 10 Book Now buttons
                    for (let i = 0; i < Math.min(bookNowCount, 10); i++) {
                        try {
                            const btn = bookNowButtons.nth(i);

                            // Robust visibility and state checks
                            await btn.scrollIntoViewIfNeeded();
                            await expect(btn).toBeVisible({ timeout: 3000 });
                            await expect(btn).toBeEnabled({ timeout: 3000 });
                            await btn.hover(); // Stabilize pointer targeting

                            // Attempt normal click, fallback to force click
                            let clickSuccess = false;
                            try {
                                await clickCtaExpectWhatsApp(page, async () => {
                                    await btn.click({ timeout: 3000 });
                                });
                                clickSuccess = true;
                            } catch (clickError) {
                                console.log(`Book Now button ${i + 1} normal click failed: ${clickError instanceof Error ? clickError.message : String(clickError)}`);
                                console.log(`Retrying with force click...`);

                                // Force click fallback
                                await clickCtaExpectWhatsApp(page, async () => {
                                    await btn.click({ force: true, timeout: 3000 });
                                });
                                clickSuccess = true;
                            }

                            if (clickSuccess) {
                                clicked = true;
                                console.log(`✅ Clicked Book Now button ${i + 1}`);
                                break;
                            }
                        } catch (e) {
                            // Continue to next button
                            console.log(`Book Now button ${i + 1} failed: ${e instanceof Error ? e.message : String(e)}`);
                        }
                    }
                }
            }

            // If still not clicked, try PageDown and retry
            if (!clicked) {
                console.log("No CTA visible, trying PageDown...");
                await page.keyboard.press('PageDown');
                await page.waitForTimeout(300);
                await page.keyboard.press('PageDown');
                await page.waitForTimeout(300);

                // Retry Book Now after scroll
                const bookNowButtons = page.getByRole("button", { name: /Book Now/i });
                const bookNowCount = await bookNowButtons.count();

                if (bookNowCount > 0) {
                    try {
                        const btn = bookNowButtons.first();
                        await btn.scrollIntoViewIfNeeded();
                        await expect(btn).toBeVisible({ timeout: 1500 });
                        await clickCtaExpectWhatsApp(page, async () => {
                            await btn.click();
                        });
                        clicked = true;
                        console.log("✅ Clicked Book Now after PageDown");
                    } catch (e) {
                        // Final failure
                    }
                }
            }

            // Assert that we clicked something
            if (!clicked) {
                throw new Error('Mobile CTA click failed: Neither "Request Quote" nor "Book Now" was clickable after scroll attempts');
            }

            await page.waitForTimeout(500);
            await page.screenshot({ path: "mobile_lead_form.png", fullPage: true });
            console.log("✅ PASS: Lead form screenshot taken");

            const closeBtn = page.getByRole("button", { name: /Close|×|X/i }).first();
            if (await closeBtn.isVisible()) await closeBtn.click().catch(() => { });

            // 3) Stress/Stability
            console.log("STARTING TEST: Stress/Stability");
            for (let i = 0; i < 5; i++) {
                await page.goto(`${BASE}/#/stays`, { waitUntil: "domcontentloaded" });
                await page.goto(`${BASE}/#/transport`, { waitUntil: "domcontentloaded" });
            }

            const crash = await page.getByText(/Something went wrong/i).count();
            expect(crash).toBe(0);
            console.log("✅ PASS: Stability check passed");

            // 4) Console
            const filtered = errors.filter(e => !e.includes("/rest/v1/events") && !e.includes("favicon"));
            if (filtered.length > 0) {
                console.error("⚠️  QA Console/Network errors found:\n" + filtered.join("\n"));
            } else {
                console.log("✅ PASS: No critical console errors");
            }
            console.log("🎉 TEST COMPLETED SUCCESSFULLY");

        } catch (error) {
            console.error("❌ TEST FAILED WITH ERROR:", error);
            console.error(`❌ FAIL URL: ${page.url()}`);
            // Playwright config will auto-save screenshot/video/trace on failure
            throw error;
        }
    });
});
