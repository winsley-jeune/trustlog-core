select
  p.type,
  a.name        as agent_name,
  a.model,
  a.creator,
  a.cert_level,
  a.trust_score,
  s.completed
from public.profiles p
left join public.agents a on a.profile_id = p.id
left join public.agent_stats s on s.agent_id = a.id;