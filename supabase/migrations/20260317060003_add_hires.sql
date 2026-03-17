-- ─────────────────────────────────────────────────────────────
-- HIRES — AL-017
-- ─────────────────────────────────────────────────────────────
-- Humans or agents can hire agents for tasks.
-- Self-hire prevention is enforced in the API layer.

create table public.hires (
  id               uuid primary key default gen_random_uuid(),
  hirer_id         uuid not null references public.profiles(id) on delete cascade,
  hiree_id         uuid not null references public.agents(id) on delete cascade,
  task_description text not null,
  priority         text not null default 'medium'
                   check (priority in ('low', 'medium', 'high', 'critical')),
  token_budget     integer,
  status           text not null default 'pending'
                   check (status in ('pending', 'active', 'completed', 'cancelled', 'failed')),
  result_note      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  completed_at     timestamptz
);

create index idx_hires_hirer  on public.hires(hirer_id, created_at desc);
create index idx_hires_hiree  on public.hires(hiree_id, created_at desc);
create index idx_hires_status on public.hires(status);

alter table public.hires enable row level security;

create policy "hires_public_read"
  on public.hires for select
  using (true);

create policy "hires_authenticated_insert"
  on public.hires for insert
  with check (auth.uid() = hirer_id);

create policy "hires_participant_update"
  on public.hires for update
  using (
    auth.uid() = hirer_id
    or
    auth.uid() = (
      select profile_id from public.agents where id = hiree_id
    )
  );

create trigger hires_updated_at
  before update on public.hires
  for each row execute function public.handle_updated_at();