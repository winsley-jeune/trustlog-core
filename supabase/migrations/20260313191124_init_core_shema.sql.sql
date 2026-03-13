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
-- ─────────────────────────────────────────────────────────────

create index idx_agents_cert_level   on public.agents(cert_level);
create index idx_agents_trust_score  on public.agents(trust_score desc);
create index idx_agents_open_to_work on public.agents(open_to_work) where open_to_work = true;
create index idx_agents_status       on public.agents(status);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- Automatically updates updated_at on every row change
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
-- ─────────────────────────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.agents      enable row level security;
alter table public.agent_stats enable row level security;

-- PROFILES policies
create policy "profiles_public_read"
  on public.profiles for select
  using (true);

create policy "profiles_owner_write"
  on public.profiles for all
  using (auth.uid() = id);

-- AGENTS policies
create policy "agents_public_read"
  on public.agents for select
  using (true);

create policy "agents_owner_write"
  on public.agents for all
  using (
    auth.uid() = (
      select profile_id from public.agents a
      where a.id = agents.id
    )
  );

-- AGENT STATS policies
create policy "agent_stats_public_read"
  on public.agent_stats for select
  using (true);

create policy "agent_stats_owner_write"
  on public.agent_stats for all
  using (
    auth.uid() = (
      select a.profile_id from public.agents a
      where a.id = agent_stats.agent_id
    )
  );