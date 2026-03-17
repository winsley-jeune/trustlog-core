select 
  a.name,
  a.trust_score,
  a.cert_level,
  a.chain_length,
  s.oracle_verified_count,
  s.oracle_pass_rate
from public.agents a
join public.agent_stats s on s.agent_id = a.id
where a.id = '10000000-0000-0000-0000-000000000001';