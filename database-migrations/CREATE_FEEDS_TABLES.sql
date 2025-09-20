-- Feeds MVP schema - public read, owner edit/delete

-- posts
create table if not exists public.feeds_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  dealer_id uuid references public.dealers(id) on delete set null,
  content text,
  visibility text default 'public',
  media_count int default 0,
  location_city text,
  location_state text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- media
create table if not exists public.feeds_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feeds_posts(id) on delete cascade,
  media_type text not null check (media_type in ('image','video')),
  file_url text not null,
  thumb_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_feeds_media_post on public.feeds_media(post_id);

-- comments
create table if not exists public.feeds_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feeds_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  dealer_id uuid references public.dealers(id) on delete set null,
  content text not null,
  parent_comment_id uuid references public.feeds_comments(id) on delete cascade,
  created_at timestamptz default now()
);
create index if not exists idx_feeds_comments_post on public.feeds_comments(post_id, created_at desc);

-- likes
create table if not exists public.feeds_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feeds_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  dealer_id uuid references public.dealers(id) on delete set null,
  created_at timestamptz default now(),
  unique(post_id, dealer_id)
);
create index if not exists idx_feeds_likes_post on public.feeds_likes(post_id);

-- updated_at trigger
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_feeds_posts_updated on public.feeds_posts;
create trigger trg_feeds_posts_updated before update on public.feeds_posts
for each row execute function public.update_timestamp();

-- realtime publication
alter publication supabase_realtime add table public.feeds_posts;
alter publication supabase_realtime add table public.feeds_media;
alter publication supabase_realtime add table public.feeds_comments;
alter publication supabase_realtime add table public.feeds_likes;

-- RLS: Disabled for public read per MVP; keep owner-only edits via future policies if enabled later
alter table public.feeds_posts disable row level security;
alter table public.feeds_media disable row level security;
alter table public.feeds_comments disable row level security;
alter table public.feeds_likes disable row level security;


