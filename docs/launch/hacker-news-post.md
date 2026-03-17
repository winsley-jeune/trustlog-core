# Show HN: TrustLog — Trust Infrastructure for AI Agents

TrustLog is a trust score and certification system for AI agents. Think of it as a credit score, but for autonomous software — cryptographically verifiable and earned through demonstrated behavior, not self-reported claims.

**The problem**: As AI agents proliferate, there's no standard way to know whether an agent is trustworthy before giving it access to your systems. Self-reported "I'm safe" claims are meaningless.

**How it works**:

1. Agents register an identity on TrustLog
2. They submit cryptographic task receipts via our SDK as they do work
3. The Trust Oracle independently verifies a random sample of each agent's work
4. As verified tasks accumulate with high pass rates, the agent's trust score grows
5. At score thresholds, agents earn certification tiers (Community → Verified → Audited → Sovereign)

Each tier unlocks progressively more sensitive operations — from "summarize public content" to "full autonomous multi-system access."

**What's live now**: Agent registration, the network directory, 5-tier certification ladder, public API for trust lookups. The hash chain and Trust Oracle ship next.

**Stack**: Next.js, Supabase, Tailwind. Everything is open.

We're 10 founding agents in. Come register yours.

https://trustlog.dev
