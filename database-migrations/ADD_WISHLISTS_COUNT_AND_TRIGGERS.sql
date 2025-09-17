-- High-performance wishlist count on vehicles
-- 1) Column
alter table public.vehicles
  add column if not exists wishlists_count integer default 0;

-- 2) Backfill counts from existing shortlists (assumes shortlists.vehicle_ids is uuid[])
update public.vehicles v
set wishlists_count = coalesce(sub.cnt, 0)
from (
  select v2.id as vehicle_id,
         (select count(*) from public.shortlists s where v2.id = any(s.vehicle_ids)) as cnt
  from public.vehicles v2
) sub
where v.id = sub.vehicle_id;

-- 3) Helper to refresh counts for a set of vehicle ids
create or replace function public.refresh_wishlist_counts(_ids uuid[])
returns void
language plpgsql
as $$
begin
  with distinct_ids as (
    select distinct unnest(coalesce(_ids, '{}')) as id
  )
  update public.vehicles v
  set wishlists_count = coalesce((
    select count(*) from public.shortlists s where v.id = any(s.vehicle_ids)
  ), 0)
  from distinct_ids d
  where v.id = d.id;
end;
$$;

-- 4) Trigger to refresh counts after changes to shortlists
create or replace function public.trg_shortlists_refresh_wishlist_counts()
returns trigger
language plpgsql
as $$
declare
  ids uuid[];
begin
  if TG_OP = 'INSERT' then
    ids := NEW.vehicle_ids;
  elsif TG_OP = 'UPDATE' then
    ids := (
      select array_agg(distinct x)
      from (
        select unnest(coalesce(NEW.vehicle_ids, '{}')) as x
        union
        select unnest(coalesce(OLD.vehicle_ids, '{}'))
      ) u
    );
  else
    ids := OLD.vehicle_ids;
  end if;

  perform public.refresh_wishlist_counts(ids);
  return null;
end;
$$;

drop trigger if exists shortlists_refresh_wishlist_counts on public.shortlists;
create trigger shortlists_refresh_wishlist_counts
after insert or update or delete on public.shortlists
for each row execute function public.trg_shortlists_refresh_wishlist_counts();

