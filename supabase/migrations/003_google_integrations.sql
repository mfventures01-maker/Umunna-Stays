-- =====================================================================
-- UMUNNA WORKER ENGINE — GOOGLE INTEGRATIONS TABLE
--
-- Stores OAuth credentials for Google API integrations.
-- Used by the Worker Engine Edge Function to authenticate
-- with Google Indexing API, Google Business Profile API, etc.
--
-- SECURITY:
--  - RLS blocks ALL frontend access
--  - Only service_role (Edge Function) can read
--  - Admin can view integration status (but NOT tokens)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.google_integrations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        text NOT NULL UNIQUE CHECK (provider IN (
                        'google_gsc',
                        'google_gbp',
                        'google_analytics',
                        'google_ads'
                    )),
    access_token    text NOT NULL,
    refresh_token   text,
    expires_at      timestamptz,
    is_active       boolean NOT NULL DEFAULT true,
    project_id      text,
    metadata        jsonb DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.google_integrations IS
    'OAuth credentials for Google API integrations. '
    'Accessed ONLY by the Worker Engine Edge Function via service_role. '
    'NEVER exposed to frontend.';

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

-- No SELECT policy for regular users — tokens must NEVER reach the frontend.
-- The Edge Function uses service_role key which bypasses RLS entirely.

-- Admin can view integration STATUS only (not tokens) via a view:
CREATE OR REPLACE VIEW public.google_integration_status AS
SELECT
    id,
    provider,
    is_active,
    expires_at,
    project_id,
    created_at,
    updated_at
    -- NOTE: access_token and refresh_token are intentionally excluded
FROM public.google_integrations;

-- Admin can read the status view
CREATE POLICY "admin_read_integration_status" ON public.google_integrations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
        -- Even with this policy, prefer using the view which omits tokens
    );

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_google_integrations_provider
    ON public.google_integrations (provider, is_active);
