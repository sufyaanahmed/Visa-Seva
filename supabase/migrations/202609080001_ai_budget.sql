-- USD micro-units avoid floating-point budget comparisons. Each reservation
-- belongs to the UTC day on which the physical model request was admitted.
create table public.ai_budget_days (
 day date primary key,
 charged_micro_usd bigint not null default 0 check (charged_micro_usd >= 0)
);
create table public.ai_budget_reservations (
 id uuid primary key,
 day date not null references public.ai_budget_days(day),
 reserved_micro_usd bigint not null check (reserved_micro_usd > 0),
 settled_micro_usd bigint,
 created_at timestamptz not null default now(),
 check (settled_micro_usd between 0 and reserved_micro_usd)
);
alter table public.ai_budget_days enable row level security;
alter table public.ai_budget_reservations enable row level security;
revoke all on public.ai_budget_days, public.ai_budget_reservations from anon, authenticated;
grant select on public.ai_budget_days, public.ai_budget_reservations to service_role;

create function public.reserve_ai_budget(reservation_id uuid, amount bigint)
returns boolean language plpgsql security definer set search_path=public as $$
declare today date := (clock_timestamp() at time zone 'UTC')::date;
begin
 if amount <= 0 or amount > 10000000 then raise exception 'Invalid reservation'; end if;
 insert into ai_budget_days(day) values(today) on conflict do nothing;
 -- The conditional row update serializes competing production instances.
 update ai_budget_days set charged_micro_usd=charged_micro_usd+amount
 where day=today and charged_micro_usd+amount <= 10000000;
 if not found then return false; end if;
 -- Duplicate IDs raise and roll back the debit, never authorize another call.
 insert into ai_budget_reservations(id,day,reserved_micro_usd) values(reservation_id,today,amount);
 return true;
end $$;

create function public.settle_ai_budget(reservation_id uuid, amount bigint)
returns void language plpgsql security definer set search_path=public as $$
declare r public.ai_budget_reservations;
begin
 select * into r from ai_budget_reservations where id=reservation_id for update;
 if not found then raise exception 'Unknown reservation'; end if;
 if r.settled_micro_usd is not null then return; end if;
 if amount < 0 or amount > r.reserved_micro_usd then raise exception 'Invalid settlement'; end if;
 update ai_budget_days set charged_micro_usd=charged_micro_usd-r.reserved_micro_usd+amount where day=r.day;
 update ai_budget_reservations set settled_micro_usd=amount where id=reservation_id;
end $$;
revoke all on function public.reserve_ai_budget(uuid,bigint), public.settle_ai_budget(uuid,bigint) from public,anon,authenticated;
grant execute on function public.reserve_ai_budget(uuid,bigint), public.settle_ai_budget(uuid,bigint) to service_role;
