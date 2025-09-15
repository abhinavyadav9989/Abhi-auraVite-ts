-- Create robust dealer ratings with aggregation
-- Safe to run multiple times

begin;

-- 1) Create dealer_ratings table (idempotent pattern)
create table if not exists public.dealer_ratings (
  id uuid primary key default gen_random_uuid(),
  rated_dealer_id uuid not null references public.dealers(id) on delete cascade,
  rater_dealer_id uuid not null references public.dealers(id) on delete restrict,
  transaction_id uuid not null references public.transactions(id) on delete restrict,
  overall smallint not null check (overall between 1 and 5),
  communication smallint check (communication between 1 and 5),
  vehicle_condition smallint check (vehicle_condition between 1 and 5),
  professionalism smallint check (professionalism between 1 and 5),
  transaction_experience smallint check (transaction_experience between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Basic indexes
create index if not exists dealer_ratings_rated_idx on public.dealer_ratings(rated_dealer_id);
create index if not exists dealer_ratings_rater_idx on public.dealer_ratings(rater_dealer_id);
create index if not exists dealer_ratings_txn_idx on public.dealer_ratings(transaction_id);

-- Ensure one rating per rater per transaction for a specific rated dealer
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'dealer_ratings_unique_per_txn'
  ) then
    alter table public.dealer_ratings
      add constraint dealer_ratings_unique_per_txn
      unique (rater_dealer_id, rated_dealer_id, transaction_id);
  end if;
end $$;

-- 2) Add summary columns to dealers
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'dealers' and column_name = 'rating_avg'
  ) then
    alter table public.dealers add column rating_avg numeric(3,2) not null default 0;
  end if;
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'dealers' and column_name = 'rating_count'
  ) then
    alter table public.dealers add column rating_count integer not null default 0;
  end if;
end $$;

-- 3) Trigger to maintain aggregates
create or replace function public.refresh_dealer_rating_summary(p_dealer_id uuid)
returns void language plpgsql as $$
begin
  update public.dealers d
  set 
    rating_avg = coalesce((
      select round(avg(dr.overall)::numeric, 2)
      from public.dealer_ratings dr
      where dr.rated_dealer_id = p_dealer_id
    ), 0),
    rating_count = coalesce((
      select count(*) from public.dealer_ratings dr
      where dr.rated_dealer_id = p_dealer_id
    ), 0)
  where d.id = p_dealer_id;
end;$$;

create or replace function public.dealer_ratings_agg_trg()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    perform public.refresh_dealer_rating_summary(new.rated_dealer_id);
    return new;
  elsif (tg_op = 'UPDATE') then
    if new.rated_dealer_id <> old.rated_dealer_id then
      perform public.refresh_dealer_rating_summary(old.rated_dealer_id);
    end if;
    perform public.refresh_dealer_rating_summary(new.rated_dealer_id);
    return new;
  elsif (tg_op = 'DELETE') then
    perform public.refresh_dealer_rating_summary(old.rated_dealer_id);
    return old;
  end if;
  return null;
end;$$;

drop trigger if exists dealer_ratings_agg_trg on public.dealer_ratings;
create trigger dealer_ratings_agg_trg
after insert or update or delete on public.dealer_ratings
for each row execute procedure public.dealer_ratings_agg_trg();

-- 4) Optional: migrate from existing dealer_reviews to dealer_ratings (if exists)
-- We map reviewer_name to rater_dealer_id = null; keep as comment-only migration hook
-- Uncomment and adapt if you have data to migrate.
-- insert into public.dealer_ratings (rated_dealer_id, rater_dealer_id, transaction_id, overall, comment)
-- select dealer_id, null, null, rating, comment from public.dealer_reviews;

commit;


