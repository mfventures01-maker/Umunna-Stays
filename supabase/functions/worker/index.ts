/**
 * Umunna Worker Engine v1 — Supabase Edge Function
 *
 * EXECUTION CONTRACT:
 *  - Invoked every 60 seconds by pg_cron → net.http_post
 *  - Fetches up to MAX_BATCH pending jobs from job_queue
 *  - Locks each job before processing (prevents double-execution)
 *  - Dispatches to type-specific handler
 *  - Marks job done/failed with audit trail
 *  - Handles stale lock recovery (jobs stuck > 5 minutes)
 *
 * JOB TYPES:
 *  GBP_INGEST    → Google Business Profile entity ingestion
 *  GSC_INDEX     → Google Search Console URL submission
 *  BLOG_PUBLISH  → Blog post status transition to published
 *  PROPERTY_SYNC → Property sync status update
 *
 * SECURITY:
 *  - Uses SUPABASE_SERVICE_ROLE_KEY (full DB access)
 *  - Never exposed to frontend
 *  - All operations logged to job_audit_log
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Configuration ────────────────────────────────────────────────────────────

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const MAX_BATCH = 10;
const STALE_LOCK_MINUTES = 5;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown>;
  retry_count: number;
  max_retries: number;
  created_at: string;
  locked_at: string | null;
}

interface ProcessResult {
  jobId: string;
  type: string;
  status: "done" | "failed";
  error?: string;
  durationMs: number;
}

// ─── Queue Engine ─────────────────────────────────────────────────────────────

/** Fetch pending jobs, oldest first. Also recovers stale locked jobs. */
async function fetchJobs(): Promise<Job[]> {
  // First, recover any stale locks (processing for > STALE_LOCK_MINUTES)
  const staleThreshold = new Date(
    Date.now() - STALE_LOCK_MINUTES * 60 * 1000
  ).toISOString();

  await supabase
    .from("job_queue")
    .update({ status: "pending", locked_at: null })
    .eq("status", "processing")
    .lt("locked_at", staleThreshold);

  // Now fetch pending jobs
  const { data, error } = await supabase
    .from("job_queue")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(MAX_BATCH);

  if (error) {
    console.error("[Worker] Failed to fetch jobs:", error.message);
    return [];
  }

  return (data as Job[]) || [];
}

/** Lock a job to prevent double-execution. Uses optimistic locking. */
async function lockJob(jobId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("job_queue")
    .update({
      status: "processing",
      locked_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "pending")
    .select("id");

  if (error || !data || data.length === 0) {
    console.warn(`[Worker] Failed to lock job ${jobId} — already claimed`);
    return false;
  }

  return true;
}

/** Mark a job as successfully completed. */
async function markDone(jobId: string): Promise<void> {
  await supabase
    .from("job_queue")
    .update({
      status: "done",
      processed_at: new Date().toISOString(),
      error: null,
    })
    .eq("id", jobId);
}

/** Mark a job as failed. Retries if under max_retries threshold. */
async function markFailed(
  job: Job,
  errorMessage: string
): Promise<void> {
  const newRetryCount = job.retry_count + 1;
  const shouldRetry = newRetryCount < job.max_retries;

  await supabase
    .from("job_queue")
    .update({
      status: shouldRetry ? "pending" : "failed",
      error: errorMessage,
      retry_count: newRetryCount,
      locked_at: null,
      ...(shouldRetry ? {} : { processed_at: new Date().toISOString() }),
    })
    .eq("id", job.id);

  if (shouldRetry) {
    console.log(
      `[Worker] Job ${job.id} failed (attempt ${newRetryCount}/${job.max_retries}), will retry`
    );
  }
}

/** Write an immutable audit log entry. */
async function writeAuditLog(
  job: Job,
  status: "done" | "failed",
  error?: string
): Promise<void> {
  await supabase.from("job_audit_log").insert({
    job_id: job.id,
    job_type: job.type,
    status,
    error: error ?? null,
    payload_summary: {
      keys: Object.keys(job.payload),
      type: job.type,
    },
  });
}

// ─── Google Integration Access Layer ──────────────────────────────────────────

/**
 * Retrieve active Google integration credentials from the backend authority layer.
 * Uses the existing worker Supabase client (service role — full DB access).
 * Throws a deterministic error if the integration is missing or inactive.
 */
async function getGoogleIntegration(provider: string): Promise<{
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  provider: string;
  is_active: boolean;
  [key: string]: unknown;
}> {
  const { data, error } = await supabase
    .from("google_integrations")
    .select("*")
    .eq("provider", provider)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw new Error(
      `Missing Google integration for "${provider}": ${
        error?.message ?? "no active record found"
      }`
    );
  }

  if (!data.access_token) {
    throw new Error(
      `Google integration for "${provider}" exists but has no access_token`
    );
  }

  return data as {
    access_token: string;
    refresh_token: string | null;
    expires_at: string | null;
    provider: string;
    is_active: boolean;
  };
}

// ─── Pipeline Handlers ────────────────────────────────────────────────────────

