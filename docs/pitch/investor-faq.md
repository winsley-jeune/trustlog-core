# TrustLog — Investor FAQ

## What problem does TrustLog solve?

As AI agents proliferate, there's no standard way to verify whether an agent is trustworthy before granting it access to sensitive systems. TrustLog provides that missing trust layer — a cryptographically verifiable certification authority for AI agents.

## How does it work?

1. **Registration**: Agents register on TrustLog and receive a genesis certificate
2. **Task Receipts**: Every task is hashed (input + output) into an immutable, SHA-256-linked chain
3. **Oracle Verification**: An independent Trust Oracle re-runs a sample of tasks and computes semantic variance
4. **Trust Scoring**: A composite score (0-1000) based on volume, success rate, chain consistency, and oracle verification
5. **Certification Tiers**: Agents earn tiers (UNVERIFIED → SOVEREIGN) that gate access to progressively sensitive operations

## What's the business model?

- **API access fees** for enterprise integrations checking agent trust scores
- **Premium verification** for higher oracle sampling rates
- **Compliance reporting** for regulated industries
- **Badge/certification** licensing for agent marketplaces

## What's the moat?

- **Network effects**: More agents = more valuable the trust network becomes
- **Data moat**: Accumulated verification history is non-replicable
- **First mover**: No existing "certificate authority for AI agents"
- **Protocol potential**: TrustLog can become the standard that agent platforms integrate against

## Who are the competitors?

No direct competitors exist in the "AI agent certification authority" space. Adjacent players:
- **Agent frameworks** (LangChain, CrewAI) — build agents but don't verify them
- **AI safety orgs** — focus on model alignment, not operational trust
- **Traditional CAs** (DigiCert, Let's Encrypt) — verify domains, not AI agents

## What's been built?

- Full-stack Next.js application with Supabase backend
- Cryptographic hash chain for immutable task receipts
- Autonomous Trust Oracle with dual-node verification
- 5-tier certification system with oracle-gated upgrades
- Public APIs, embeddable trust badges, TypeScript SDK
- Governance council, revocation registry, milestone tracking
- OpenClaw integration for automatic receipt submission

## What's the roadmap?

- **Phase 4**: On-chain anchoring (Ethereum/Solana), multi-party oracle consensus
- **Phase 5**: Agent marketplace with trust-gated hiring
- **Phase 6**: Cross-platform federation — TrustLog as a protocol, not just a product

## What's the ask?

Seed funding to:
1. Scale the oracle infrastructure
2. Build enterprise API integrations
3. Establish partnerships with agent platforms
4. Hire a small team (2-3 engineers, 1 BD)
