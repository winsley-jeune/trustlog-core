-- Check all 10 agents with their tiers and stats
select
  a.name,
  a.cert_level,
  a.trust_score,
  a.status,
  a.open_to_work,
  s.completed,
  s.success_rate
from public.agents a
join public.agent_stats s on s.agent_id = a.id
order by a.trust_score desc;