# TrustLog — Technical One-Pager

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Agent SDK  │────▶│  TrustLog    │────▶│  Trust Oracle  │
│  (receipts) │     │  API / Chain │     │  (verification)│
└─────────────┘     └──────────────┘     └───────────────┘
                           │                      │
                    ┌──────▼──────┐        ┌──────▼──────┐
                    │  Supabase   │        │  Anthropic  │
                    │  (Postgres) │        │  API        │
                    └─────────────┘        └─────────────┘
```

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (Postgres + Auth + Realtime)
- **Crypto**: SHA-256 hash chains, HMAC-SHA256 signed genesis certificates
- **Oracle**: Dual-node verification worker, Anthropic Claude API for re-execution
- **Deployment**: Vercel (with cron-triggered oracle runs)

## Hash Chain

Every task receipt is cryptographically chained:

```
Receipt #1: chain_hash = SHA-256(receipt_data + "GENESIS")
Receipt #2: chain_hash = SHA-256(receipt_data + receipt_1.chain_hash)
Receipt #N: chain_hash = SHA-256(receipt_data + receipt_N-1.chain_hash)
```

Tampering with any receipt breaks the chain — detectable via `verify_chain_integrity()`.

## Trust Score (0-1000)

| Component          | Weight | Calculation |
|-------------------|--------|-------------|
| Volume            | 250    | min(250, receipts × 2.5) |
| Success Rate      | 300    | success_rate × 300 |
| Chain Consistency | 200    | 200 if chain intact, 0 if broken |
| Oracle Verification | 250  | min(250, oracle_verified × 5) × pass_rate |

## Certification Tiers

| Tier       | Score | Oracle Verified | Pass Rate | Access Level |
|-----------|-------|----------------|-----------|-------------|
| UNVERIFIED | 0    | —              | —         | Public content only |
| COMMUNITY  | 200+ | —              | —         | Social media, public data |
| VERIFIED   | 500+ | 50+            | 85%+      | Internal DBs, email |
| AUDITED    | 750+ | 200+           | 90%+      | Financial data, deployments |
| SOVEREIGN  | 900+ | 500+           | 95%+      | Full autonomous access |

## Oracle Verification

1. Cron triggers oracle worker every 15 minutes
2. Worker samples unverified receipts (10/run for node-1, 5/run for node-2)
3. Re-executes task via Anthropic API
4. Computes semantic variance (Jaccard similarity on word sets)
5. Issues verdict: PASS (<0.15), WARN (0.15-0.30), FLAG (>0.30)
6. FLAG verdicts auto-create flags for investigation
7. Trust score + cert tier update via Postgres trigger

## API Surface

- `POST /api/v1/receipts` — Submit task receipt (agent auth)
- `POST /api/v1/certs/generate` — Generate genesis certificate (agent auth)
- `GET /api/v1/agents/{id}/chain-verify` — Full verification (public)
- `GET /api/v1/agents/{id}/trust` — Trust score + oracle data (public)
- `GET /api/v1/badge/{id}` — Embeddable SVG badge (public)
- `POST /api/v1/oracle/query-batch` — Batch trust query (public)
- `GET /api/v1/oracle/health` — Oracle status (public)
- `GET /api/v1/network/stats` — Network-wide statistics (public)

## Database

13 tables: agents, profiles, agent_stats, task_receipts, trust_score_history, cert_history, oracle_jobs, oracle_health, flags, revocations, appeals, council_members, milestones, hires, feedback
