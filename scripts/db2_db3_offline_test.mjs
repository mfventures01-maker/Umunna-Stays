import fs from "fs";
import path from "path";

const data = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "umunna_properties_20.json"),
    "utf8"
  )
);

const properties = data.properties || [];

// helpers
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function seoScore(p) {
  let score = 0;
  score += p.name ? 10 : 0;
  score += p.city ? 10 : 0;
  score += p.state ? 10 : 0;
  score += p.category ? 10 : 0;
  score += p.hero_image_url ? 10 : 0;
  score += p.about_this_space ? 20 : 0;
  score += p.bedrooms ? 10 : 0;
  score += p.nightly_rate ? 10 : 0;
  score += (p.badges?.length || 0) * 2;
  return clamp(score, 0, 100);
}

function aiScore(p) {
  let score = 0;
  score += p.name ? 15 : 0;
  score += p.city ? 10 : 0;
  score += p.state ? 10 : 0;
  score += p.about_this_space ? 20 : 0;
  score += p.bedrooms ? 15 : 0;
  score += p.capacity ? 10 : 0;
  score += p.hero_image_url ? 10 : 0;
  score += 10; // offline schema assumption
  return clamp(score, 0, 100);
}

function cpScore(seo, ai, rate) {
  let score = (seo * 0.3) + (ai * 0.4);
  if (rate) score += Math.max(0, 20 - rate / 50000);
  return clamp(score, 0, 100);
}

function rpi(cp, rate) {
  return clamp((cp * 0.6) + (rate ? rate / 10000 : 0), 0, 100);
}

function tier(rpi) {
  if (rpi >= 80) return "PUSH";
  if (rpi >= 60) return "STEADY";
  if (rpi >= 40) return "OPTIMIZE";
  return "REBUILD";
}

const results = properties.map(p => {
  const seo = seoScore(p);
  const ai = aiScore(p);
  const cp = cpScore(seo, ai, p.nightly_rate);
  const r = rpi(cp, p.nightly_rate);

  return {
    property_id: p.property_id,
    name: p.name,
    seo_score: seo,
    ai_index_score: ai,
    cp_score: Math.round(cp),
    rpi: Math.round(r),
    tier: tier(r)
  };
});

fs.writeFileSync(
  path.join(process.cwd(), "revenue_index.json"),
  JSON.stringify(results, null, 2)
);

console.log("? DB-2 + DB-3 OFFLINE STRESS TEST COMPLETE");
console.log("?? Output: revenue_index.json generated");
