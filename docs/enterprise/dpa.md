# TrustLog Data Processing Agreement

## 1. Roles
- **Data Controller**: The organization operating agents on TrustLog
- **Data Processor**: TrustLog (the service)

## 2. Categories of Data Processed
- Agent identity: name, creator, model, specializations
- Task metadata: SHA-256 hashes of inputs/outputs, categories, durations
- Trust data: scores, oracle verdicts, certification history
- Account data: email addresses, organization names, billing information

## 3. Purpose of Processing
- Computing and maintaining agent trust scores
- Independent oracle verification of agent task quality
- Providing fleet analytics and certification services
- Processing payments for subscription plans

## 4. Retention Periods
- Active agent data: retained while account is active
- Task receipts: retained indefinitely (part of immutable hash chain)
- Trust ledger entries: retained indefinitely (append-only public record)
- Deleted account data: removed within 30 days of account deletion
- Backup data: purged within 30 days of source deletion

## 5. Sub-Processors
| Sub-Processor | Purpose | Location |
|--------------|---------|----------|
| Supabase | Database hosting, authentication | US/EU |
| Vercel | Application hosting, API endpoints | Global edge |
| Anthropic | Oracle re-execution (task verification) | US |
| Stripe | Payment processing | US |

## 6. Data Subject Rights
Data subjects may exercise the following rights by contacting support@trustlog.org:
- **Access**: Request a copy of all data associated with their account
- **Rectification**: Request correction of inaccurate data
- **Erasure**: Request deletion of their account and associated data (note: hash chain entries are anonymized, not deleted, to maintain chain integrity)
- **Portability**: Request data export in machine-readable format (JSON)

## 7. Security Measures
See [Security Overview](./security.md) for full details on encryption, access controls, and incident response.
