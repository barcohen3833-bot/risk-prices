-- risk-prices: agents, client leads (round-robin) and insurer producer contacts.
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- The first user who signs up on agent.html becomes the active admin; later agents wait for admin approval.

create table if not exists public.agents (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  active boolean not null default false,
  is_admin boolean not null default false,
  last_assigned timestamptz not null default 'epoch',
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (phone ~ '^0[0-9]{8,9}$'),
  email text check (email is null or (char_length(email) <= 100 and email ~ '^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]{2,}$')),
  notes text check (notes is null or char_length(notes) <= 400),
  quote jsonb not null default '{}'::jsonb check (pg_column_size(quote) < 4000),
  agent_id uuid references public.agents(id) on delete set null,
  status text not null default 'new' check (status in ('new','contacted','closed','lost')),
  agent_notes text check (agent_notes is null or char_length(agent_notes) <= 1000)
);
create index if not exists leads_agent_idx on public.leads(agent_id, created_at desc);
create index if not exists leads_phone_idx on public.leads(phone, created_at desc);

create table if not exists public.insurer_contacts (
  insurer text primary key,
  producer_email text check (producer_email is null or char_length(producer_email) <= 120),
  producer_phone text check (producer_phone is null or char_length(producer_phone) <= 20),
  notes text check (notes is null or char_length(notes) <= 200)
);
insert into public.insurer_contacts(insurer) values
  ('הראל ביטוח'),('הפניקס ביטוח'),('כלל ביטוח'),('הכשרה ביטוח'),('איילון ביטוח'),('ביטוח ישיר'),
  ('AIG'),('שלמה ביטוח'),('מנורה ביטוח'),('מגדל ביטוח'),('ליברה חברה לביטוח')
on conflict do nothing;

-- ---------- helpers ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(select 1 from agents where id = auth.uid() and is_admin) $$;

create or replace function public.is_active_agent() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(select 1 from agents where id = auth.uid() and (active or is_admin)) $$;

-- new auth user → agents row (first one = active admin)
create or replace function public.handle_new_agent() returns trigger
language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  perform pg_advisory_xact_lock(4242);
  select not exists(select 1 from agents) into first_user;
  insert into agents(id, name, phone, email, active, is_admin)
  values (new.id,
          left(coalesce(new.raw_user_meta_data->>'name', ''), 60),
          left(coalesce(new.raw_user_meta_data->>'phone', ''), 14),
          coalesce(new.email, ''),
          first_user, first_user)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_agent();

-- ---------- row level security ----------
alter table public.agents enable row level security;
alter table public.leads enable row level security;
alter table public.insurer_contacts enable row level security;

revoke all on public.agents, public.leads, public.insurer_contacts from anon, authenticated;
grant select on public.agents, public.leads, public.insurer_contacts to authenticated;
grant update (active) on public.agents to authenticated;
grant update (status, agent_notes, agent_id) on public.leads to authenticated;
grant update (producer_email, producer_phone, notes) on public.insurer_contacts to authenticated;

drop policy if exists agents_read on public.agents;
create policy agents_read on public.agents for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists agents_admin_update on public.agents;
create policy agents_admin_update on public.agents for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists leads_read on public.leads;
create policy leads_read on public.leads for select to authenticated
  using (agent_id = auth.uid() or public.is_admin());
drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads for update to authenticated
  using (agent_id = auth.uid() or public.is_admin())
  with check (agent_id = auth.uid() or public.is_admin());

drop policy if exists contacts_read on public.insurer_contacts;
create policy contacts_read on public.insurer_contacts for select to authenticated
  using (public.is_active_agent());
drop policy if exists contacts_admin_update on public.insurer_contacts;
create policy contacts_admin_update on public.insurer_contacts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- public lead submission (the only thing anonymous visitors can call) ----------
create or replace function public.submit_lead(p_name text, p_phone text, p_email text, p_notes text, p_quote jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare v_agent agents%rowtype; v_phone text; v_email text;
begin
  p_name := btrim(coalesce(p_name, ''));
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if v_phone like '972%' then v_phone := '0' || substr(v_phone, 4); end if;
  v_email := nullif(btrim(coalesce(p_email, '')), '');
  if char_length(p_name) not between 2 and 80 or v_phone !~ '^0[0-9]{8,9}$'
     or (v_email is not null and (char_length(v_email) > 100 or v_email !~ '^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]{2,}$'))
     or char_length(coalesce(p_notes, '')) > 400
     or p_quote is null or jsonb_typeof(p_quote) <> 'object' or pg_column_size(p_quote) >= 4000 then
    raise exception 'invalid';
  end if;
  if exists(select 1 from leads where phone = v_phone and created_at > now() - interval '10 minutes') then
    raise exception 'duplicate';
  end if;
  if (select count(*) from leads where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'busy';
  end if;

  -- round-robin: the active agent who got a lead longest ago
  select * into v_agent from agents where active
    order by last_assigned, created_at limit 1 for update skip locked;
  if found then update agents set last_assigned = now() where id = v_agent.id; end if;

  insert into leads(name, phone, email, notes, quote, agent_id)
  values (p_name, v_phone, v_email, nullif(btrim(coalesce(p_notes, '')), ''), p_quote, v_agent.id);
  return json_build_object('ok', true, 'agent', coalesce(nullif(v_agent.name, ''), null));
end $$;

revoke all on function public.submit_lead(text, text, text, text, jsonb) from public;
grant execute on function public.submit_lead(text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.handle_new_agent() from public, anon, authenticated;
