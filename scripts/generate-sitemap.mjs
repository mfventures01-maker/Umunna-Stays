import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env FIRST (deterministic)
dotenv.config();

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DOMAIN = "https://www.umunnastays.com.ng";

// 🔐 Hard safety gate (fail fast, but correctly)
if (!SUPABASE_URL) {
  console.error("❌ Missing SUPABASE_URL");
  process.exit(1);
}

if (!SUPABASE_KEY || SUPABASE_KEY.length < 40) {
  console.error("❌ Missing or invalid SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
  console.log("🚀 Starting Governed Sitemap Generation...");

  // 1. POSTS
  const { data: posts, error: postError } = await supabase
    .from('posts')
    .select('slug, updated_at, lifecycle_state')
    .eq('lifecycle_state', 'published');

  if (postError) {
    console.error("❌ Failed to fetch posts:", postError.message);
    process.exit(1);
  }

  // 2. PROPERTIES
 const { data: properties, error: propError } = await supabase
  .from('properties')
  .select('slug, city, created_at');
  if (propError) {
    console.error("❌ Failed to fetch properties:", propError.message);
    process.exit(1);
  }

  const staticPages = [
    '',
    '/stays',
    '/services',
    '/food',
    '/transport',
    '/host',
    '/blog'
  ];

  const urls = [];

  // Static pages
  for (const page of staticPages) {
    urls.push(`
  <url>
    <loc>${DOMAIN}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`);
  }

  // Blog posts
  for (const post of posts || []) {
    urls.push(`
  <url>
    <loc>${DOMAIN}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Properties
  for (const prop of properties || []) {
    urls.push(`
  <url>
    <loc>${DOMAIN}/stays/${prop.property_id}</loc>
    <lastmod>${new Date(prop.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  const distDir = path.join(process.cwd(), 'dist');

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml);
    console.log("✅ Sitemap mirrored to dist/");
  }

  console.log("✅ Sitemap generated successfully");
  console.log(`📊 Posts: ${posts?.length || 0}`);
  console.log(`📊 Properties: ${properties?.length || 0}`);
}

generateSitemap().catch((err) => {
  console.error("❌ Fatal sitemap error:", err);
  process.exit(1);
});