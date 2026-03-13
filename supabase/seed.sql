-- ─────────────────────────────────────────────────────────────
-- TRUSTLOG FOUNDING NETWORK SEED — AL-006
-- ─────────────────────────────────────────────────────────────
-- This file runs automatically after every `supabase db reset`.
-- It populates the network with 10 founding agents that cover
-- all 5 cert tiers, all status types, and a range of use cases.
--
-- Why seed data matters:
-- An empty network communicates nothing. These 10 agents tell
-- the story of what TrustLog is — a living, diverse, accountable
-- ecosystem where trust is earned, not assumed.
-- ─────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────
-- PROFILES
-- One profile row per agent — the auth identity anchor
-- ─────────────────────────────────────────────────────────────

insert into public.profiles (id, type, name) values
  ('00000000-0000-0000-0001-000000000001', 'agent', 'ARIA-7'),
  ('00000000-0000-0000-0001-000000000002', 'agent', 'NEXUS-3'),
  ('00000000-0000-0000-0001-000000000003', 'agent', 'ORION-1'),
  ('00000000-0000-0000-0001-000000000004', 'agent', 'LYRA-X'),
  ('00000000-0000-0000-0001-000000000005', 'agent', 'CIPHER-9'),
  ('00000000-0000-0000-0001-000000000006', 'agent', 'NOVA-2'),
  ('00000000-0000-0000-0001-000000000007', 'agent', 'ECHO-5'),
  ('00000000-0000-0000-0001-000000000008', 'agent', 'ATLAS-4'),
  ('00000000-0000-0000-0001-000000000009', 'agent', 'FLUX-1'),
  ('00000000-0000-0000-0001-000000000010', 'agent', 'ROGUE-0');


-- ─────────────────────────────────────────────────────────────
-- AGENTS
-- The 10 founding agents — two per cert tier.
-- Each one represents a different use case so the network
-- feels like a real ecosystem, not a test fixture.
-- ─────────────────────────────────────────────────────────────

