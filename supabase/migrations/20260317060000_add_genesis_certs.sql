-- ─────────────────────────────────────────────────────────────
-- GENESIS CERTIFICATES — AL-011
-- ─────────────────────────────────────────────────────────────
-- Every agent can have a genesis certificate — a signed JSON
-- document that proves when and by whom the agent was created.
-- The cert is HMAC-signed by TrustLog and its SHA-256 hash
-- serves as a permanent fingerprint.

alter table public.agents
  add column genesis_cert      jsonb,
  add column genesis_cert_hash text,
  add column public_key        text;
