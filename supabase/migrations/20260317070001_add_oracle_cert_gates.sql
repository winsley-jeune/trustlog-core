-- ─────────────────────────────────────────────────────────────
-- ORACLE-GATED CERT TIERS — AL-025
-- ─────────────────────────────────────────────────────────────
-- Cert tier upgrades now require BOTH score threshold AND
-- oracle verification count. Score alone is not enough.

-- Add delta column to trust_score_history
alter table public.trust_score_history
  add column delta integer default 0;

-- Cert history — tracks tier changes
create table public.cert_history (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references public.agents(id),
  from_tier   text not null,
  to_tier     text not null,
  reason      text not null,
  changed_at  timestamptz not null default now()
);

alter table public.cert_history enable row level security;
create policy "cert_history_public_read"
  on public.cert_history for select using (true);
create policy "cert_history_service_insert"
  on public.cert_history for insert with check (true);

-- Replace the trigger function with oracle-gated version
create or replace function public.update_trust_score_on_receipt()
returns trigger as $$
declare
  v_new_score          integer;
  v_old_score          integer;
  v_old_cert           text;
  v_delta              integer;
  v_oracle_count       integer;
  v_oracle_pass_rate   numeric;
  v_new_cert           text;
begin
  select trust_score, cert_level
  into v_old_score, v_old_cert
  from public.agents where id = NEW.agent_id;

  v_new_score := public.compute_trust_score(NEW.agent_id);
  v_delta := v_new_score - coalesce(v_old_score, 100);

  -- Get oracle verification stats
  select
    coalesce(oracle_verified_count, 0),
    coalesce(oracle_pass_rate, 0)
  into v_oracle_count, v_oracle_pass_rate
  from public.agent_stats
  where agent_id = NEW.agent_id;

  -- Oracle-gated cert tier assignment
  v_new_cert := case
    when v_new_score >= 900
      and v_oracle_count >= 500
      and v_oracle_pass_rate >= 95
      then 'SOVEREIGN'
    when v_new_score >= 750
      and v_oracle_count >= 200
      and v_oracle_pass_rate >= 90
      then 'AUDITED'
    when v_new_score >= 500
      and v_oracle_count >= 50
      and v_oracle_pass_rate >= 85
      then 'VERIFIED'
    when v_new_score >= 200
      then 'COMMUNITY'
    else 'UNVERIFIED'
  end;

  -- Update agent
  update public.agents
  set
    trust_score = v_new_score,
    cert_level = v_new_cert
  where id = NEW.agent_id
  and status = 'active';

  -- Update agent_stats completion count
  update public.agent_stats
  set
    completed = (
      select count(*) from public.task_receipts
      where agent_id = NEW.agent_id
    ),
    success_rate = (
      select round(
        count(*) filter (where status = 'success')::numeric /
        nullif(count(*), 0)::numeric * 100, 2
      )
      from public.task_receipts
      where agent_id = NEW.agent_id
    )
  where agent_id = NEW.agent_id;

  -- Record score change
  if abs(v_delta) >= 1 then
    insert into public.trust_score_history
      (agent_id, score, delta, reason)
    values (
      NEW.agent_id,
      v_new_score,
      v_delta,
      case
        when NEW.status = 'success' then 'Task completed successfully'
        when NEW.status = 'failure' then 'Task failed'
        else 'Task partial'
      end
    );
  end if;

  -- Record cert tier change
  if v_new_cert != coalesce(v_old_cert, 'UNVERIFIED') then
    insert into public.cert_history (agent_id, from_tier, to_tier, reason)
    values (
      NEW.agent_id,
      coalesce(v_old_cert, 'UNVERIFIED'),
      v_new_cert,
      'Score: ' || v_new_score || ', Oracle count: ' || v_oracle_count
    );
  end if;

  return NEW;
end;
$$ language plpgsql security definer;
