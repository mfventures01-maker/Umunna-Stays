import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use Service Role Key for backend administrative testing
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runTests() {
  console.log("Starting CMS Lifecycle Tests...");

  // Create a payload for SAVE_DRAFT
  const draftPayload = {
    title: "Test Draft " + Date.now(),
    slug: "test-draft-" + Date.now(),
    content: "<p>Hello World</p>",
    lifecycle_state: "draft",
    is_locked: false,
    version_number: 1,
    seo_snapshot: { score: 0, keyword: "test", density: 0 },
    last_audit_event: "",
    excerpt: "Test excerpt",
    category: "Test",
    featured_image_url: "",
    image_alt: "",
    meta_title: "",
    meta_description: "",
    search_intent: "informational",
    status: "draft",
    index_status: "pending",
    internal_link_count: 0,
    tags: ["test"]
  };

  console.log(`[CMS Gateway] Dispatching Action: SAVE_DRAFT`, draftPayload);
  let postId;
  
  const { data: saveDraftData, error: saveDraftError } = await supabase.rpc('cms_save_draft', { p_post: draftPayload });
  if (saveDraftError) {
    console.error("SAVE_DRAFT Governance rejection response:", saveDraftError);
  } else {
    console.log("SAVE_DRAFT Success response:", saveDraftData);
    postId = saveDraftData.post_id;
  }

  console.log("\nTEST B: Querying cms_audit_log...");
  const { data: auditLogs, error: auditError } = await supabase
    .from('cms_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (auditError) console.error(auditError);
  else console.log(auditLogs);

  if (postId) {
    console.log(`\nTEST C: Executing REQUEST_REVIEW on ${postId}`);
    console.log(`[CMS Gateway] Dispatching Action: REQUEST_REVIEW`);
    const { data: reviewData, error: reviewError } = await supabase.rpc('cms_request_review', { p_post_id: postId });
    if (reviewError) {
      console.error("REQUEST_REVIEW Rejection:", reviewError);
    } else {
      console.log("REQUEST_REVIEW Success:", reviewData);
    }

    console.log("\nQuerying posts table...");
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, status, lifecycle_state')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (postsError) console.error(postsError);
    else console.log(posts);
  }

}

runTests();
