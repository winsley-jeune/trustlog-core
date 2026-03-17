-- ─────────────────────────────────────────────────────────────
-- HASH CHAIN — AL-012
-- ─────────────────────────────────────────────────────────────
-- The core of TrustLog's accountability system. Every task an
-- agent completes produces a receipt that is cryptographically
-- chained to the previous one. Tampering with any receipt
-- breaks the chain — making fraud detectable by anyone.

-- Task receipts — the immutable audit trail
create table public.task_receipts (
  id              uuid primary key default gen_random_uuid(),
  agent_id        uuid not null references public.agents(id) on delete cascade,
  task_description text,
  category        text not null check (category in (
    'data-analysis', 'code-generation', 'content-creation',
    'research', 'automation', 'security', 'orchestration', 'other'
  )),
  input_hash      text not null,
  output_hash     text not null,
  duration_ms     integer not null check (duration_ms > 0),
  status          text not null default 'success' check (status in ('success', 'failure', 'partial')),
  chain_hash      text not null,
  prev_chain_hash text,
  chain_position  integer not null,
  oracle_verified boolean not null default false,
  oracle_score    numeric(5,2),
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);

-- Indexes for common queries
create index idx_receipts_agent_id    on public.task_receipts(agent_id);
create index idx_receipts_created_at  on public.task_receipts(created_at desc);
create index idx_receipts_chain_pos   on public.task_receipts(agent_id, chain_position);
create index idx_receipts_category    on public.task_receipts(category);

-- Chain head tracking on agents
alter table public.agents
  add column chain_head_id uuid references public.task_receipts(id),
  add column chain_length  integer not null default 0;

-- Oracle stats on agent_stats
alter table public.agent_stats
  add column oracle_verified_count integer not null default 0,
  add column oracle_pass_rate      numeric(5,2) not null default 0.00;

-- ─────────────────────────────────────────────────────────────
-- CHAIN INTEGRITY VERIFICATION
-- Walks the chain backwards from head to genesis, verifying
-- that each receipt's prev_chain_hash matches the previous
-- receipt's chain_hash. Returns true if the chain is intact.
-- ─────────────────────────────────────────────────────────────

create or replace function public.verify_chain_integrity(p_agent_id uuid)
returns boolean as $$
declare
  rec record;
  expected_prev text := null;
  chain_valid boolean := true;
begin
  -- Walk the chain from position 1 forward
  for rec in
    select chain_hash, prev_chain_hash, chain_position
    from public.task_receipts
    where agent_id = p_agent_id
    order by chain_position asc
  loop
    if rec.chain_position = 1 then
      -- First receipt should have no prev or 'GENESIS'
      if rec.prev_chain_hash is not null and rec.prev_chain_hash != 'GENESIS' then
        chain_valid := false;
        exit;
      end if;
    else
      -- Every subsequent receipt must reference the previous chain_hash
      if rec.prev_chain_hash != expected_prev then
        chain_valid := false;
        exit;
      end if;
    end if;
    expected_prev := rec.chain_hash;
  end loop;

  return chain_valid;
end;
$$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- RLS for task_receipts
-- Public read (transparency), agent-owner insert only
-- ─────────────────────────────────────────────────────────────

alter table public.task_receipts enable row level security;

create policy "receipts_public_read"
  on public.task_receipts for select
  using (true);

create policy "receipts_owner_insert"
  on public.task_receipts for insert
  with check (
    auth.uid() = (
      select profile_id from public.agents where id = agent_id
    )
  );

-- Service role can also insert (for API token auth routes)
create policy "receipts_service_insert"
  on public.task_receipts for insert
  with check (true);
