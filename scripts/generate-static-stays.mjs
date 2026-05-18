/**
 * 🏨 GOVERNED STATIC PROPERTY EXPOSURE LAYER (v1.0)
 * 
 * Fulfills Phase 3 requirements for search engine authoritative property pages.
 * Generates static HTML snapshots for all hospitality listings with rich schema.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DOMAIN = "https://www.umunnastays.com.ng";

async function generateStaticStays() {
    if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
        console.error("❌ PIPELINE_INCOMPLETE: Supabase credentials missing.");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    console.log("🚀 Initializing Governed Property Exposure Layer...");

    // 1. Fetch Authoritative Snapshot
    const [{ data: properties }, { data: images }, { data: amenities }] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('property_images').select('*'),
        supabase.from('property_amenities').select('property_id, amenity:amenities_master(*)')
    ]);

    if (!properties) {
        console.error("❌ AUTHORITY FETCH FAILED: No properties found.");
        return;
    }

    const distPath = path.join(process.cwd(), 'dist');
    const staysRoot = path.join(distPath, 'stays');
    fs.mkdirSync(staysRoot, { recursive: true });

    const manifestPath = path.join(distPath, '.vite', 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error("❌ PIPELINE_INCOMPLETE: MANIFEST NOT FOUND. Run 'vite build' first.");
        process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entryKey = Object.keys(manifest).find(key => manifest[key].isEntry);
    const cssFiles = manifest[entryKey]?.css || [];

    // 2. Deterministic Generation
    properties.forEach(prop => {
        const propDir = path.join(staysRoot, prop.property_id);
        fs.mkdirSync(propDir, { recursive: true });

        const propImages = images?.filter(img => img.property_id === prop.property_id) || [];
        const propAmenities = amenities?.filter(a => a.property_id === prop.property_id).map(a => a.amenity) || [];
        
        const title = `${prop.name} | ${prop.category} in ${prop.city} | Umunna Stays`;
        const description = prop.about_this_space?.slice(0, 160) || `Book ${prop.name} in ${prop.city}. ${prop.category} with ${prop.bedrooms} bedrooms. Premium hospitality by Umunna Stays.`;
        const canonicalUrl = `${DOMAIN}/stays/${prop.property_id}`;
        const imageUrl = prop.hero_image_url || propImages[0]?.image_url || `${DOMAIN}/og-default.jpg`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}" />
    
    <!-- Open Graph / Social Media Authority -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="Umunna Stays" />

    <!-- Twitter / X Card Authority -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />

    ${cssFiles.map(css => `<link rel="stylesheet" href="/${css}">`).join('\n    ')}

    <!-- JSON-LD Structured Data Layer (LodgingBusiness) -->
    <script type="application/ld+json">
    ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": prop.name,
        "description": prop.about_this_space,
        "image": imageUrl,
        "url": canonicalUrl,
        "telephone": prop.host?.host_whatsapp || "+2347048033575",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": prop.city,
            "addressRegion": prop.state,
            "addressCountry": "NG"
        },
        "amenityFeature": propAmenities.map(a => ({
            "@type": "LocationFeatureSpecification",
            "name": a.name,
            "value": true
        })),
        "numberOfRooms": prop.bedrooms,
        "occupancy": {
            "@type": "QuantitativeValue",
            "value": prop.capacity
        }
    })}
    </script>
</head>
<body class="bg-white antialiased">
    <nav class="bg-white border-b border-gray-100 py-6 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <a href="/" class="font-black text-xl tracking-tighter">UMUNNA STAYS</a>
            <div class="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <a href="/stays" class="text-black">Stays</a>
                <a href="/blog" class="hover:text-black transition-colors">Journal</a>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-12">
        <div class="mb-8">
            <h1 class="text-4xl font-black text-gray-900 mb-2">${prop.name}</h1>
            <p class="text-gray-500 font-bold uppercase tracking-widest text-xs">${prop.category} • ${prop.city}, ${prop.state}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="rounded-[32px] overflow-hidden shadow-xl">
                <img src="${imageUrl}" alt="${prop.name}" class="w-full h-[400px] object-cover" />
            </div>
            <div class="space-y-6">
                <div class="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                    <h3 class="text-lg font-bold mb-4">About this space</h3>
                    <p class="text-gray-600 leading-relaxed">${prop.about_this_space}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${prop.badges?.map(badge => `<span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">${badge}</span>`).join('')}
                </div>
                <a href="/stays" class="inline-block bg-black text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest">View Availability</a>
            </div>
        </div>
    </main>

    <footer class="mt-20 py-12 border-t border-gray-100 text-center">
        <p class="text-[10px] font-black text-gray-300 uppercase tracking-widest">© ${new Date().getFullYear()} Umunna Stays Inc.</p>
    </footer>
</body>
</html>`;

        fs.writeFileSync(path.join(propDir, 'index.html'), html);
        console.log(`✅ DETERMINISTIC SNAPSHOT: /stays/${prop.property_id}`);
    });

    console.log(`📊 SSG Complete. ${properties.length} property pages exposed.`);
}

generateStaticStays();
