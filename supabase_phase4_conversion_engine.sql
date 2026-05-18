-- 🧠 PHASE 4: CONVERSION ENGINE ACTIVATION LAYER (CARSS)
-- This script enables intent-driven hospitality transactions and deterministic auditing.

-- 1. INTENT TRACKING INFRASTRUCTURE
create table if not exists user_sessions (
    id uuid primary key default gen_random_uuid(),
    fingerprint text,
    intent_state text default 'browsing' check (intent_state in ('browsing', 'comparing', 'ready_to_book', 'high_intent')),
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists intent_events (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references user_sessions(id) on delete cascade,
    event_type text, -- 'scroll_depth', 'dwell_time', 'price_click', 'image_view'
    property_id text,
    metadata jsonb default '{}',
    created_at timestamptz default now()
);

-- 2. DETERMINISTIC BOOKING LAYER
create table if not exists bookings (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references user_sessions(id),
    property_id text references properties(property_id),
    
    check_in date not null,
    check_out date not null,
    total_price numeric not null,
    
    status text default 'intent' check (status in ('intent', 'locked', 'confirmed', 'cancelled', 'completed')),
    
    guest_name text,
    guest_phone text,
    guest_email text,
    
    shift_id uuid references shifts(id), -- CARSS Attribution
    payment_intent_id text,
    
    audit_trail jsonb default '[]',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. INTENT CLASSIFICATION RPC
create or replace function track_intent_event(
    p_session_id uuid,
    p_event_type text,
    p_property_id text,
    p_metadata jsonb
)
returns text
language plpgsql
as $$
declare
    v_new_state text;
    v_event_count int;
begin
    -- 1. Record the event
    insert into intent_events (session_id, event_type, property_id, metadata)
    values (p_session_id, p_event_type, p_property_id, p_metadata);

    -- 2. Heuristic Classification Logic (Deterministic)
    select count(*) into v_event_count 
    from intent_events 
    where session_id = p_session_id;

    v_new_state := case 
        when v_event_count > 20 then 'high_intent'
        when v_event_count > 10 then 'ready_to_book'
        when v_event_count > 5 then 'comparing'
        else 'browsing'
    end;

    -- 3. Update Session State
    update user_sessions 
    set intent_state = v_new_state,
        updated_at = now()
    where id = p_session_id;

    return v_new_state;
end;
$$;

-- 4. DETERMINISTIC BOOKING RPC
create or replace function create_booking_intent(
    p_session_id uuid,
    p_property_id text,
    p_check_in date,
    p_check_out date,
    p_guest_info jsonb
)
returns uuid
language plpgsql
as $$
declare
    v_booking_id uuid;
    v_nightly_rate numeric;
    v_total numeric;
    v_active_shift_id uuid;
begin
    -- 1. Get active shift (CARSS Attribution)
    select id into v_active_shift_id 
    from shifts 
    where status = 'active' 
    limit 1;

    -- 2. Calculate Price (Authority Source)
    select nightly_rate into v_nightly_rate 
    from properties 
    where property_id = p_property_id;

    v_total := v_nightly_rate * (p_check_out - p_check_in);

    -- 3. Create Intent Record
    insert into bookings (
        session_id, property_id, check_in, check_out, 
        total_price, guest_name, guest_phone, guest_email,
        shift_id, status, audit_trail
    )
    values (
        p_session_id, p_property_id, p_check_in, p_check_out,
        v_total, p_guest_info->>'name', p_guest_info->>'phone', p_guest_info->>'email',
        v_active_shift_id, 'intent', 
        jsonb_build_array(jsonb_build_object('action', 'INTENT_CREATED', 'timestamp', now()))
    )
    returning id into v_booking_id;

    return v_booking_id;
end;
$$;

-- 6. AUDIT TRAIL UTILITY
create or replace function append_to_audit_trail(
    p_booking_id uuid,
    p_event text
)
returns jsonb
language plpgsql
as $$
declare
    v_trail jsonb;
begin
    select audit_trail into v_trail from bookings where id = p_booking_id;
    return v_trail || jsonb_build_object('action', p_event, 'timestamp', now());
end;
$$;

-- 7. INVENTORY LOCKING (DETERMINISTIC)
create or replace function lock_inventory_slot(p_booking_id uuid)
returns boolean
language plpgsql
as $$
begin
    update bookings
    set status = 'locked',
        audit_trail = append_to_audit_trail(id, 'INVENTORY_LOCKED'),
        updated_at = now()
    where id = p_booking_id
    and status = 'intent';
    
    return found;
end;
$$;

-- 8. BOOKING CONFIRMATION & LEDGER EMISSION
create or replace function confirm_booking(
    p_booking_id uuid,
    p_payment_intent_id text
)
returns jsonb
language plpgsql
as $$
declare
    v_booking record;
begin
    -- 1. Fetch Booking
    select * into v_booking from bookings where id = p_booking_id;
    
    if v_booking.status != 'locked' then
        return jsonb_build_object('status', 'error', 'message', 'Booking not in lock state');
    end if;

    -- 2. Update Status
    update bookings
    set status = 'confirmed',
        payment_intent_id = p_payment_intent_id,
        audit_trail = append_to_audit_trail(id, 'PAYMENT_CONFIRMED'),
        updated_at = now()
    where id = p_booking_id;

    -- 3. Emit Ledger Entry (Immutability)
    insert into revenue_ledger (booking_id, shift_id, amount, entry_type, description)
    values (
        p_booking_id, 
        v_booking.shift_id, 
        v_booking.total_price, 
        'credit', 
        'Booking Confirmation: ' || p_booking_id
    );

    return jsonb_build_object('status', 'success', 'booking_id', p_booking_id);
end;
$$;

-- 5. REVENUE LEDGER ENFORCEMENT
create table if not exists revenue_ledger (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references bookings(id),
    shift_id uuid references shifts(id),
    amount numeric not null,
    entry_type text check (entry_type in ('credit', 'debit')),
    description text,
    ledger_hash text, -- For CARSS immutability
    created_at timestamptz default now()
);
