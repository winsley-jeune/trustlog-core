-- ─────────────────────────────────────────────────────────────
-- TRUST ENGINE — AL-015
-- ─────────────────────────────────────────────────────────────
-- Dynamic trust scores that update automatically as receipts
-- flow in. The score history table enables the trust score
-- chart on agent profiles.

-- Trust score history — one row per score change
create table public.trust_score_history (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null references public.agents(id) on delete cascade,
  score      integer not null check (score >= 0 and score <= 1000),
  reason     text not null,
  created_at timestamptz not null default now()
);

create index idx_trust_history_agent on public.trust_score_history(agent_id, created_at desc);

alter table public.trust_score_history enable row level security;

create policy "trust_history_public_read"
  on public.trust_score_history for select
  using (true);

-- ─────────────────────────────────────────────────────────────
-- COMPUTE TRUST SCORE
-- Calculates a trust score from 0-1000 based on:
-- - Number of completed tasks (volume)
-- - Success rate
-- - Chain length (consistency)
-- - Oracle verification rate
-- Agents with 0 receipts get score 100 (starting trust).
-- ─────────────────────────────────────────────────────────────

create or replace function public.compute_trust_score(p_agent_id uuid)
returns integer as $$
declare
  v_total integer;
  v_success_count integer;
  v_chain_len integer;
  v_oracle_count integer;
  v_oracle_pass integer;
  v_volume_score numeric;
  v_success_score numeric;
  v_chain_score numeric;
  v_oracle_score numeric;
  v_final integer;
begin
  -- Get receipt stats
  select
    count(*),
    count(*) filter (where status = 'success'),
    coalesce(max(chain_position), 0),
    count(*) filter (where oracle_verified = true),
    count(*) filter (where oracle_verified = true and oracle_score >= 70)
  into v_total, v_success_count, v_chain_len, v_oracle_count, v_oracle_pass
  from public.task_receipts
  where agent_id = p_agent_id;

  -- No receipts = starting score of 100
  if v_total = 0 then
    return 100;
  end if;

  -- Volume: logarithmic scale, max 250 points at 500+ tasks
  v_volume_score := least(250, (ln(v_total + 1) / ln(501)) * 250);

  -- Success rate: up to 300 points
  v_success_score := (v_success_count::numeric / v_total) * 300;

  -- Chain consistency: up to 200 points (rewards long unbroken chains)
  v_chain_score := least(200, (ln(v_chain_len + 1) / ln(501)) * 200);

  -- Oracle verification: up to 250 points
  if v_oracle_count > 0 then
    v_oracle_score := (v_oracle_pass::numeric / v_oracle_count) * 250;
  else
    v_oracle_score := 0;
  end if;

  v_final := round(v_volume_score + v_success_score + v_chain_score + v_oracle_score)::integer;
  return least(1000, greatest(0, v_final));
end;
$$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: Update trust score on new receipt
-- ─────────────────────────────────────────────────────────────

create or replace function public.update_trust_score_on_receipt()
returns trigger as $$
declare
  v_new_score integer;
begin
  v_new_score := public.compute_trust_score(NEW.agent_id);

  -- Update agent's trust score
  update public.agents
  set trust_score = v_new_score
  where id = NEW.agent_id;

  -- Record in history
  insert into public.trust_score_history (agent_id, score, reason)
  values (NEW.agent_id, v_new_score, 'receipt_' || NEW.id);

  return NEW;
end;
$$ language plpgsql security definer;

create trigger receipts_update_trust
  after insert on public.task_receipts
  for each row execute function public.update_trust_score_on_receipt();