/** GBP_INGEST — Ingest Google Business Profile entity */
async function handleGBP(payload: Record<string, unknown>): Promise<void> {
  const entityId = payload.id as string;
  if (!entityId) throw new Error("GBP_INGEST requires payload.id");

  const { error } = await supabase.from("gbp_entities").upsert({
    id: entityId,
    data: payload,
    sync_status: "synced",
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`GBP upsert failed: ${error.message}`);
  console.log(`[Worker:GBP] Ingested entity: ${entityId}`);
}

/**
 * GSC_INDEX — Real Google Indexing API execution pipeline.
 *
 * EXECUTION FLOW:
 *  1. Validate payload.url
 *  2. Retrieve active OAuth token from google_integrations
 *  3. POST to Google Indexing API v3 (urlNotifications:publish)
 *  4. Validate API response
 *  5. Record submission in seo_publish_checks
 *  6. Log result for observability
 *
 * SECURITY:
 *  - Tokens never leave the Edge Function
 *  - Credentials fetched from backend authority layer only
 *  - All failures propagate to the retry system
 */
async function handleGSC(payload: Record<string, unknown>): Promise<void> {
  const url = payload.url as string;
  if (!url) throw new Error("GSC_INDEX requires payload.url");

  // Step 1: Retrieve Google OAuth credentials from backend
  const integration = await getGoogleIntegration("google_gsc");

  // Step 2: Execute real Google Indexing API call
  const response = await fetch(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        type: "URL_UPDATED",
      }),
    }
  );

  const result = await response.json();

  // Step 3: Validate API response
  if (!response.ok) {
    throw new Error(
      `Google Indexing API failed (${response.status}): ${JSON.stringify(result)}`
    );
  }

  // Step 4: Record successful submission in database
  const { error: dbError } = await supabase.from("seo_publish_checks").upsert(
    {
      url,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "url" }
  );

  if (dbError) {
    // API succeeded but DB write failed — log but don't throw
    // (the URL was actually indexed, we just failed to record it)
    console.error(
      `[Worker:GSC] API succeeded but DB write failed for ${url}: ${dbError.message}`
    );
  }

  console.log(
    `[Worker:GSC] Successfully indexed URL: ${url}`,
    `| API response: ${JSON.stringify(result)}`
  );
}

/** BLOG_PUBLISH — Transition blog post to published state */
async function handleBlog(payload: Record<string, unknown>): Promise<void> {
  const postId = payload.post_id as string;
  if (!postId) throw new Error("BLOG_PUBLISH requires payload.post_id");

  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) throw new Error(`Blog publish failed: ${error.message}`);
  console.log(`[Worker:Blog] Published post: ${postId}`);
}

/** PROPERTY_SYNC — Mark property as synced */
async function handleProperty(
  payload: Record<string, unknown>
): Promise<void> {
  const propertyId = payload.property_id as string;
  if (!propertyId)
    throw new Error("PROPERTY_SYNC requires payload.property_id");

  const { error } = await supabase
    .from("properties")
    .update({
      sync_status: "synced",
      updated_at: new Date().toISOString(),
    })
    .eq("property_id", propertyId);

  if (error) throw new Error(`Property sync failed: ${error.message}`);
  console.log(`[Worker:Property] Synced property: ${propertyId}`);
}

// ─── Dispatch Engine ──────────────────────────────────────────────────────────

/** Route a job to its type-specific handler. */
async function dispatchJob(
  job: Job
): Promise<void> {
  switch (job.type) {
    case "GBP_INGEST":
      await handleGBP(job.payload);
      break;

    case "GSC_INDEX":
      await handleGSC(job.payload);
      break;

    case "BLOG_PUBLISH":
      await handleBlog(job.payload);
      break;

    case "PROPERTY_SYNC":
      await handleProperty(job.payload);
      break;

    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

/** Process a single job through the full lifecycle. */
async function handleJob(job: Job): Promise<ProcessResult> {
  const start = Date.now();

  // Attempt to lock
  const locked = await lockJob(job.id);
  if (!locked) {
    return {
      jobId: job.id,
      type: job.type,
      status: "failed",
      error: "Lock acquisition failed — job already claimed",
      durationMs: Date.now() - start,
    };
  }

  try {
    await dispatchJob(job);
    await markDone(job.id);
    await writeAuditLog(job, "done");

    return {
      jobId: job.id,
      type: job.type,
      status: "done",
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown execution error";

    await markFailed(job, errorMessage);
    await writeAuditLog(job, "failed", errorMessage);

    return {
      jobId: job.id,
      type: job.type,
      status: "failed",
      error: errorMessage,
      durationMs: Date.now() - start,
    };
  }
}

// ─── Worker Loop (HTTP Entry Point) ───────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  // Optional: Verify authorization header for extra security
  const authHeader = req.headers.get("Authorization");
  const expectedKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (authHeader && expectedKey && !authHeader.includes(expectedKey)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const jobs = await fetchJobs();

    if (jobs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending jobs",
          processed: 0,
          durationMs: Date.now() - startTime,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[Worker] Processing ${jobs.length} job(s)...`);

    const results: ProcessResult[] = [];
    for (const job of jobs) {
      const result = await handleJob(job);
      results.push(result);
    }

    const succeeded = results.filter((r) => r.status === "done").length;
    const failed = results.filter((r) => r.status === "failed").length;

    console.log(
      `[Worker] Batch complete: ${succeeded} done, ${failed} failed, ${Date.now() - startTime}ms`
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        succeeded,
        failed,
        results,
        durationMs: Date.now() - startTime,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Worker loop error";
    console.error("[Worker] Fatal error:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        durationMs: Date.now() - startTime,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
