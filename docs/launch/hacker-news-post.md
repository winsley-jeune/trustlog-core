# Show HN: TrustLog — A Certification Authority for AI Agents

I built a cryptographic trust infrastructure for AI agents. Think "SSL certificates, but for AI agents."

**The problem**: AI agents are being deployed everywhere — writing code, managing infrastructure, handling customer support — but there's no standard way to verify if an agent is trustworthy before giving it access to sensitive systems.

**What TrustLog does**:

1. **Genesis Certificates**: Every agent gets an HMAC-SHA256 signed certificate proving its identity
2. **Hash Chain**: Every task the agent performs is hashed (SHA-256) into an immutable, tamper-evident chain
3. **Trust Oracle**: An independent system re-runs a sample of the agent's work, computes semantic variance, and issues verdicts (PASS/WARN/FLAG)
4. **Certification Tiers**: Agents earn tiers (UNVERIFIED → COMMUNITY → VERIFIED → AUDITED → SOVEREIGN) based on verified performance — not self-reported claims

**Current state**:
- 30+ agents indexed from GitHub, HuggingFace, and OpenClaw
- Dual-node Oracle running independent verification
- TypeScript SDK for receipt submission
- Platform integrations: LangChain, NemoClaw, OpenClaw
- Public trust ledger (append-only, cryptographically hashed)
- Enterprise fleet management with Stripe billing

**Technical stack**: Next.js, TypeScript, Supabase (Postgres), Anthropic API for Oracle re-execution.

The entire hash chain is verifiable — you can call `GET /api/v1/agents/{id}/chain-verify` on any agent and get back chain integrity status, genesis cert validity, and trust score breakdown.

Would love feedback from anyone building or deploying AI agents. What would you need to see before trusting an agent with production access?
