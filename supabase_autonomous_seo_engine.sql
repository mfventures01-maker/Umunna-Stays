-- 🧠 AUTONOMOUS SEO INTELLIGENCE INFRASTRUCTURE
-- Final Evolution Layer: Telemetry, Observability, and AI Readiness.

-- 1. SEO PERFORMANCE MEMORY ENGINE (IMMUTABLE SNAPSHOTS)
create table if not exists seo_performance_snapshots (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references posts(id) on delete cascade,
    
    snapshot_date timestamptz default now(),
    
    impressions integer default 0,
    clicks integer default 0,
    ctr numeric default 0,
    average_position numeric default 0,
    
    indexed_at timestamptz,
    sitemap_included_at timestamptz,
    
    ranking_keywords jsonb default '[]',
    
    traffic_delta numeric default 0,
    ctr_delta numeric default 0,
    position_delta numeric default 0,
    
    decay_score numeric default 0,
    
    source text default 'google_search_console',
    created_at timestamptz default now()
);

-- Enforcement: Telemetry is IMMUTABLE
create or replace function protect_telemetry()
returns trigger as $$
begin
    raise exception 'SEO Telemetry is immutable. Overwriting history is forbidden by Governance.';
end;
$$ language plpgsql;

create trigger tr_protect_seo_snapshots
before update or delete on seo_performance_snapshots
for each row execute function protect_telemetry();


-- 2. GOOGLE SEARCH CONSOLE SYNC LAYER (READ-ONLY TELEMETRY)
create table if not exists google_search_console_sync (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references posts(id) on delete cascade,
    
    gsc_url text,
    impressions integer default 0,
    clicks integer default 0,
    ctr numeric default 0,
    average_position numeric default 0,
    
    index_status text,
    crawl_errors jsonb default '[]',
    ranking_keywords jsonb default '[]',
    
    last_synced_at timestamptz default now(),
    raw_payload jsonb,
    
    created_at timestamptz default now()
);


-- 3. REGENERATION RECOMMENDATION ENGINE (STRATEGIC ADVISOR)
create table if not exists seo_regeneration_recommendations (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references posts(id) on delete cascade,
    
    recommendation_type text check (recommendation_type in (
        'TITLE_REWRITE', 'META_DESCRIPTION_UPGRADE', 'SCHEMA_ENRICHMENT', 
        'INTERNAL_LINKING', 'FAQ_INSERTION', 'KEYWORD_EXPANSION', 'SEARCH_INTENT_SHIFT'
    )),
    recommendation_reason text,
    severity text check (severity in ('low', 'medium', 'high', 'critical')),
    
    recommended_actions jsonb default '[]',
    status text default 'pending' check (status in ('pending', 'applied', 'dismissed', 'archived')),
    
    created_at timestamptz default now()
);


-- 4. CONTENT DECAY DETECTION ENGINE (OBSERVABILITY)
create or replace function detect_content_decay(p_post_id uuid)
returns jsonb
language plpgsql
as $$
declare
    v_recent_snapshot record;
    v_previous_snapshot record;
    v_decay_score numeric := 0;
    v_signals text[] := array[]::text[];
begin
    -- Get latest two snapshots for comparison
    select * into v_recent_snapshot 
    from seo_performance_snapshots 
    where post_id = p_post_id 
    order by snapshot_date desc limit 1;
    
    select * into v_previous_snapshot 
    from seo_performance_snapshots 
    where post_id = p_post_id 
    and id != v_recent_snapshot.id
    order by snapshot_date desc limit 1;

    if v_recent_snapshot is null or v_previous_snapshot is null then
        return jsonb_build_object('status', 'insufficient_data');
    end if;

    -- SIGNAL 1: Impression Decline
    if v_recent_snapshot.impressions < v_previous_snapshot.impressions * 0.8 then
        v_decay_score := v_decay_score + 30;
        v_signals := array_append(v_signals, 'IMPRESSION_DROP');
    end if;

    -- SIGNAL 2: CTR Decrease
    if v_recent_snapshot.ctr < v_previous_snapshot.ctr * 0.9 then
        v_decay_score := v_decay_score + 25;
        v_signals := array_append(v_signals, 'CTR_DROP');
    end if;

    -- SIGNAL 3: Position Decline
    if v_recent_snapshot.average_position > v_previous_snapshot.average_position + 2 then
        v_decay_score := v_decay_score + 25;
        v_signals := array_append(v_signals, 'RANKING_DECLINE');
    end if;

    -- Emit Decay Event if threshold reached
    if v_decay_score >= 50 then
        insert into audit_logs (post_id, action, metadata)
        values (p_post_id, 'CONTENT_DECAY_DETECTED', jsonb_build_object(
            'decay_score', v_decay_score,
            'signals', v_signals,
            'timestamp', now()
        ));
        
        -- Trigger Automated Recommendation (Strategic Advisory)
        insert into seo_regeneration_recommendations (post_id, recommendation_type, recommendation_reason, severity, recommended_actions)
        values (
            p_post_id, 
            case 
                when 'CTR_DROP' = any(v_signals) then 'TITLE_REWRITE'
                when 'IMPRESSION_DROP' = any(v_signals) then 'KEYWORD_EXPANSION'
                else 'META_DESCRIPTION_UPGRADE'
            end,
            'Automated decay detection trigger',
            case when v_decay_score > 80 then 'critical' else 'high' end,
            jsonb_build_object('suggested_signals', v_signals)
        );
    end if;

    return jsonb_build_object(
        'post_id', p_post_id,
        'decay_score', v_decay_score,
        'signals', v_signals
    );
end;
$$;


-- 5. AI SEO OPTIMIZATION LAYER (TRAINING MEMORY)
create table if not exists seo_ai_training_memory (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references posts(id) on delete cascade,
    
    optimization_type text,
    input_state jsonb,
    output_state jsonb,
    
    performance_outcome numeric, -- Delta in CTR/Position
    is_successful boolean,
    
    created_at timestamptz default now()
);

-- GOVERNANCE: AI Suggestions require human approval through cms_publish
create or replace view vw_ai_readiness_report as
select 
    p.title,
    r.recommendation_type,
    r.recommendation_reason,
    r.severity,
    s.decay_score
from posts p
join seo_regeneration_recommendations r on p.id = r.post_id
join seo_performance_snapshots s on p.id = s.post_id
where r.status = 'pending'
order by r.severity desc, s.decay_score desc;
