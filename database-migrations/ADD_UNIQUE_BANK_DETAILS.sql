-- Ensure a dealer can have multiple bank accounts but account numbers are unique per dealer
begin;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bank_details_unique_dealer_account'
  ) then
    alter table public.bank_details
      add constraint bank_details_unique_dealer_account
      unique (dealer_id, account_number);
  end if;
end $$;

commit;


