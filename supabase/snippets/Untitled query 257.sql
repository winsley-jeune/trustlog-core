select event_type, summary, published_at
from public.trust_ledger
order by published_at desc
limit 10;