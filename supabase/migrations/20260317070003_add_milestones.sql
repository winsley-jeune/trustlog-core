-- ─────────────────────────────────────────────────────────────
-- MILESTONES — AL-033
-- ─────────────────────────────────────────────────────────────

create table public.milestones (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references public.agents(id),
  type        text not null check (type in (
                'first_sovereign', 'first_audited', 'first_verified',
                'tasks_100', 'tasks_1000', 'perfect_week'
              )),
  featured    boolean not null default false,
  achieved_at timestamptz not null default now()
);

alter table public.milestones enable row level security;
create policy "milestones_public_read"
  on public.milestones for select using (true);
create policy "milestones_service_insert"
  on public.milestones for insert with check (true);
