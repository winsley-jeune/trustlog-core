-- Phase 4: Public Trust Ledger (AL-045)

create table public.trust_ledger (
  id            uuid primary key default gen_random_uuid(),
  event_type    text not null check (event_type in (
                  'cert_issued', 'tier_upgraded', 'tier_downgraded',
                  'agent_revoked', 'council_decision',
                  'appeal_resolved', 'agent_registered'
                )),
  agent_id      uuid not null references public.agents(id),
  summary       text not null,
  evidence_hash text not null,
  published_at  timestamptz not null default now()
);

-- Append-only enforcement
create or replace function public.prevent_ledger_modification()
returns trigger as $$
begin
  raise exception 'Trust ledger is append-only. Modifications are not permitted.';
end;
$$ language plpgsql;

create trigger ledger_immutable_update
  before update on public.trust_ledger
  for each row execute function public.prevent_ledger_modification();

create trigger ledger_immutable_delete
  before delete on public.trust_ledger
  for each row execute function public.prevent_ledger_modification();

create index idx_ledger_agent on public.trust_ledger(agent_id, published_at desc);
create index idx_ledger_event on public.trust_ledger(event_type, published_at desc);
create index idx_ledger_published on public.trust_ledger(published_at desc);

alter table public.trust_ledger enable row level security;
create policy "ledger_public_read"
  on public.trust_ledger for select using (true);
create policy "ledger_insert_only"
  on public.trust_ledger for insert with check (true);
