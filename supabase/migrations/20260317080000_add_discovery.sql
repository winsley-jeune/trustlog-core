-- Phase 4: Agent Discovery Pipeline (AL-038)

-- Add source column to agents
alter table public.agents
  add column source text not null default 'registered'
  check (source in ('registered', 'github', 'huggingface', 'openclaw'));

create table public.agent_discovery (
  id            uuid primary key default gen_random_uuid(),
  source        text not null check (source in (
                  'github', 'huggingface', 'openclaw', 'manual'
                )),
  external_id   text not null,
  name          text not null,
  creator_org   text,
  description   text,
  url           text,
  discovered_at timestamptz not null default now(),
  status        text not null default 'stub'
                check (status in ('stub', 'claimed', 'rejected')),
  agent_id      uuid references public.agents(id),
  unique(source, external_id)
);

create index idx_discovery_source on public.agent_discovery(source);
create index idx_discovery_status on public.agent_discovery(status);

alter table public.agent_discovery enable row level security;
create policy "discovery_public_read"
  on public.agent_discovery for select using (true);
create policy "discovery_insert"
  on public.agent_discovery for insert with check (true);
create policy "discovery_update"
  on public.agent_discovery for update using (true);
