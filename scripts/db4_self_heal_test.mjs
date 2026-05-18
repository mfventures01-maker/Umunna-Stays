import fs from "fs";
import path from "path";

const raw = fs.readFileSync(
  path.join(process.cwd(), "umunna_properties_20.json"),
  "utf8"
);

const data = JSON.parse(raw);
const properties = data.properties || [];

const healLog = [];

function normalize(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function generateMetaDescription(p) {
  return normalize(
    `${p.name} is a premium ${p.category} in ${p.city}, ${p.state}. Book secure luxury accommodation with curated comfort, privacy, and concierge hospitality from Umunna Stays.`
  ).slice(0, 160);
}

function generateKeywords(p) {
  return [
    p.city,
    p.state,
    p.category,
    "short let",
    "luxury apartment",
    "Nigeria stays",
    "Umunna Stays",
    `${p.city} apartment`,
    `${p.city} short let`,
    `${p.category} in ${p.city}`
  ].filter(Boolean);
}

function scoreEntity(p) {
  let score = 0;

  if (p.name) score += 15;
  if (p.city) score += 10;
  if (p.state) score += 10;
  if (p.category) score += 10;
  if (p.hero_image_url) score += 15;
  if (p.about_this_space?.length > 120) score += 20;
  if (p.badges?.length >= 3) score += 10;
  if (p.host?.host_name) score += 10;

  return Math.min(score, 100);
}

const repaired = properties.map(p => {
  const repair_actions = [];

  if (!p.meta_description) {
    p.meta_description = generateMetaDescription(p);
    repair_actions.push("generated_meta_description");
  }

  if (!p.keywords) {
    p.keywords = generateKeywords(p);
    repair_actions.push("generated_keywords");
  }

  if (!p.slug) {
    p.slug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    repair_actions.push("generated_slug");
  }

  const seo_health = scoreEntity(p);

  if (seo_health < 70) {
    repair_actions.push("low_entity_score_flag");
  }

  return {
    property_id: p.property_id,
    name: p.name,
    seo_health,
    repair_actions,
    slug: p.slug,
    meta_description: p.meta_description,
    keywords: p.keywords
  };
});

fs.writeFileSync(
  path.join(process.cwd(), "self_healing_report.json"),
  JSON.stringify(repaired, null, 2)
);

console.log("? DB-4 SELF-HEAL ENGINE COMPLETE");
console.log("?? Output: self_healing_report.json");
