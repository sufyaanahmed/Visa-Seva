-- Direct decisions retain staff roles, optimistic locking and the audit trail.
create or replace function public.platform_command(actor uuid, kind text, app_id uuid, command text, payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = public as $$
declare a applications; p payment_sessions; old_status text; next_status text; staff_role text; event_id uuid; recipient_email text;
begin
 if kind not in ('applicant','admin','agent') then raise exception 'Forbidden'; end if;
 if command='create' then
  if kind='admin' then raise exception 'Forbidden'; end if;
  insert into applications(owner_id,draft_key,answers) values(actor,payload->>'draft_key',payload->'answers') on conflict(owner_id,draft_key) do nothing;
  select * into a from applications where owner_id=actor and draft_key=payload->>'draft_key';
  insert into platform_audit(application_id,actor_id,actor_kind,action) values(a.id,actor,kind,command);
  return to_jsonb(a);
 end if;
 select * into a from applications where id=app_id for update;
 if not found then raise exception 'Application not found'; end if;
 if kind='admin' then
  select role into staff_role from platform_roles where user_id=actor;
  if staff_role is null or command <> 'transition' then raise exception 'Forbidden'; end if;
 elsif a.owner_id <> actor then raise exception 'Application not found'; end if;
 old_status := a.status;
 if command in ('update','document','remove_document','confirm','submit','checkout','transition') and a.version is distinct from (payload->>'version')::integer then raise exception 'Version conflict. Reload the application.'; end if;
 if command in ('update','document','remove_document') then
  if a.status not in ('draft','waiting_for_information') then raise exception 'Application is not editable'; end if;
  if command='update' then
   -- A changed category invalidates the old checklist.
   if (a.answers->>'application_type',a.answers->>'visa_category',a.answers->>'afghan_purpose',a.answers->>'student_course_type',a.answers->>'oci_category',a.answers->>'basis_of_origin') is distinct from
      (payload->'answers'->>'application_type',payload->'answers'->>'visa_category',payload->'answers'->>'afghan_purpose',payload->'answers'->>'student_course_type',payload->'answers'->>'oci_category',payload->'answers'->>'basis_of_origin') then
    delete from application_documents where application_id=a.id;
   end if;
   a.answers := payload->'answers';
  elsif command='document' then
   insert into application_documents(application_id,type,path,mime_type,size,sha256)
    values(a.id,payload->>'type',payload->>'path',payload->>'mime_type',(payload->>'size')::integer,payload->>'sha256')
    on conflict(application_id,type) do update set path=excluded.path,mime_type=excluded.mime_type,size=excluded.size,sha256=excluded.sha256,created_at=now();
  else delete from application_documents where application_id=a.id and type=payload->>'type'; end if;
  a.version := a.version+1; a.confirmed_version := null; a.confirmed_at := null;
 elsif command='confirm' then
  if kind <> 'applicant' or a.status not in ('draft','waiting_for_information','awaiting_payment') then raise exception 'Human confirmation required'; end if;
  if a.payment_status not in ('paid','external') then a.status := 'awaiting_payment'; end if;
  a.version := a.version+1; a.confirmed_version := a.version; a.confirmed_at := now();
 elsif command='reopen' then
  if a.status <> 'awaiting_payment' then raise exception 'Application cannot be reopened'; end if;
  if exists(select 1 from payment_sessions where application_id=a.id and status in ('processing','pending')) then raise exception 'Cancel the open checkout before editing'; end if;
  a.status := 'draft'; a.version := a.version+1; a.confirmed_version := null;
 elsif command='checkout' then
  if a.confirmed_version is distinct from a.version or a.status <> 'awaiting_payment' then raise exception 'Review and confirm this application first'; end if;
  select * into p from payment_sessions where application_id=a.id and (request_key=payload->>'request_key' or status in ('pending','processing','paid')) order by created_at desc limit 1;
  if not found then
   insert into payment_sessions(application_id,request_key,amount,currency) values(a.id,payload->>'request_key',(payload->>'amount')::integer,payload->>'currency') returning * into p;
  end if;
  a.payment_status := p.status;
 elsif command='payment' then
  if kind <> 'applicant' then raise exception 'Authorize payment in checkout'; end if;
  select * into p from payment_sessions where id=(payload->>'payment_id')::uuid and application_id=a.id for update;
  if not found then raise exception 'Checkout not found'; end if;
  if p.status in ('paid','failed','cancelled','external') then return to_jsonb(a); end if;
  if payload->>'outcome' not in ('processing','paid','failed','cancelled','pending','external') then raise exception 'Invalid payment outcome'; end if;
  p.status := payload->>'outcome';
  update payment_sessions set status=p.status,updated_at=now(),transaction_reference=case when p.status='paid' then 'SANDBOX-'||p.id::text else null end where id=p.id;
  a.payment_status := p.status;
 elsif command='submit' then
  if a.status in ('submitted','under_review','accepted','rejected') then return to_jsonb(a); end if;
  if a.status not in ('awaiting_payment','waiting_for_information','draft') or a.payment_status not in ('paid','external') or a.confirmed_version is distinct from a.version or a.confirmed_at < now()-interval '24 hours' then raise exception 'Payment and current user confirmation required'; end if;
  a.status := 'submitted'; a.version := a.version+1;
 elsif command='transition' then
  next_status := payload->>'status';
  if length(trim(coalesce(payload->>'reason',''))) < 3 then raise exception 'A reason is required'; end if;
  if next_status in ('accepted','rejected') and staff_role not in ('decision_maker','administrator') then raise exception 'Decision role required'; end if;
  if not ((a.status='submitted' and next_status in ('under_review','waiting_for_information','accepted','rejected')) or
          (a.status='under_review' and next_status in ('waiting_for_information','accepted','rejected')) or
          (a.status='waiting_for_information' and next_status='under_review')) then raise exception 'Invalid status transition'; end if;
  a.status := next_status; a.version := a.version+1; a.confirmed_version := null;
 else raise exception 'Unknown command'; end if;
 update applications set answers=a.answers,status=a.status,payment_status=a.payment_status,version=a.version,confirmed_version=a.confirmed_version,confirmed_at=a.confirmed_at,updated_at=now() where id=a.id returning * into a;
 insert into platform_audit(application_id,actor_id,actor_kind,action) values(a.id,actor,kind,command);
 if old_status <> a.status then
  insert into application_history(application_id,actor_id,actor_kind,from_status,to_status,reason) values(a.id,actor,kind,old_status,a.status,coalesce(payload->>'reason','')) returning id into event_id;
  if a.status in ('submitted','waiting_for_information','accepted','rejected') then
   select email into recipient_email from auth.users where id=a.owner_id;
   insert into email_notifications(application_id,history_id,recipient,subject,body) values(a.id,event_id,recipient_email,
    'Visa Seva: '||replace(a.status,'_',' '),
    'Application '||a.reference||E'\nStatus: '||replace(a.status,'_',' ')||E'\n'||coalesce(payload->>'reason','')||E'\n'||
    case a.status when 'submitted' then 'We have received your application. You can follow its progress in your account.' when 'waiting_for_information' then 'Open your application, provide the requested information, and submit it again.' when 'accepted' then 'Open your application to review the decision and next steps. This decision does not grant a government visa.' else 'Open your application to review the reason and next steps.' end);
  end if;
 end if;
 return to_jsonb(a);
end $$;

-- Only the server can read cached authentication-bearing delivery payloads.
alter table public.email_notifications add column delivery_payload jsonb;
alter table public.payment_sessions drop constraint payment_sessions_provider_check;
alter table public.payment_sessions add constraint payment_sessions_provider_check check(provider in ('sandbox','razorpay','gratis','external'));
alter table public.payment_sessions add column provider_order_id text unique;
alter table public.payment_sessions add column order_started_at timestamptz;
create function public.claim_payment_order(payment_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
begin
 update payment_sessions set order_started_at=now(),provider='razorpay' where id=payment_id and order_started_at is null and provider_order_id is null and status='pending';
 return found;
end $$;
revoke all on function public.claim_payment_order(uuid) from public,anon,authenticated;
grant execute on function public.claim_payment_order(uuid) to service_role;
revoke select on public.email_notifications from authenticated;
grant select(id,application_id,history_id,recipient,subject,body,status,provider_id,attempts,created_at,last_error,next_attempt_at,first_attempt_at,lease_until) on public.email_notifications to authenticated;

alter table public.applications drop constraint applications_payment_status_check;
alter table public.applications add constraint applications_payment_status_check check(payment_status in ('unpaid','pending','processing','paid','failed','cancelled','external'));
alter table public.payment_sessions drop constraint payment_sessions_status_check;
alter table public.payment_sessions add constraint payment_sessions_status_check check(status in ('pending','processing','paid','failed','cancelled','external'));
