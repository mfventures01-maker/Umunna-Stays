import fs from "fs";
import path from "path";

const base = process.cwd();

const execPlan = JSON.parse(
  fs.readFileSync(path.join(base, "execution_plan.json"), "utf8")
);

const raw = JSON.parse(
  fs.readFileSync(path.join(base, "umunna_properties_20.json"), "utf8")
);

const properties = raw.properties || [];

// index execution plan
const planMap = new Map();
execPlan.forEach(p => planMap.set(p.property_id, p));

function enrichSEO(p, plan) {
  let seoBoost = 0;

  if (plan.mode === "AUTO_PUSH") seoBoost += 30;
  if (plan.mode === "ACTIVE_SELL") seoBoost += 20;
  if (plan.mode === "NURTURE") seoBoost += 10;

  const keywords = [
    ...(p.city ? [p.city + " luxury stays"] : []),
    ...(p.category ? [p.category + " Nigeria"] : []),
    "short let Nigeria",
    "Umunna Stays booking"
  ];

  return {
    ...p,

    // CMS AUTOPILOT FIELDS
    seo_priority_score: seoBoost,
    seo_keywords: keywords,
    seo_slug: (p.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),

    seo_meta:
      `${p.name} in ${p.city}, ${p.state}. Book verified short-let apartments in Nigeria with Umunna Stays.`,

    cms_activation_mode: plan.mode,
    cms_actions: plan.actions,

    search_index_boost:
      plan.mode === "AUTO_PUSH" ? "HIGH" :
      plan.mode === "ACTIVE_SELL" ? "MEDIUM" :
      "LOW"
  };
}

const enriched = properties.map(p => {
  const plan = planMap.get(p.property_id) || {
    mode: "IGNORE",
    actions: []
  };

  return enrichSEO(p, plan);
});

fs.writeFileSync(
  path.join(base, "cms_autopilot_output.json"),
  JSON.stringify(enriched, null, 2)
);

console.log("?? DB-8A CMS AUTOPILOT COMPLETE");
console.log("?? Output: cms_autopilot_output.json generated");
