import fs from "fs";
import path from "path";

const data = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "umunna_properties_20.json"),
    "utf8"
  )
);

const properties = data.properties || [];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function detectTravelerType(p) {
  const badges = (p.badges || []).join(" ").toLowerCase();
  const text = (p.about_this_space || "").toLowerCase();

  if (
    badges.includes("cinema") ||
    badges.includes("jacuzzi") ||
    text.includes("luxury")
  ) {
    return "Luxury Traveler";
  }

  if (
    text.includes("business") ||
    text.includes("workspace") ||
    text.includes("executive")
  ) {
    return "Business Traveler";
  }

  if (
    text.includes("family") ||
    p.bedrooms >= 3
  ) {
    return "Family Traveler";
  }

  return "General Traveler";
}

function conversionProbability(p) {
  let score = 40;

  if (p.hero_image_url) score += 10;
  if (p.about_this_space?.length > 200) score += 15;
  if ((p.badges?.length || 0) >= 4) score += 15;
  if (p.is_featured) score += 10;
  if (p.bedrooms >= 3) score += 10;

  return clamp(score, 1, 100);
}

function highTicketProbability(p) {
  let score = 20;

  if (p.nightly_rate >= 150000) score += 40;
  if (p.category?.toLowerCase().includes("luxury")) score += 20;
  if ((p.badges?.length || 0) >= 5) score += 10;
  if (p.bedrooms >= 4) score += 10;

  return clamp(score, 1, 100);
}

function urgencyLevel(cp) {
  if (cp >= 85) return "HOT";
  if (cp >= 70) return "WARM";
  if (cp >= 50) return "ACTIVE";
  return "COLD";
}

const intelligence = properties.map(p => {
  const traveler = detectTravelerType(p);
  const cp = conversionProbability(p);
  const htp = highTicketProbability(p);

  return {
    property_id: p.property_id,
    name: p.name,
    traveler_type: traveler,
    conversion_probability: cp,
    high_ticket_probability: htp,
    urgency_level: urgencyLevel(cp)
  };
});

fs.writeFileSync(
  path.join(process.cwd(), "lead_intelligence_report.json"),
  JSON.stringify(intelligence, null, 2)
);

console.log("? DB-5 LEAD INTELLIGENCE COMPLETE");
console.log("?? Output: lead_intelligence_report.json");
