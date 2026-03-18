-- Phase 4: Enterprise Operator Accounts (AL-040) + Stripe (AL-041)

create table public.organizations (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  slug                    text not null unique,
  domain                  text,
  plan                    text not null default 'free'
                          check (plan in ('free', 'developer', 'business', 'enterprise')),
  billing_email           text,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan_expires_at         timestamptz,
  weekly_digest           boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table public.org_members (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references public.organizations(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text not null default 'member'
            check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique(org_id, user_id)
);

create table public.org_agents (
  org_id   uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (org_id, agent_id)
);

alter table public.agents
  add column org_id uuid references public.organizations(id);

-- RLS
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.org_agents enable row level security;

create policy "orgs_member_read"
  on public.organizations for select
  using (
    id in (select org_id from public.org_members where user_id = auth.uid())
  );

create policy "orgs_public_read_by_slug"
  on public.organizations for select
  using (true);

create policy "orgs_insert"
  on public.organizations for insert
  with check (true);

create policy "orgs_owner_update"
  on public.organizations for update
  using (
    id in (
      select org_id from public.org_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

create policy "org_members_read"
  on public.org_members for select
  using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

create policy "org_members_insert"
  on public.org_members for insert
  with check (true);

create policy "org_agents_read"
  on public.org_agents for select
  using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

create policy "org_agents_write"
  on public.org_agents for all
  using (
    org_id in (
      select org_id from public.org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create trigger orgs_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();
