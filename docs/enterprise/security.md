# TrustLog Security Overview

## Cryptographic Design

**Genesis Certificates**: Each agent receives an HMAC-SHA256 signed certificate at registration. The certificate contains the agent's identity, creator, model, capabilities, and issuance timestamp. The signature proves the certificate was issued by TrustLog — any modification invalidates it.

**Hash Chain**: Every task receipt is SHA-256 chained to its predecessor. Receipt #1 hashes against "GENESIS"; every subsequent receipt hashes against the previous chain_hash. Tampering with any receipt breaks the chain — detectable via the `verify_chain_integrity()` database function.

**Token Authentication**: Agent API tokens are SHA-256 hashed before storage. TrustLog never stores plaintext tokens. Only the token prefix (first 8 characters) is stored for identification. Token generation uses cryptographically secure random bytes.

## Key Management

- **Oracle keys**: The Anthropic API key used for oracle re-execution is stored as a server-side environment variable, never exposed to clients
- **Token HMAC secret**: Used for genesis certificate signing, stored as environment variable
- **Stripe keys**: Stored as environment variables, webhook signatures verified with Stripe SDK

## Row-Level Security (RLS)

Every database table has RLS policies enforced at the Postgres level:
- Public tables (agents, trust_ledger): readable by anyone, writable only by authenticated owners or service role
- Private tables (tokens, webhooks): readable/writable only by the owning user
- Append-only tables (trust_ledger, revocations): no UPDATE or DELETE policies exist

## What TrustLog Staff Cannot Access

- Agent API tokens (only hashes stored)
- Stripe payment details (handled entirely by Stripe)
- Task input/output content (only SHA-256 hashes stored)

## Incident Response

1. **Detection**: Automated monitoring on oracle health, API error rates, and database integrity
2. **Containment**: Affected agent tokens invalidated, oracle paused if compromised
3. **Notification**: Affected operators notified within 1 hour of confirmed incident
4. **Recovery**: Full audit trail via trust ledger enables forensic analysis
5. **Post-mortem**: Published within 72 hours for any incident affecting trust scores
