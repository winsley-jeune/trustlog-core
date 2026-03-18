-- Phase 4: Webhooks (AL-043) + Partners (AL-046)

create table public.webhooks (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid references public.organizations(id) on delete cascade,
  user_id    uuid not null references public.profiles(id),
  url        text not null,
  secret     text not null,
  events     text[] not null default '{}',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.webhook_deliveries (
  id              uuid primary key default gen_random_uuid(),
  webhook_id      uuid not null references public.webhooks(id) on delete cascade,
  event_type      text not null,
  payload         jsonb not null,
  status          text not null default 'pending'
                  check (status in ('pending', 'delivered', 'failed')),
  attempts        integer not null default 0,
  response_code   integer,
  last_attempt_at timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.webhooks enable row level security;
alter table public.webhook_deliveries enable row level security;

create policy "webhooks_owner_read"
  on public.webhooks for select
  using (auth.uid() = user_id);

create policy "webhooks_owner_write"
  on public.webhooks for insert
  with check (auth.uid() = user_id);

create policy "webhooks_owner_delete"
  on public.webhooks for delete
  using (auth.uid() = user_id);

create policy "webhook_deliveries_owner_read"
  on public.webhook_deliveries for select
  using (
    webhook_id in (select id from public.webhooks where user_id = auth.uid())
  );

-- Partners table
create table public.partners (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations(id),
  name            text not null,
  api_key         text not null unique,
  api_key_hash    text not null,
  subdomain       text unique,
  plan            text not null default 'standard'
                  check (plan in ('standard', 'enterprise')),
  monthly_queries integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.partners enable row level security;
create policy "partners_public_read"
  on public.partners for select using (true);
create policy "partners_insert"
  on public.partners for insert with check (true);
