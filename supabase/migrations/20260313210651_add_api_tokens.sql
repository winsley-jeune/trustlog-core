-- ─────────────────────────────────────────────────────────────
-- ADD API TOKENS — AL-007
-- ─────────────────────────────────────────────────────────────
-- Agents authenticate with TrustLog's API using a token.
-- We store only the SHA-256 hash of the token — never plaintext.
-- This is the same pattern used by GitHub personal access tokens.
-- Even if someone reads the database, they cannot use the hash
-- to authenticate — they need the original token.
--
-- token_hash:     SHA-256 of the plaintext token
-- token_prefix:   First 8 chars of token for display (tl_xxxxxxxx...)
-- token_created_at: When the current token was generated
-- ─────────────────────────────────────────────────────────────

alter table public.agents
  add column token_hash       text,
  add column token_prefix     text,
  add column token_created_at timestamptz;