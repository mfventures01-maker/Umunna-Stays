-- 1. CREATE POST
create or replace function create_post(
  p_title text,
  p_slug text,
  p_content text,
  p_excerpt text,
  p_featured_image text,
  p_meta_title text,
  p_meta_description text,
  p_focus_keyword text,
  p_keywords text[],
  p_status text
)
returns uuid
language plpgsql
as $$
declare new_id uuid;
begin
  insert into posts (
    id, title, slug, content, excerpt,
    featured_image, meta_title, meta_description,
    focus_keyword, keywords, status, created_at
  )
  values (
    gen_random_uuid(), p_title, p_slug, p_content, p_excerpt,
    p_featured_image, p_meta_title, p_meta_description,
    p_focus_keyword, p_keywords, p_status, now()
  )
  returning id into new_id;
  return new_id;
end;
$$;

-- 2. PUBLISH POST (POST NOW)
create or replace function publish_post(p_post_id uuid)
returns void
language plpgsql
as $$
begin
  update posts
  set status = 'published',
      published_at = now()
  where id = p_post_id;
end;
$$;

-- 3. VALIDATE SLUG UNIQUENESS
create or replace function is_slug_available(p_slug text)
returns boolean
language sql
as $$
  select not exists (
    select 1 from posts where slug = p_slug
  );
$$;

-- 4. ATTACH IMAGE
create or replace function attach_post_image(
  p_post_id uuid,
  p_url text,
  p_alt text,
  p_caption text
)
returns void
language plpgsql
as $$
begin
  insert into post_images (
    id, post_id, url, alt_text, caption
  )
  values (
    gen_random_uuid(), p_post_id, p_url, p_alt, p_caption
  );
end;
$$;
