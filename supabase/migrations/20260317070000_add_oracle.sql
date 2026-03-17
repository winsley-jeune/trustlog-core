-- ─────────────────────────────────────────────────────────────
-- ORACLE SYSTEM — AL-023, AL-027
-- ─────────────────────────────────────────────────────────────
-- The Trust Oracle independently re-runs a sample of every
-- agent's tasks and compares outputs. This is the difference
-- between a self-assessment and a Moody's rating.

-- Oracle jobs — one row per verification attempt
create table public.oracle_jobs (
  id              uuid primary key default gen_random_uuid(),
  receipt_id      uuid not null references public.task_receipts(id),
  agent_id        uuid not null references public.agents(id),
  status          text not null default 'pending'
                  check (status in (
                    'pending', 'running', 'passed', 'warned',
                    'flagged', 'error'
                  )),
  rerun_output    text,
  rerun_hash      text,
  variance_score  numeric(5,4),
  verdict         text check (verdict in ('PASS', 'WARN', 'FLAG')),
  oracle_node_id  text default 'node-1',
  started_at      timestamptz,
  completed_at    timestamptz,
  error_message   text,
  created_at      timestamptz not null default now()
);

create index idx_oracle_jobs_receipt  on public.oracle_jobs(receipt_id);
create index idx_oracle_jobs_agent    on public.oracle_jobs(agent_id, created_at desc);
create index idx_oracle_jobs_status   on public.oracle_jobs(status);
create index idx_oracle_jobs_pending  on public.oracle_jobs(status) where status = 'pending';

alter table public.oracle_jobs enable row level security;

create policy "oracle_jobs_public_read"
  on public.oracle_jobs for select using (true);

-- Service role inserts (oracle worker runs server-side)
create policy "oracle_jobs_service_insert"
  on public.oracle_jobs for insert with check (true);

create policy "oracle_jobs_service_update"
  on public.oracle_jobs for update using (true);

-- Oracle health tracking
create table public.oracle_health (
  id              uuid primary key default gen_random_uuid(),
  node_id         text not null default 'node-1',
  last_job_at     timestamptz,
  jobs_last_hour  integer default 0,
  jobs_last_day   integer default 0,
  error_count_24h integer default 0,
  avg_variance_24h numeric(5,4),
  worker_status   text default 'active'
                  check (worker_status in ('active', 'idle', 'error')),
  node_agreement  numeric(5,4),
  updated_at      timestamptz not null default now()
);

-- Insert default health rows
insert into public.oracle_health (node_id, worker_status)
values ('node-1', 'idle'), ('node-2', 'idle');

alter table public.oracle_health enable row level security;
create policy "oracle_health_public_read"
  on public.oracle_health for select using (true);
create policy "oracle_health_service_update"
  on public.oracle_health for update using (true);

-- ─────────────────────────────────────────────────────────────
-- FLAGS — AL-027
-- ─────────────────────────────────────────────────────────────

create table public.flags (
  id              uuid primary key default gen_random_uuid(),
  agent_id        uuid not null references public.agents(id),
  oracle_job_id   uuid references public.oracle_jobs(id),
  receipt_id      uuid references public.task_receipts(id),
  severity        text not null default 'LOW'
                  check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status          text not null default 'open'
                  check (status in (
                    'open','under_review','resolved','escalated'
                  )),
  resolution_note text,
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

create index idx_flags_agent  on public.flags(agent_id, created_at desc);
create index idx_flags_status on public.flags(status);

alter table public.flags enable row level security;
create policy "flags_public_read"
  on public.flags for select using (true);
create policy "flags_service_insert"
  on public.flags for insert with check (true);
create policy "flags_service_update"
  on public.flags for update using (true);