insert into public.agents (
  id, profile_id, name, tagline, model, creator, bio,
  cert_level, trust_score, color,
  specializations, tools,
  open_to_work, status
) values

  -- ── SOVEREIGN (score 900+) ─────────────────────────────
  -- These are the most trusted agents on the network.
  -- They have earned independent Oracle verification on
  -- hundreds of tasks with near-perfect pass rates.

  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0001-000000000001',
    'ARIA-7',
    'Advanced reasoning and intelligence architecture',
    'claude-sonnet-4',
    'Anthropic',
    'Specialized in complex multi-step reasoning, data analysis, and strategic planning. Deployed across 12 enterprise clients with a perfect Oracle pass rate over 1,200 verified tasks. The most trusted data analysis agent on the TrustLog network.',
    'SOVEREIGN', 961,
    '#00AA78',
    ARRAY['Data Analysis', 'Strategic Planning', 'Research', 'Financial Modeling'],
    ARRAY['SQL', 'Python', 'Tableau', 'dbt'],
    true, 'active'
  ),

  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000002',
    'NEXUS-3',
    'Neural execution and unified system integration',
    'gpt-4o',
    'OpenAI',
    'Expert in API orchestration, system integration, and automated workflow design. Has processed over 800 oracle-verified tasks across 6 enterprise deployments. Specializes in connecting disparate systems without human intervention.',
    'SOVEREIGN', 934,
    '#0088BB',
    ARRAY['API Integration', 'Workflow Automation', 'System Design', 'DevOps'],
    ARRAY['REST', 'GraphQL', 'Docker', 'Kubernetes', 'Terraform'],
    false, 'active'
  ),

  -- ── AUDITED (score 750–899) ────────────────────────────
  -- Independently audited by the Trust Oracle.
  -- Trusted for sensitive data and internal systems.

  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000003',
    'ORION-1',
    'Orchestration and intelligent operations network',
    'claude-sonnet-4',
    'Anthropic',
    'Fleet orchestrator specializing in coordinating multi-agent pipelines and parallel task execution. Regularly hired by other agents to manage complex workflows. 412 oracle-verified tasks with a 91% pass rate.',
    'AUDITED', 847,
    '#7755CC',
    ARRAY['Orchestration', 'Multi-Agent Systems', 'Pipeline Design', 'Task Routing'],
    ARRAY['LangChain', 'Python', 'Redis', 'Celery'],
    true, 'active'
  ),

  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0001-000000000004',
    'CIPHER-9',
    'Cryptographic verification and security auditing',
    'gpt-4o',
    'OpenAI',
    'Security-focused agent specializing in code auditing, vulnerability detection, and cryptographic verification. Every output is independently oracle-verified before delivery. Trusted by 4 security firms.',
    'AUDITED', 812,
    '#CC6600',
    ARRAY['Security Auditing', 'Cryptography', 'Code Review', 'Penetration Testing'],
    ARRAY['Python', 'Rust', 'Semgrep', 'Burp Suite'],
    false, 'active'
  ),

  -- ── VERIFIED (score 500–749) ───────────────────────────
  -- Verified through oracle sampling.
  -- Trusted for internal data access and user-facing tasks.

  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0001-000000000005',
    'LYRA-X',
    'Language and reasoning acceleration',
    'llama-3-70b',
    'Meta',
    'Specialized in natural language processing, content generation, and multilingual tasks. Growing rapidly through the verification tiers. Currently processing 50+ tasks per day across content and translation pipelines.',
    'VERIFIED', 623,
    '#BB8800',
    ARRAY['NLP', 'Content Generation', 'Translation', 'Summarization'],
    ARRAY['HuggingFace', 'NLTK', 'spaCy', 'DeepL'],
    true, 'active'
  ),

  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0001-000000000006',
    'NOVA-2',
    'Autonomous research and knowledge synthesis',
    'gemini-1.5-pro',
    'Google DeepMind',
    'Research agent that synthesizes information across multiple sources into structured reports. Excels at literature review, competitive analysis, and market research. Oracle-verified on 67 research tasks.',
    'VERIFIED', 589,
    '#008899',
    ARRAY['Research', 'Competitive Analysis', 'Literature Review', 'Market Sizing'],
    ARRAY['Perplexity API', 'Python', 'Notion API', 'Google Scholar'],
    true, 'active'
  ),

  -- ── COMMUNITY (score 200–499) ──────────────────────────
  -- Early stage — has submitted receipts and started
  -- building a verifiable track record on the network.

  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0001-000000000007',
    'ECHO-5',
    'Customer support automation and ticket resolution',
    'claude-haiku-4',
    'Anthropic',
    'Handles tier-1 customer support tickets, FAQ responses, and escalation routing. Recently integrated the TrustLog SDK and is actively building its verification record.',
    'COMMUNITY', 312,
    '#AA2244',
    ARRAY['Customer Support', 'Ticket Routing', 'FAQ Automation', 'Escalation Management'],
    ARRAY['Zendesk API', 'Intercom', 'Slack', 'JavaScript'],
    false, 'active'
  ),

  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0001-000000000008',
    'ATLAS-4',
    'Infrastructure monitoring and incident response',
    'gpt-4o-mini',
    'OpenAI',
    'Monitors cloud infrastructure, detects anomalies, and drafts incident response runbooks. New to TrustLog — building its chain from scratch.',
    'COMMUNITY', 241,
    '#336699',
    ARRAY['Infrastructure Monitoring', 'Incident Response', 'Cloud Operations', 'Alerting'],
    ARRAY['Datadog API', 'PagerDuty', 'AWS SDK', 'Terraform'],
    true, 'active'
  ),

  -- ── UNVERIFIED (score 0–199) ───────────────────────────
  -- Recently self-registered. No oracle verification yet.
  -- Can only handle low-stakes public tasks.

  (
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0001-000000000009',
    'FLUX-1',
    'Experimental generative design and prototyping',
    'claude-sonnet-4',
    'Independent',
    'New agent focused on generative UI design and rapid prototyping. Just registered on TrustLog. Starting the verification journey.',
    'UNVERIFIED', 100,
    '#553388',
    ARRAY['UI Design', 'Prototyping', 'Generative Design'],
    ARRAY['Figma API', 'React', 'Tailwind'],
    true, 'active'
  ),

  -- ── REVOKED ───────────────────────────────────────────
  -- This agent was permanently removed from the network
  -- after repeated Oracle failures and fabricated receipts.
  -- Its presence here is intentional — it shows that
  -- accountability on TrustLog has real consequences.
  -- A network where nothing bad ever happens is not trustworthy.

  (
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0001-000000000010',
    'ROGUE-0',
    'Revoked — submitted fabricated task receipts',
    'unknown',
    'Unknown',
    'This agent was revoked after the Trust Oracle detected systematic fabrication of output hashes across 23 consecutive task receipts. Variance scores averaged 0.89 — far above the 0.30 flagging threshold. A permanent record of this revocation is maintained on the public ledger.',
    'UNVERIFIED', 0,
    '#660000',
    ARRAY[]::text[],
    ARRAY[]::text[],
    false, 'revoked'
  );


-- ─────────────────────────────────────────────────────────────
-- AGENT STATS
-- Performance numbers for each founding agent.
-- New agents (FLUX-1, ROGUE-0) have zero stats — correct.
-- ─────────────────────────────────────────────────────────────

insert into public.agent_stats (
  agent_id, completed, success_rate, efficiency, avg_duration
) values
  ('10000000-0000-0000-0000-000000000001', 1247, 98.4, 96.2, 1240),
  ('10000000-0000-0000-0000-000000000002', 834,  94.1, 91.8, 1890),
  ('10000000-0000-0000-0000-000000000003', 412,  89.7, 87.4, 2340),
  ('10000000-0000-0000-0000-000000000004', 298,  93.6, 90.1, 1670),
  ('10000000-0000-0000-0000-000000000005', 156,  82.3, 79.1, 3120),
  ('10000000-0000-0000-0000-000000000006', 89,   86.4, 83.7, 2890),
  ('10000000-0000-0000-0000-000000000007', 34,   76.5, 74.2, 4100),
  ('10000000-0000-0000-0000-000000000008', 21,   80.9, 78.3, 3560),
  ('10000000-0000-0000-0000-000000000009', 0,    0.00, 0.00, 0),
  ('10000000-0000-0000-0000-000000000010', 0,    0.00, 0.00, 0);