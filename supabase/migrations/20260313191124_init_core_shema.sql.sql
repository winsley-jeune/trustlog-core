-- ─────────────────────────────────────────────────────────────
-- TRUSTLOG CORE SCHEMA — AL-002
-- ─────────────────────────────────────────────────────────────

-- PROFILES
-- Every user on the platform — human or agent
create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('human', 'agent')),
  name        text not null,
  email       text unique,
  created_at  timestamptz not null default now()
);

-- AGENTS
-- Full agent identity and trust record
create table public.agents (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  name            text not null unique,
  tagline         text,
  avatar          text,
  color           text default '#00AA78',
  model           text,
  creator         text,
  bio             text,
  open_to_work    boolean not null default false,
  cert_level      text not null default 'UNVERIFIED'
                  check (cert_level in (
                    'UNVERIFIED','COMMUNITY','VERIFIED','AUDITED','SOVEREIGN'
                  )),
  trust_score     integer not null default 100
                  check (trust_score >= 0 and trust_score <= 1000),
  specializations text[]  not null default '{}',
  tools           text[]  not null default '{}',
  status          text not null default 'active'
                  check (status in ('active', 'flagged', 'probation', 'revoked')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- AGENT STATS
-- Performance numbers per agent
create table public.agent_stats (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null unique references public.agents(id) on delete cascade,
  completed     integer not null default 0,
  success_rate  numeric(5,2) not null default 0.00
                check (success_rate >= 0 and success_rate <= 100),
  efficiency    numeric(5,2) not null default 0.00,
  avg_duration  integer not null default 0,
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- Speeds up the most common queries on the network page:
-- filtering by cert level, sorting by trust score,
-- filtering open to work agents, filtering by status
-- ─────────────────────────────────────────────────────────────

create index idx_agents_cert_level   on public.agents(cert_level);
create index idx_agents_trust_score  on public.agents(trust_score desc);
create index idx_agents_open_to_work on public.agents(open_to_work) where open_to_work = true;
create index idx_agents_status       on public.agents(status);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- Automatically updates updated_at on every row change.
-- Without this we would have to manually set updated_at
-- in every UPDATE query — this does it automatically.
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agents_updated_at
  before update on public.agents
  for each row execute function public.handle_updated_at();

create trigger agent_stats_updated_at
  before update on public.agent_stats
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- RLS is Postgres's built-in access control system.
-- Even if someone gets your anon key, they cannot read
-- or write data they are not allowed to touch.
-- Every table needs RLS enabled AND policies defined —
-- enabling RLS without policies blocks everything by default.
-- ─────────────────────────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.agents      enable row level security;
alter table public.agent_stats enable row level security;

-- ─────────────────────────────────────────────────────────────
-- PROFILES POLICIES
-- Public read: anyone can see profiles (needed for agent cards)
-- Owner write: split into insert/update/delete — Postgres does
-- not support FOR ALL with mixed USING/WITH CHECK cleanly
-- ─────────────────────────────────────────────────────────────

create policy "profiles_public_read"
  on public.profiles for select
  using (true);

-- WITH CHECK on insert: the new row's id must match the
-- logged-in user's id — prevents creating profiles for others
create policy "profiles_owner_insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- USING on update: can only update your own profile row
create policy "profiles_owner_update"
  on public.profiles for update
  using (auth.uid() = id);

-- USING on delete: can only delete your own profile row
create policy "profiles_owner_delete"
  on public.profiles for delete
  using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- AGENTS POLICIES
-- Public read: anyone can browse agents on the network
-- Owner insert: profile_id on the new row must match auth.uid()
-- Owner update/delete: profile_id on existing row must match
-- ─────────────────────────────────────────────────────────────

create policy "agents_public_read"
  on public.agents for select
  using (true);

-- WITH CHECK on insert: the profile_id being written must
-- match the logged-in user — an agent cannot register itself
-- under someone else's profile
create policy "agents_owner_insert"
  on public.agents for insert
  with check (auth.uid() = profile_id);

create policy "agents_owner_update"
  on public.agents for update
  using (auth.uid() = profile_id);

create policy "agents_owner_delete"
  on public.agents for delete
  using (auth.uid() = profile_id);

-- ─────────────────────────────────────────────────────────────
-- AGENT STATS POLICIES
-- Stats are publicly readable — trust scores are transparent.
-- Writes require ownership verified through the agents table.
-- The subquery joins stats → agents → profile to find the owner.
-- ─────────────────────────────────────────────────────────────

create policy "agent_stats_public_read"
  on public.agent_stats for select
  using (true);

-- On insert: verify the agent being referenced belongs to
-- the logged-in user by looking up profile_id in agents table
create policy "agent_stats_owner_insert"
  on public.agent_stats for insert
  with check (
    auth.uid() = (
      select profile_id from public.agents
      where id = agent_id
    )
  );

create policy "agent_stats_owner_update"
  on public.agent_stats for update
  using (
    auth.uid() = (
      select profile_id from public.agents
      where id = agent_id
    )
  );

create policy "agent_stats_owner_delete"
  on public.agent_stats for delete
  using (
    auth.uid() = (
      select profile_id from public.agents
      where id = agent_id
    )
  );