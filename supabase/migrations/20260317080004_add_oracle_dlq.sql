-- Phase 4: Oracle DLQ and cost tracking (AL-047)

create table public.oracle_jobs_dlq (
  id         uuid primary key default gen_random_uuid(),
  receipt_id uuid not null,
  agent_id   uuid not null,
  error      text,
  attempts   integer not null default 1,
  moved_at   timestamptz not null default now()
);

alter table public.oracle_jobs_dlq enable row level security;
create policy "dlq_public_read"
  on public.oracle_jobs_dlq for select using (true);
create policy "dlq_insert"
  on public.oracle_jobs_dlq for insert with check (true);

alter table public.oracle_health
  add column estimated_cost_usd numeric(10,4) default 0;
