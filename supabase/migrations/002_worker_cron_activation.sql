-- =====================================================================
-- UMUNNA WORKER ENGINE v1 — CRON ACTIVATION
--
-- Schedules the Worker Engine Edge Function to run every 60 seconds
-- using pg_cron + pg_net (Supabase built-in extensions).
--
-- PREREQUISITES:
--  1. Enable pg_cron extension:  CREATE EXTENSION IF NOT EXISTS pg_cron;
--  2. Enable pg_net extension:   CREATE EXTENSION IF NOT EXISTS pg_net;
--  3. Deploy the Edge Function:  supabase functions deploy worker
--  4. Run this SQL in the Supabase SQL Editor
--
-- IMPORTANT: Replace PROJECT_REF and SERVICE_ROLE_KEY with your values.
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─── Schedule: Every 60 seconds ──────────────────────────────────────────────

SELECT cron.schedule(
    'umunna-worker-engine',       -- job name (unique identifier)
    '* * * * *',                  -- every minute
    $$
    SELECT net.http_post(
        url    := 'https://PROJECT_REF.supabase.co/functions/v1/worker',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer SERVICE_ROLE_KEY'
        ),
        body   := '{}'::jsonb
    );
    $$
);

-- ─── Verification: List active cron jobs ─────────────────────────────────────

-- Run this to verify the cron job was created:
-- SELECT * FROM cron.job WHERE jobname = 'umunna-worker-engine';

-- ─── Management Commands ─────────────────────────────────────────────────────

-- To pause the worker:
-- SELECT cron.unschedule('umunna-worker-engine');

-- To check recent execution history:
-- SELECT * FROM cron.job_run_details
--     WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'umunna-worker-engine')
--     ORDER BY start_time DESC
--     LIMIT 10;
