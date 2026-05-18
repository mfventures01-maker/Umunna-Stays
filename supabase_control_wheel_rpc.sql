-- 🧠 CONTROL WHEEL AUTHORITY LAYER (RPC)
-- Run this in your Supabase SQL Editor to enable deterministic governance.

-- 1. SAVE DRAFT (INTENT)
create or replace function cms_save_draft(p_post jsonb)
returns jsonb
language plpgsql
as $$
declare
    v_id uuid;
begin
    v_id := (p_post->>'id')::uuid;
    
    if v_id is null then
        insert into posts (
            title, content, excerpt, category, 
            featured_image_url, image_alt, meta_title, 
            meta_description, focus_keyword,
            lifecycle_state, version_number
        )
        values (
            p_post->>'title', p_post->>'content', p_post->>'excerpt', p_post->>'category',
            p_post->>'featured_image_url', p_post->>'image_alt', p_post->>'meta_title',
            p_post->>'meta_description', p_post->>'focus_keyword',
            'draft', 1
        )
        returning id into v_id;
    else
        update posts
        set title = p_post->>'title',
            content = p_post->>'content',
            excerpt = p_post->>'excerpt',
            category = p_post->>'category',
            featured_image_url = p_post->>'featured_image_url',
            image_alt = p_post->>'image_alt',
            meta_title = p_post->>'meta_title',
            meta_description = p_post->>'meta_description',
            focus_keyword = p_post->>'focus_keyword',
            version_number = version_number + 1,
            last_audit_event = 'DRAFT_SAVED'
        where id = v_id;
    end if;

    return jsonb_build_object('id', v_id, 'status', 'success');
end;
$$;

-- 2. REQUEST REVIEW (LIFECYCLE TRANSITION)
create or replace function cms_request_review(p_post_id uuid)
returns void
language plpgsql
as $$
begin
    update posts
    set lifecycle_state = 'review',
        last_audit_event = 'REVIEW_REQUESTED'
    where id = p_post_id;
end;
$$;

-- 3. PUBLISH (AUTHORITY COMMAND)
create or replace function cms_publish(p_post_id uuid)
returns jsonb
language plpgsql
as $$
declare
    v_seo_score numeric;
begin
    -- 1. Fetch current SEO score for snapshot
    select seo_score into v_seo_score from posts where id = p_post_id;

    -- 2. Execute Deterministic State Transition
    update posts
    set lifecycle_state = 'published',
        status = 'published',
        published_at = now(),
        index_status = 'indexed', -- Affirmative indexing intent
        is_locked = true, -- Freeze content
        last_audit_event = 'AUTHORITATIVE_PUBLISH',
        seo_snapshot = jsonb_build_object(
            'score', v_seo_score,
            'timestamp', now(),
            'governance', 'PASSED'
        )
    where id = p_post_id 
    and lifecycle_state in ('review', 'scheduled');

    -- 3. Trigger Sitemap Refresh Flag & Vercel Deploy Hook
    insert into audit_logs (post_id, action, metadata)
    values (p_post_id, 'SITEMAP_QUEUED', jsonb_build_object('url_slug', (select slug from posts where id = p_post_id)));

    -- ⚡ DEPLOYMENT HOOK INTEGRATION
    -- This emits the intent for the Incremental Rebuild System.
    -- In a live environment, a Supabase Edge Function listens to this table 
    -- and calls the Vercel Deploy Hook URL.
    insert into audit_logs (post_id, action, metadata)
    values (p_post_id, 'VERCEL_REBUILD_TRIGGERED', jsonb_build_object(
        'reason', 'AUTHORITATIVE_PUBLISH',
        'timestamp', now(),
        'mode', 'INCREMENTAL'
    ));

    -- Note: To fully automate, enable pg_net and uncomment:
    -- perform net.http_post(
    --   url := 'https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID',
    --   body := '{}'
    -- );

    return jsonb_build_object('status', 'success', 'lifecycle', 'published');
end;
$$;

-- 4. ARCHIVE
create or replace function cms_archive(p_post_id uuid)
returns void
language plpgsql
as $$
begin
    update posts
    set lifecycle_state = 'archived',
        status = 'draft',
        last_audit_event = 'DEEP_ARCHIVE_LOCK'
    where id = p_post_id;
end;
$$;

-- 5. RECORD INDEXING (SEO REFLECTOR)
create or replace function cms_record_indexing(
    p_post_id uuid,
    p_url text,
    p_status text,
    p_method text
)
returns void
language plpgsql
as $$
begin
    insert into index_verification (post_id, url, is_indexed, method, status_details)
    values (p_post_id, p_url, p_status = 'indexed', p_method, 'Reflected from Cockpit');
    
    update posts
    set index_status = p_status,
        last_audit_event = 'INDEX_VERIFIED'
    where id = p_post_id;
end;
$$;
