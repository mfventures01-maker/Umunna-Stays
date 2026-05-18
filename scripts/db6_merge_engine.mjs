import fs from "fs";
import path from "path";

const base = process.cwd();

const revenue = JSON.parse(fs.readFileSync(path.join(base, "revenue_index.json"), "utf8"));
const healing = JSON.parse(fs.readFileSync(path.join(base, "self_healing_report.json"), "utf8"));
const leads = JSON.parse(fs.readFileSync(path.join(base, "lead_intelligence_report.json"), "utf8"));
const raw = JSON.parse(fs.readFileSync(path.join(base, "umunna_properties_20.json"), "utf8"));

const properties = raw.properties || [];

const find = (id, arr) => arr.find(x => x.property_id === id) || {};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const merged = properties.map(p => {
  const r = find(p.property_id, revenue);
  const h = find(p.property_id, healing);
  const l = find(p.property_id, leads);

  const intelligence_score = clamp(
    (r.rpi || 0) * 0.35 +
    (r.cp_score || 0) * 0.25 +
    (h.seo_health || 0) * 0.2 +
    (l.conversion_probability || 0) * 0.2,
    0,
    100
  );

  return {
    property_id: p.property_id,
    name: p.name,
    seo_score: r.seo_score || 0,
    ai_index_score: r.ai_index_score || 0,
    revenue_tier: r.tier || "UNKNOWN",
    rpi: r.rpi || 0,
    cp_score: r.cp_score || 0,
    seo_health: h.seo_health || 0,
    slug: h.slug || "",
    meta_description: h.meta_description || "",
    keywords: h.keywords || [],
    traveler_type: l.traveler_type || "General",
    conversion_probability: l.conversion_probability || 0,
    urgency_level: l.urgency_level || "COLD",
    high_ticket_probability: l.high_ticket_probability || 0,
    intelligence_score: Math.round(intelligence_score),
    activation_mode:
      intelligence_score >= 80 ? "AUTO_PUSH" :
      intelligence_score >= 60 ? "ACTIVE_SELL" :
      intelligence_score >= 40 ? "NURTURE" :
      "IGNORE"
  };
});

fs.writeFileSync(
  path.join(base, "property_intelligence_graph.json"),
  JSON.stringify(merged, null, 2)
);

console.log("? DB-6 MERGE COMPLETE");
console.log("?? property_intelligence_graph.json generated");
