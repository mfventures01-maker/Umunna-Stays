/**
 * 🧠 GOVERNED STATIC GENERATION ENGINE (v2.0)
 * 
 * ENFORCEMENT RULES:
 * 1. SERVICE ROLE KEY ONLY (Backend Authority)
 * 2. MANIFEST-BASED ASSET RESOLUTION
 * 3. SEO PURE MODE (No React Hydration on Blog Pages)
 * 4. DETERMINISTIC HTML EXPOSURE
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // 🔐 SECURE KEY ONLY
const DOMAIN = "https://www.umunnastays.com.ng";

async function generateStaticBlog() {
    // 🛑 SAFETY GATE: Block if insecure keys used in authority layer
    if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.length < 40) {
        console.error("❌ GOVERNANCE BREACH: SUPABASE_SERVICE_ROLE_KEY missing or invalid.");
        process.exit(1);
    }

    if (!SUPABASE_URL) {
        console.error("❌ CONFIG ERROR: VITE_SUPABASE_URL missing.");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("🚀 Initializing Governed Static Exposure Layer...");

    // 1. Fetch Authoritative Snapshot
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('lifecycle_state', 'published');

    if (error) {
        console.error("❌ AUTHORITY FETCH FAILED:", error.message);
        process.exit(1);
    }

    // 2. Resolve Assets via Manifest
    const distPath = path.join(process.cwd(), 'dist');
    const blogRoot = path.join(distPath, 'blog');
    fs.mkdirSync(blogRoot, { recursive: true }); // Ensure blog directory exists regardless of post count

    const manifestPath = path.join(distPath, '.vite', 'manifest.json'); // Vite 5+ location
    
    if (!fs.existsSync(manifestPath)) {
        console.error("❌ PIPELINE_INCOMPLETE: MANIFEST NOT FOUND. Run 'vite build' first.");
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Find main CSS and JS from manifest
    const entryKey = Object.keys(manifest).find(key => manifest[key].isEntry);
    const cssFiles = manifest[entryKey]?.css || [];
    const mainJs = manifest[entryKey]?.file;

    console.log(`📦 Resolved Assets: [CSS: ${cssFiles.join(', ')}] [JS: ${mainJs}]`);

    // 3. Deterministic Generation
    posts.forEach(post => {
        const postDir = path.join(blogRoot, post.slug);
        fs.mkdirSync(postDir, { recursive: true });

        // 🧱 SECTION 3: SEO PURE MODE HTML
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.meta_title || post.title} | Umunna Stays</title>
    <meta name="description" content="${post.meta_description || post.excerpt}">
    <meta name="robots" content="${post.index_status === 'indexed' ? 'index, follow' : 'noindex, nofollow'}">
    <link rel="canonical" href="${DOMAIN}/blog/${post.slug}" />
    
    <!-- Open Graph / Social Media Authority -->
    <meta property="og:title" content="${post.meta_title || post.title}" />
    <meta property="og:description" content="${post.meta_description || post.excerpt}" />
    <meta property="og:image" content="${post.featured_image_url || `${DOMAIN}/og-default.jpg`}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${DOMAIN}/blog/${post.slug}" />
    <meta property="og:site_name" content="Umunna Stays" />

    <!-- Twitter / X Card Authority -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${post.meta_title || post.title}" />
    <meta name="twitter:description" content="${post.meta_description || post.excerpt}" />
    <meta name="twitter:image" content="${post.featured_image_url || `${DOMAIN}/og-default.jpg`}" />
    
    ${cssFiles.map(css => `<link rel="stylesheet" href="/${css}">`).join('\n    ')}
    
    <!-- JSON-LD Structured Data Layer (Schema.org) -->
    <script type="application/ld+json">
    ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${DOMAIN}/blog/${post.slug}`
        },
        "headline": post.title,
        "description": post.meta_description || post.excerpt,
        "image": post.featured_image_url || `${DOMAIN}/og-default.jpg`,
        "datePublished": post.published_at,
        "dateModified": post.updated_at || post.published_at,
        "author": { 
            "@type": "Organization", 
            "name": "Umunna Stays Editorial",
            "url": DOMAIN
        },
        "publisher": {
            "@type": "Organization",
            "name": "Umunna Stays",
            "logo": { 
                "@type": "ImageObject", 
                "url": `${DOMAIN}/logo.png` 
            }
        }
    })}
    </script>
</head>
<body class="bg-slate-50 antialiased">
    <nav class="bg-white border-b border-slate-100 py-6 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <a href="/" class="font-black text-xl tracking-tighter">UMUNNA STAYS</a>
            <div class="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <a href="/stays" class="hover:text-slate-900 transition-colors">Stays</a>
                <a href="/blog" class="text-slate-900">Journal</a>
            </div>
        </div>
    </nav>

    <main class="max-w-4xl mx-auto px-4 py-20">
        <header class="text-center mb-16">
            <div class="text-[#C46210] font-black text-[10px] uppercase tracking-[0.3em] mb-4">${post.category || 'Travel Intelligence'}</div>
            <h1 class="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
                ${post.title}
            </h1>
            <div class="flex items-center justify-center gap-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                <span>Reflected from Authority</span>
                <div class="w-1 h-1 bg-slate-200 rounded-full"></div>
                <span>${new Date(post.published_at).toLocaleDateString()}</span>
            </div>
        </header>

        ${post.featured_image_url ? `
        <div class="w-full h-[500px] rounded-[50px] overflow-hidden mb-16 shadow-2xl border border-slate-100">
            <img src="${post.featured_image_url}" alt="${post.title}" class="w-full h-full object-cover" />
        </div>
        ` : ''}

        <article class="prose prose-lg prose-slate max-w-none">
            <div class="font-medium text-slate-700 leading-[1.6]">
                ${post.content}
            </div>
        </article>

        <footer class="mt-24 pt-12 border-t border-slate-100 flex justify-between items-center">
            <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                © ${new Date().getFullYear()} Umunna Stays Inc.
            </div>
            <a href="/blog" class="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Back to Journal</a>
        </footer>
    </main>

    <!-- 🟢 OPTION A: PURE SEO MODE — NO REACT HYDRATION ON ARTICLE BODY -->
    <!-- JS only used for global elements like header/footer if needed -->
    <!-- <script type="module" src="/${mainJs}"></script> -->
</body>
</html>`;

        fs.writeFileSync(path.join(postDir, 'index.html'), html);
        console.log(`✅ DETERMINISTIC SNAPSHOT: /blog/${post.slug}`);
    });

    console.log(`📊 SSG Complete. ${posts.length} pages exposed.`);

    // Final Pipeline Validation
    if (!fs.existsSync(blogRoot)) {
        console.error("❌ PIPELINE_INCOMPLETE: dist/blog/ was not created.");
        process.exit(1);
    }
}

generateStaticBlog();
