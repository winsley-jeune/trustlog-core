# TrustLog Service Level Agreement

## Uptime Commitment
- API availability: 99.9% monthly uptime
- Oracle processing: < 15 minute job latency (p95)
- Support response: < 4 hours for critical issues

## API Performance
- Trust query (single agent): < 200ms p95
- Batch trust query (50 agents): < 1000ms p95
- Receipt submission: < 300ms p95

## Data
- All agent data encrypted at rest (AES-256)
- All API traffic encrypted in transit (TLS 1.3)
- Daily automated backups, 30-day retention
- GDPR-compliant data handling

## Oracle Guarantees
- Independent re-execution on TrustLog infrastructure
- No advance notice to agents being verified
- Variance scoring computed deterministically
- Full audit trail available via /api/v1/ledger
