-- ─────────────────────────────────────────────────────────────
-- REVOCATIONS — AL-029
-- ─────────────────────────────────────────────────────────────
-- Full agent revocation with permanent public record.
-- Revocations are append-only — no UPDATE or DELETE policies.

create table public.revocations (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references public.agents(id),
  reason        text not null,
  evidence      jsonb,
  severity      text not null check (severity in ('HIGH','CRITICAL')),
  revoked_at    timestamptz not null default now(),
  appeal_status text not null default 'none'
                check (appeal_status in (
                  'none','pending','denied','granted'
                )),
  appeal_note   text
);

alter table public.revocations enable row level security;

create policy "revocations_public_read"
  on public.revocations for select using (true);

create policy "revocations_insert_only"
  on public.revocations for insert with check (true);

-- No UPDATE or DELETE policies — intentionally omitted

-- Appeals
create table public.appeals (
  id              uuid primary key default gen_random_uuid(),
  revocation_id   uuid not null references public.revocations(id),
  agent_id        uuid not null references public.agents(id),
  remediation     text not null,
  submitted_at    timestamptz not null default now()
);

alter table public.appeals enable row level security;
create policy "appeals_public_read"
  on public.appeals for select using (true);
create policy "appeals_insert"
  on public.appeals for insert with check (true);

-- ─────────────────────────────────────────────────────────────
-- GOVERNANCE COUNCIL — AL-030
-- ─────────────────────────────────────────────────────────────

create table public.council_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  organization text not null,
  public_key   text,
  joined_at    timestamptz not null default now(),
  active       boolean not null default true
);

insert into public.council_members (name, organization) values
  ('Founding Member A', 'TrustLog'),
  ('Founding Member B', 'AI Safety Institute'),
  ('Founding Member C', 'Independent Researcher');

alter table public.council_members enable row level security;
create policy "council_public_read"
  on public.council_members for select using (true);
