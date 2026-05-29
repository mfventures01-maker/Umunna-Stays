-- =====================================================================
-- UMUNNA WORKER ENGINE v1 — DATABASE SCHEMA
-- 
-- Creates the job_queue table, pipeline tables, and RLS policies
-- required by the Worker Engine Edge Function.
--
-- Run this in Supabase SQL Editor BEFORE deploying the Edge Function.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. JOB QUEUE — Central execution queue
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.job_queue (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type            text NOT NULL CHECK (type IN (
                        'GBP_INGEST',
                        'GSC_INDEX',
                        'BLOG_PUBLISH',
                        'PROPERTY_SYNC'
                    )),
    status          text NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending',
                        'processing',
                        'done',
                        'failed'
                    )),
    payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
    error           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    locked_at       timestamptz,
    processed_at    timestamptz,
    retry_count     int NOT NULL DEFAULT 0,
    max_retries     int NOT NULL DEFAULT 3,
    created_by      uuid REFERENCES auth.users(id)
);

-- Index for the worker's fetch query (pending jobs ordered by creation)
CREATE INDEX IF NOT EXISTS idx_job_queue_pending
    ON public.job_queue (status, created_at ASC)
    WHERE status = 'pending';

-- Index for stale lock detection
CREATE INDEX IF NOT EXISTS idx_job_queue_locked
    ON public.job_queue (status, locked_at)
    WHERE status = 'processing';

COMMENT ON TABLE public.job_queue IS
    'Central job queue for the Umunna Worker Engine. '
    'All backend automation tasks flow through this table.';


-- ---------------------------------------------------------------------
-- 2. GBP ENTITIES — Google Business Profile ingestion targets
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.gbp_entities (
    id              text PRIMARY KEY,
    data            jsonb NOT NULL DEFAULT '{}'::jsonb,
    sync_status     text NOT NULL DEFAULT 'pending' CHECK (sync_status IN (
                        'pending', 'synced', 'failed'
                    )),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.gbp_entities IS
    'Google Business Profile entities ingested by the Worker Engine.';


-- ---------------------------------------------------------------------
-- 3. SEO PUBLISH CHECKS — GSC indexing submission log
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.seo_publish_checks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url             text NOT NULL,
    status          text NOT NULL DEFAULT 'submitted' CHECK (status IN (
                        'submitted', 'indexed', 'failed', 'deindexed'
                    )),
    submitted_at    timestamptz NOT NULL DEFAULT now(),
    verified_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate URL submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_publish_checks_url
    ON public.seo_publish_checks (url);

COMMENT ON TABLE public.seo_publish_checks IS
    'Tracks URLs submitted to Google Search Console for indexing.';


-- ---------------------------------------------------------------------
-- 4. BLOG POSTS — Add worker-compatible columns if missing
-- ---------------------------------------------------------------------

-- If blog_posts already exists, add the published_at column
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'blog_posts'
    ) THEN
        ALTER TABLE public.blog_posts
            ADD COLUMN IF NOT EXISTS published_at timestamptz;
    END IF;
END $$;


-- ---------------------------------------------------------------------
-- 5. PROPERTIES — Add sync_status column if missing
-- ---------------------------------------------------------------------

DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'properties'
    ) THEN
        ALTER TABLE public.properties
            ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending';
        ALTER TABLE public.properties
            ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
    END IF;
END $$;


-- ---------------------------------------------------------------------
-- 6. JOB AUDIT LOG — Immutable execution history
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.job_audit_log (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          uuid NOT NULL,
    job_type        text NOT NULL,
    status          text NOT NULL,
    error           text,
    payload_summary jsonb,
    executed_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_audit_log_job_id
    ON public.job_audit_log (job_id);

CREATE INDEX IF NOT EXISTS idx_job_audit_log_executed_at
    ON public.job_audit_log (executed_at DESC);

COMMENT ON TABLE public.job_audit_log IS
    'Immutable audit trail of all worker engine job executions.';


-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gbp_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_publish_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role (Edge Function) gets full access via service_role key
-- Admin users can read job_queue and audit logs

CREATE POLICY "admin_read_job_queue" ON public.job_queue
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "admin_insert_job_queue" ON public.job_queue
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "admin_read_audit_log" ON public.job_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "admin_read_gbp" ON public.gbp_entities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "admin_read_seo_checks" ON public.seo_publish_checks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
    );


-- ---------------------------------------------------------------------
-- 8. RPC — Enqueue a job from frontend (admin-only)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enqueue_job(
    p_type text,
    p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_job_id uuid;
    v_role text;
BEGIN
    -- Verify caller is admin
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF v_role IS NULL OR v_role NOT IN ('super_admin', 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: admin role required to enqueue jobs';
    END IF;

    INSERT INTO public.job_queue (type, payload, created_by)
    VALUES (p_type, p_payload, auth.uid())
    RETURNING id INTO v_job_id;

    RETURN v_job_id;
END;
$$;

COMMENT ON FUNCTION public.enqueue_job IS
    'RPC to enqueue a job into the worker engine. Admin-only.';
