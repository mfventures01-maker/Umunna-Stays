import fs from "fs";
import path from "path";

const base = process.cwd();

const graph = JSON.parse(
  fs.readFileSync(path.join(base, "property_intelligence_graph.json"), "utf8")
);

const actions = [];

function buildAction(p) {
  const baseAction = {
    property_id: p.property_id,
    name: p.name,
    mode: p.activation_mode,
    timestamp: new Date().toISOString()
  };

  switch (p.activation_mode) {

    case "AUTO_PUSH":
      return {
        ...baseAction,
        actions: [
          "boost_seo_priority",
          "push_featured_listing",
          "trigger_paid_ads_campaign",
          "whatsapp_broadcast_high_intent",
          "inject_sitemap_priority_1"
        ]
      };

    case "ACTIVE_SELL":
      return {
        ...baseAction,
        actions: [
          "retargeting_ads",
          "whatsapp_followup_sequence",
          "urgency_content_generation",
          "email_drip_campaign"
        ]
      };

    case "NURTURE":
      return {
        ...baseAction,
        actions: [
          "blog_story_injection",
          "seo_internal_linking",
          "social_media_soft_push",
          "lead_capture_optimization"
        ]
      };

    default:
      return {
        ...baseAction,
        actions: [
          "hold_no_spend",
          "collect_more_data"
        ]
      };
  }
}

graph.forEach(p => actions.push(buildAction(p)));

fs.writeFileSync(
  path.join(base, "execution_plan.json"),
  JSON.stringify(actions, null, 2)
);

console.log("?? DB-7 EXECUTION ENGINE COMPLETE");
console.log("?? Output: execution_plan.json generated");
