import { chromium } from 'playwright';

export async function assertSeo(pageUrl) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log(`[SEO-TEST] Navigating to ${pageUrl}...`);
  
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000); // Allow React to hydrate metadata

  // 1. Assert Title
  const title = await page.title();
  if (!title) throw new Error("❌ Title tag is missing.");
  console.log(`✅ Title exists: ${title}`);

  // 2. Assert Description
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  if (!description) throw new Error("❌ Meta description is missing.");
  console.log(`✅ Description exists.`);

  // 3. Assert Canonical
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  if (!canonical) throw new Error("❌ Canonical link is missing.");
  console.log(`✅ Canonical exists.`);

  // 4. Assert Robots
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  if (!robots) throw new Error("❌ Meta robots is missing.");
  console.log(`✅ Robots exists: ${robots}`);

  // 5. Assert JSON-LD exists
  const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
  if (jsonLdScripts.length === 0) throw new Error("❌ JSON-LD script is missing.");
  
  let foundPropertySchema = false;
  let foundOfferSchema = false;
  let foundAccommodationSchema = false;

  for (const script of jsonLdScripts) {
    const text = await script.textContent();
    try {
      const parsed = JSON.parse(text);
      // It can be an array of types or a string
      const types = Array.isArray(parsed["@type"]) ? parsed["@type"] : [parsed["@type"]];
      
      if (types.includes("Accommodation") || types.includes("Product")) {
        foundPropertySchema = true;
      }
      if (types.includes("Accommodation")) {
        foundAccommodationSchema = true;
      }
      if (parsed.offers && parsed.offers["@type"] === "Offer") {
        foundOfferSchema = true;
      }
    } catch (err) {
      console.warn("Could not parse a JSON-LD block:", err.message);
    }
  }

  // If this is a property page, assert specific schemas
  if (pageUrl.includes('/stays/')) {
    if (!foundPropertySchema) throw new Error("❌ Property schema is missing.");
    if (!foundOfferSchema) throw new Error("❌ Offer schema is missing.");
    if (!foundAccommodationSchema) throw new Error("❌ Accommodation schema is missing.");
    console.log(`✅ JSON-LD Accommodation and Offer schemas exist.`);
  } else {
    console.log(`✅ JSON-LD exists.`);
  }

  await browser.close();
  console.log(`🎉 [SEO-TEST] All assertions passed for ${pageUrl}\n`);
}

// If run directly
if (process.argv[1].includes('assertSeo.mjs')) {
  const url = process.argv[2] || 'http://localhost:4173/';
  assertSeo(url).catch(e => {
    console.error(e.message);
    process.exit(1);
  });
}
