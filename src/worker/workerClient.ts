/**
 * workerClient.ts — Frontend Bridge to Worker Engine
 *
 * Provides type-safe RPC wrappers for enqueuing jobs into the Worker Engine.
 * All calls go through the `enqueue_job` RPC which enforces admin-only access.
 *
 * USAGE:
 *   import { enqueueGBPIngest, enqueueGSCIndex } from './workerClient';
 *   await enqueueGBPIngest({ id: 'umunna-owerri', name: 'Umunna Stays' });
 */

import { supabase } from '../lib/supabaseClient';

// ─── Job Types ────────────────────────────────────────────────────────────────

export type JobType = 'GBP_INGEST' | 'GSC_INDEX' | 'BLOG_PUBLISH' | 'PROPERTY_SYNC';

export interface EnqueueResult {
  jobId: string | null;
  error: string | null;
}

// ─── Core Enqueue ─────────────────────────────────────────────────────────────

/** Enqueue a job into the Worker Engine via RPC. Admin-only. */
export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown> = {}
): Promise<EnqueueResult> {
  if (!supabase) {
    return { jobId: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.rpc('enqueue_job', {
      p_type: type,
      p_payload: payload,
    });

    if (error) {
      console.error(`[WorkerClient] Failed to enqueue ${type}:`, error.message);
      return { jobId: null, error: error.message };
    }

    console.log(`[WorkerClient] Enqueued ${type} → job ${data}`);
    return { jobId: data as string, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { jobId: null, error: message };
  }
}

// ─── Typed Pipeline Helpers ───────────────────────────────────────────────────

/** Enqueue a Google Business Profile ingestion job. */
export function enqueueGBPIngest(payload: {
  id: string;
  name?: string;
  [key: string]: unknown;
}): Promise<EnqueueResult> {
  return enqueueJob('GBP_INGEST', payload);
}

/** Enqueue a Google Search Console indexing submission. */
export function enqueueGSCIndex(payload: {
  url: string;
  [key: string]: unknown;
}): Promise<EnqueueResult> {
  return enqueueJob('GSC_INDEX', payload);
}

/** Enqueue a blog post publish job. */
export function enqueueBlogPublish(payload: {
  post_id: string;
  [key: string]: unknown;
}): Promise<EnqueueResult> {
  return enqueueJob('BLOG_PUBLISH', payload);
}

/** Enqueue a property sync job. */
export function enqueuePropertySync(payload: {
  property_id: string;
  [key: string]: unknown;
}): Promise<EnqueueResult> {
  return enqueueJob('PROPERTY_SYNC', payload);
}

// ─── Queue Status Queries ─────────────────────────────────────────────────────

export interface JobStatus {
  id: string;
  type: string;
  status: string;
  error: string | null;
  created_at: string;
  processed_at: string | null;
  retry_count: number;
}

/** Fetch recent jobs from the queue. Admin-only (RLS enforced). */
export async function getRecentJobs(limit = 20): Promise<JobStatus[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('job_queue')
    .select('id, type, status, error, created_at, processed_at, retry_count')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[WorkerClient] Failed to fetch jobs:', error.message);
    return [];
  }

  return (data as JobStatus[]) || [];
}

/** Fetch job audit log entries. Admin-only (RLS enforced). */
export async function getAuditLog(limit = 50): Promise<{
  job_id: string;
  job_type: string;
  status: string;
  error: string | null;
  executed_at: string;
}[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('job_audit_log')
    .select('job_id, job_type, status, error, executed_at')
    .order('executed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[WorkerClient] Failed to fetch audit log:', error.message);
    return [];
  }

  return data || [];
}
