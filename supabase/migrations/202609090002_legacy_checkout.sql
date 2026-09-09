-- Upgrade uncharged legacy sandbox checkouts without touching provider orders.
create function public.reprice_legacy_payment(owner uuid, app_id uuid, payment_id uuid, fee_amount integer, fee_currency text)
returns boolean language plpgsql security definer set search_path=public as $$
declare a applications;
begin
 select * into a from applications where id=app_id and owner_id=owner for update;
 if not found or a.status <> 'awaiting_payment' or a.confirmed_version is distinct from a.version then return false; end if;
 if fee_amount < 0 or fee_currency not in ('USD','INR') then raise exception 'Invalid fee'; end if;
 update payment_sessions set amount=fee_amount,currency=fee_currency,status='pending',updated_at=now()
 where id=payment_id and application_id=a.id and provider='sandbox'
 and provider_order_id is null and order_started_at is null and status in ('pending','processing');
 if not found then return false; end if;
 update applications set payment_status='pending',updated_at=now() where id=a.id;
 return true;
end $$;
revoke all on function public.reprice_legacy_payment(uuid,uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.reprice_legacy_payment(uuid,uuid,uuid,integer,text) to service_role;
