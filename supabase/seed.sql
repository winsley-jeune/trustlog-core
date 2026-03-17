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


-- ─────────────────────────────────────────────────────────────
-- GENESIS CERTIFICATES
-- Generated by scripts/generate-seed-certs.ts using HMAC-SHA256
-- Every active agent gets a signed genesis certificate.
-- ROGUE-0 gets none (revoked before certification).
-- ─────────────────────────────────────────────────────────────

UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000001","name":"ARIA-7","creator":"Anthropic","model":"claude-sonnet-4","capabilities":["Data Analysis","Strategic Planning","Research","Financial Modeling"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"641f0b5f1c880d46b1728509e11823c2546297d90826c0c3f543480a941974d7"}', genesis_cert_hash = '0c04986cd705c22a17afcd74995c207beaa719f95a9fc24c5da287b21072a066', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000002","name":"NEXUS-3","creator":"OpenAI","model":"gpt-4o","capabilities":["API Integration","Workflow Automation","System Design","DevOps"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"4ffc130ffe5985bca1bc62d05c5491d82391b9a680da79d6a4f822d7cd347757"}', genesis_cert_hash = '23622f5a634df834e08e85f9fb5ad26bed9ab535b91b823e3b084d26d11aaa44', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000002';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000003","name":"ORION-1","creator":"Anthropic","model":"claude-sonnet-4","capabilities":["Orchestration","Multi-Agent Systems","Pipeline Design","Task Routing"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"05d35d30f8f156a0a8208cc979c8e38b16048958ce93d9e0ff18f79996811d8b"}', genesis_cert_hash = '9642cc5c7daca28e9466e4f606993e986beabb9a86bd3277403bace6d3e17b65', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000003';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000004","name":"CIPHER-9","creator":"OpenAI","model":"gpt-4o","capabilities":["Security Auditing","Cryptography","Code Review","Penetration Testing"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"520f7428d781d08021b5f48b5c9b9d2828fc32e04dbfe5f70096051f9b49b303"}', genesis_cert_hash = '56a12a88d4abc695c2b9d04cb85f243c8e9621e17749ff5536909f69686b9d6f', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000004';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000005","name":"LYRA-X","creator":"Meta","model":"llama-3-70b","capabilities":["NLP","Content Generation","Translation","Summarization"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"1224c88703e247f2460f6cd00370a519ab017243f2c9bfd627da7edc19b5ada3"}', genesis_cert_hash = 'a2763c6baf8b0233758f2857e709485ed8bb48bc4fbf2561df9aa74837737389', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000005';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000006","name":"NOVA-2","creator":"Google DeepMind","model":"gemini-1.5-pro","capabilities":["Research","Competitive Analysis","Literature Review","Market Sizing"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"1a9bac179f0c9d9e0ba21681c1d04ce463e5071f837fb62e7f63bd1914d55b12"}', genesis_cert_hash = '44b6cf7ec904b541d631796cb00edb89190411f492dd104220a854cd61760c89', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000006';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000007","name":"ECHO-5","creator":"Anthropic","model":"claude-haiku-4","capabilities":["Customer Support","Ticket Routing","FAQ Automation","Escalation Management"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"4ac11a90e4cbf6e7d38d141ce1682a01eb8849a77b51c801d390e2b1095f8b8a"}', genesis_cert_hash = 'ad0edb586af8984553f2e5669dfc382817b46358a75ede0197bbbc83ba11d25a', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000007';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000008","name":"ATLAS-4","creator":"OpenAI","model":"gpt-4o-mini","capabilities":["Infrastructure Monitoring","Incident Response","Cloud Operations","Alerting"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"e3ef48d275bfadf00890c5aa673e05d5e3b9a92f1455d83a88a279e6293662bd"}', genesis_cert_hash = '797c931065d3d18cae8dc1b824acaf20fe8993b8692b8dfd9a04b313c1b1cf2f', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000008';
UPDATE public.agents SET genesis_cert = '{"agent_id":"10000000-0000-0000-0000-000000000009","name":"FLUX-1","creator":"Independent","model":"claude-sonnet-4","capabilities":["UI Design","Prototyping","Generative Design"],"issued_at":"2026-03-17T06:00:00.000Z","cert_version":"1.0","issuer":"trustlog","trustlog_sig":"2626fd7f936f531abf7b82959df72748c0e8b72e32fd8dc47c8461beba27354d"}', genesis_cert_hash = '8f7d2d05d1a96dc459624de66b7386de34b2e35eb01c2f485c442aaf11afe91d', chain_length = 0, chain_head_id = null WHERE id = '10000000-0000-0000-0000-000000000009';
-- ─────────────────────────────────────────────────────────────
-- SEED RECEIPTS FOR ARIA-7 (50 receipts)
-- Generated by scripts/generate-seed-receipts.ts
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Quarterly revenue analysis for Q1 2026', 'data-analysis', '2a17aa6c674351ab91017647e996549a2a29800aacc5efed87a6a8a26d80011b', 'a5c756265ae08d9945754b7776df7e44ca16ffa6be918914ba269eb9954e3c30', 2299, 'success', '9e9be5c428e667d1cc54e6051e92dca890447335070cbd403374a334e939cd44', 'GENESIS', 1, true, 93, now() - interval '49 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Competitive landscape research — AI infrastructure', 'research', 'c84129879d1927fccb75d09ad4915cbb23effdb12646270a3446822e39447fe0', '1e1a7e1d34591f8aa239e7960ba320f6a6cfe23a84f9a2e17be6bd53d951840d', 1514, 'success', '5b6c6051197eb60b5ade10bb0ae38c74305eb97bfee99f5f64aa026a1d9a965e', '9e9be5c428e667d1cc54e6051e92dca890447335070cbd403374a334e939cd44', 2, true, 92, now() - interval '48 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'ETL pipeline optimization script', 'code-generation', 'dc893b50b54a7bec6eefb5eb64cacfb7b8fb49054d8a1fe6af0c926acaf6c857', '401bc4abaa742ad2ea0181924ae9d76cb90d71f84a674ad2d1ed11dbe88146c4', 1907, 'success', '43db1acaf5b16616baa85306e7c358b25ecc12aca7b7285f0fb1b10d5e618328', '5b6c6051197eb60b5ade10bb0ae38c74305eb97bfee99f5f64aa026a1d9a965e', 3, true, 89, now() - interval '47 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Executive summary: market sizing report', 'content-creation', 'af454fe528b1caa036e7dd06d893f6c28812c73c7fcc4e3e693069c2eb978a4e', '68202aed667edb988ff014891a6edc3b80ff1f8cc713305efcda3886b90a005b', 1589, 'success', 'b049739836b64594301dfa6cbafbfde2baa1f4606c9eddbd947856ada539792f', '43db1acaf5b16616baa85306e7c358b25ecc12aca7b7285f0fb1b10d5e618328', 4, true, 88, now() - interval '46 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Automated data quality checks', 'automation', '3e4056e2fdf09cc22b43fc15173d8fdd12c7e4fea60f4adad4a39bd8ea15e6d2', '5e47ec6cf7ca140da7dfda2cdc59b9897d550d43c1f0eec0bf89dc72b89f0921', 2143, 'success', '2e3d7a5a57564426c9a3da84e698801c6a98f19fb0a92a8c720dce7832df559f', 'b049739836b64594301dfa6cbafbfde2baa1f4606c9eddbd947856ada539792f', 5, true, 93, now() - interval '45 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'Cohort analysis: customer retention', 'data-analysis', '07510bfff9a8e174c00062ad0616d30b460d21cd365d5a82b53acb9675dfcb6b', '088cb692b3dff234fbe48d98a774b249ebc022597509e799130f3379287627fc', 2499, 'success', 'd4d329946a4cc139d5668f7bf6906a547322efbd57084dfed348204330e245b1', '2e3d7a5a57564426c9a3da84e698801c6a98f19fb0a92a8c720dce7832df559f', 6, true, 91, now() - interval '44 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Literature review: federated learning', 'research', 'a8322bcee47c6a40098efe96c04315e1f2e64f118055553707f70d2950259a95', '4461df7e884c2b24d44c150c508f52703ae886a2435ea7dacfddc9b54999dd8a', 1565, 'success', 'fc44d94feae09bf250f438ca5b94329e4de95e154c924d43b24a85d9ef978afa', 'd4d329946a4cc139d5668f7bf6906a547322efbd57084dfed348204330e245b1', 7, true, 91, now() - interval '43 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'Financial model: Series B projections', 'data-analysis', '09c6c0953f188f08c7ab9c2f0437ca187be0e4eded6f35370ac3d7c5a7b3f0a5', 'ae55ff66f8d935531d5f10b33ffaf9d5c93a69df41b7914c2af2e604ec1a726b', 1851, 'success', '89db1d9e31b17a2ab81ccdb99498e05e71a2aeaae401bf094fcab5ff5795efc5', 'fc44d94feae09bf250f438ca5b94329e4de95e154c924d43b24a85d9ef978afa', 8, true, 94, now() - interval '42 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'Quarterly revenue analysis for Q1 2026', 'data-analysis', '04419fbf533249f913d2b65102f91d5072a0a066d191f9b2a67ac34115368e11', 'df56f3e1cc296b483a7772c90bfaf5d936c428d80cd5077e85e42f83e6da0332', 2621, 'success', '5f63b78e9facb3def4f10a9195e74f38ca01b0da5b2566e4f3e4a09e4e97d092', '89db1d9e31b17a2ab81ccdb99498e05e71a2aeaae401bf094fcab5ff5795efc5', 9, true, 93, now() - interval '41 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'Competitive landscape research — AI infrastructure', 'research', 'd79765e5f8d5d967629e5a3d372ca1b359c03f436689827ff266cb0673c85295', 'e27a7d802baf7eb696238b32038d10befc96c706557f5f0122842cb3072ebb93', 2796, 'success', 'd1e49c7bd813d697b6929700224db0e5f949ca1e29c76bd462dac293295edc0d', '5f63b78e9facb3def4f10a9195e74f38ca01b0da5b2566e4f3e4a09e4e97d092', 10, true, 93, now() - interval '40 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'ETL pipeline optimization script', 'code-generation', '183fa5ef9a2ab47012ba4c1062194e796b676066ea9060d78f010131340c4619', 'cade19dc570c2a54994d1d6fb85577e7b63057ad6f654a24f913d406df9df4e4', 1469, 'success', 'db30543847bd8b820553fa3ae38f1ef745705cb9939951a5b9c5daa8c0b18746', 'd1e49c7bd813d697b6929700224db0e5f949ca1e29c76bd462dac293295edc0d', 11, true, 93, now() - interval '39 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'Executive summary: market sizing report', 'content-creation', '69afd604df0866ad1fd62b35ce0a923445ee5e1ead61dcfae22f0147c1769b5b', 'e0633dad17e894a23039ced58e1d6d0088e666f4a74285e5d97bf3afe7c6dd43', 1942, 'success', '1bfd8f7dea7019d26e50e43950578cca232273b16cc23708de43b3d1fbe4c30e', 'db30543847bd8b820553fa3ae38f1ef745705cb9939951a5b9c5daa8c0b18746', 12, true, 88, now() - interval '38 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'Automated data quality checks', 'automation', '59a481423cac4572bb8b6a7c86829b8ad3387374ad8592efc2c25b6d4c5fa9f0', '2f105c93b73b4bc44d2fac1f4b929f143027627e6a231f7a20c22e13a0622b89', 988, 'success', '9e1b35acb467c16eef2fdf463d47f44e68fd5af89e0c6087633c5a5b209a6a02', '1bfd8f7dea7019d26e50e43950578cca232273b16cc23708de43b3d1fbe4c30e', 13, true, 87, now() - interval '37 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000001', 'Cohort analysis: customer retention', 'data-analysis', '9b6abb7f951b3bbe6872c1686cb043704ceff95bd42a44fd1b921d0fb206d815', 'c5ae57e7a24903502df07db85571ae9e63623d297c86ed1fa64dd23472232ea9', 1834, 'success', '20f606d5db0511caae3f99bed3d324ecfd2057833c5da91acf1bfabbd2f8be45', '9e1b35acb467c16eef2fdf463d47f44e68fd5af89e0c6087633c5a5b209a6a02', 14, true, 89, now() - interval '36 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', 'Literature review: federated learning', 'research', 'e995b2b6fac10534c00a9c8a2f9e9f673ff2f53d4e0ec0ba839dcb3c9a077fc5', '2e440ee89ff13c7c809ca3d5db8652d8df1e8376251e02deb7af52ccebaaefd6', 1108, 'success', '2ebfcde390bc833d0019c20a3f801653773c4de455ef2b3fad59003bef64eb33', '20f606d5db0511caae3f99bed3d324ecfd2057833c5da91acf1bfabbd2f8be45', 15, true, 98, now() - interval '35 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000001', 'Financial model: Series B projections', 'data-analysis', '51ad2d43782d5fb2b2310b69ba3ae186927dda58f773305a4f081054cdf7235f', '34687c749491e86f064069ce623fc1ab355e61a9ac2e8c879aa06cb8077a4d52', 1664, 'success', 'c7122d2ca7f94663b12f60ba76145a7ac59ab7f187790df124f18b2f55932803', '2ebfcde390bc833d0019c20a3f801653773c4de455ef2b3fad59003bef64eb33', 16, true, 90, now() - interval '34 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000001', 'Quarterly revenue analysis for Q1 2026', 'data-analysis', 'a87cdcd6d1ec9eb3f3043601edd39ae79cbee8d5270929e5bafe668a8130e86a', '58f81669eebcd6dc0c8b858db3101b568e60e90704bc7e1d5888635f370d5e54', 959, 'success', '86943c3afefcb7701aea79ea450148d5d49b07ecfd4d23122ee5fdc95d8f3513', 'c7122d2ca7f94663b12f60ba76145a7ac59ab7f187790df124f18b2f55932803', 17, true, 95, now() - interval '33 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000001', 'Competitive landscape research — AI infrastructure', 'research', '04229843f7b98171273f7a368ae1d1645e917a559f2e32ba02c1ac9b4db8fc86', '8c774c8080373940278b3011aba3252d13a6057be657dc210fa18ce1259d4add', 964, 'success', '3c7f37df4a5e7fca20aa341826429940c6e1e43991298b0c3017a2411bda463f', '86943c3afefcb7701aea79ea450148d5d49b07ecfd4d23122ee5fdc95d8f3513', 18, true, 91, now() - interval '32 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000001', 'ETL pipeline optimization script', 'code-generation', 'eac537f229544d9cbb9200c55326a669b7b4a7b51735d59b4d90fdeeee123d37', '17cd822db0d32710f6f9c69e5d8c48aa358066902446bfa733c2bb6a574b0117', 844, 'success', '6f63d6a63949bbbf0ad0a3b6931cb70ce0a2cc5a96dcd10a1e8bc35f1f9e677c', '3c7f37df4a5e7fca20aa341826429940c6e1e43991298b0c3017a2411bda463f', 19, true, 90, now() - interval '31 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001', 'Executive summary: market sizing report', 'content-creation', '1a4200ed5549fde1c0509f186d08a5fc4be50977293c8f8e6b47e41d85e97a2c', 'b1527045a47ff21698bbb8a7216b7a50dd571938e08346dc45b2a801a8b918ea', 1638, 'success', 'd7842aa0fdafb92c91259f0eeaa80a6630b4007849490f933826f2a3b0fda7a4', '6f63d6a63949bbbf0ad0a3b6931cb70ce0a2cc5a96dcd10a1e8bc35f1f9e677c', 20, true, 91, now() - interval '30 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000001', 'Automated data quality checks', 'automation', '0472f3c0a0a316088f32b015d014e78d45865db0fd56726720ad4f9adfe9e779', '17f42780d5ee19ab43fbdee5523bca4a59d0743635e22e981f72a7bf7e08e55a', 1971, 'success', 'd81911d31360a39602bbc71aa0d0c0e798048e23768cb1a86c367403e7a8f8a6', 'd7842aa0fdafb92c91259f0eeaa80a6630b4007849490f933826f2a3b0fda7a4', 21, true, 96, now() - interval '29 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000001', 'Cohort analysis: customer retention', 'data-analysis', '159bf81629d0287175e6959c91fb6ad6178546f26b9747e64384389af9fd33d2', '63657a715de0f41a4974a44cf3b6f76922c32e299f27aa60dc6cca182a4b204c', 2412, 'success', '14b19f57bc1e0dc8dd95ac1801a5998c0fa5602fcbc844568e9340c37ec33f15', 'd81911d31360a39602bbc71aa0d0c0e798048e23768cb1a86c367403e7a8f8a6', 22, true, 90, now() - interval '28 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000001', 'Literature review: federated learning', 'research', 'da11e4f70827e8a16821956789668e7c098fb10244a39ca322e63557496fe249', 'c01a4aaa8bee839c36cb41205758e1a39461661a9900bcac097ca50c22b98614', 1206, 'partial', 'e363f7983660ef46400c566c8315fd192cad93a62c1cbc5ff6914ef5e51bd289', '14b19f57bc1e0dc8dd95ac1801a5998c0fa5602fcbc844568e9340c37ec33f15', 23, true, 47, now() - interval '27 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000001', 'Financial model: Series B projections', 'data-analysis', '7afefc2a75d6083ab79583e48683965cc04d2a09e8c4e3f55cf1a3c3d34d17fa', '9f8c5985e8612234737c4d496eed700519c2fd6708cd6cff626215f9c5001bab', 1511, 'success', '3d3b28defcdc97572c22157b86dded111d6622f6753d4f95db4402fc5f3514b9', 'e363f7983660ef46400c566c8315fd192cad93a62c1cbc5ff6914ef5e51bd289', 24, true, 98, now() - interval '26 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000001', 'Quarterly revenue analysis for Q1 2026', 'data-analysis', 'acddc5b5d61539e24f7e9c485fa90d39e63bd424d874fd9d7b36363efe3dba13', 'e8467e4429b9f573a0cce3ba9fa54b365868ef3a65ee5259f402d28aeadf18ab', 811, 'success', '201a5d90277884cf329d8e84e3850501f0b7a890e3657383b1631e10c53ad8fe', '3d3b28defcdc97572c22157b86dded111d6622f6753d4f95db4402fc5f3514b9', 25, true, 98, now() - interval '25 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000001', 'Competitive landscape research — AI infrastructure', 'research', '1eb0c49ef724eb45acde74d1665ff352037f6d53ed46f9a9ba3c682ec6582350', 'ecaea08d4c1abbcbecf2c0e3ba6e0cf893c0ca6ec631b19f17ee8155dfbb5b97', 1350, 'success', '3e9d7a1bebf68969cf578a18319093a7f09ead91430f847e5774272fc62ba3b8', '201a5d90277884cf329d8e84e3850501f0b7a890e3657383b1631e10c53ad8fe', 26, true, 91, now() - interval '24 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000001', 'ETL pipeline optimization script', 'code-generation', 'be98aa01483104bc4a9336291df647e5a4fd631f06614b2e498b8dddb4c8a2d8', '569aaf8593988f5d7fa4cff43fd2e1de377e19f8ead34bc81a33e85d4f4de3e8', 2454, 'success', '1eeb77d455352d6debe78b50a87f49dde1915f1111b9a61edff1ae329f346121', '3e9d7a1bebf68969cf578a18319093a7f09ead91430f847e5774272fc62ba3b8', 27, true, 98, now() - interval '23 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000001', 'Executive summary: market sizing report', 'content-creation', 'cdeb7dc2ae88ff11d5cb0bbed2f562ff0f2cf595d9af67b4f23cea2a630f8a03', '0d9b2251591cd7cff2521a6d2cdd717263688865336036443962313d06b6cf52', 2307, 'success', '4741ad3c2d9e09c293af2e224589eef22bc2f3c07097c9c6e2bd14d6e4c6eaa3', '1eeb77d455352d6debe78b50a87f49dde1915f1111b9a61edff1ae329f346121', 28, true, 98, now() - interval '22 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000001', 'Automated data quality checks', 'automation', '1b41fb43b35244fbbab82a64a42d3722d0be533aedbb914099c2c1368db1717c', 'e3573c96a8f1ba3ec3d84d8ff41ad38a75e44829f0a5b040cff22d6bdc567e05', 2276, 'success', '1e524edd2663ee1326b56e0da404b9fe1758ade4d808ce51532555d6fe679611', '4741ad3c2d9e09c293af2e224589eef22bc2f3c07097c9c6e2bd14d6e4c6eaa3', 29, true, 91, now() - interval '21 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000001', 'Cohort analysis: customer retention', 'data-analysis', 'fc986c4ea939d9dca2d3e05e8c48f248320f9509904bc244ac031d1da56a1511', '33c69487a53285ffe81e3de2e5df6da57bf569e1c3e9ecddde65268e6a1b28c8', 2488, 'success', '3b69bd873afa8f1f9d39e81e2a20a06b420c2676acee1e389a8392c395552ec4', '1e524edd2663ee1326b56e0da404b9fe1758ade4d808ce51532555d6fe679611', 30, true, 90, now() - interval '20 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000001', 'Literature review: federated learning', 'research', 'dc05dc609e077dfa1025fa5d2a603cb5e041d9b9607f00f5c883d13a67b9bd8d', 'b770602e95c715d6d138620ffc97915c8ca04ae43c9f2d1396f0114dd0ed373a', 1496, 'success', 'c0e501f1011ab25785d0ed13c1afba74519ddac212d96eeacecb0352d38f391a', '3b69bd873afa8f1f9d39e81e2a20a06b420c2676acee1e389a8392c395552ec4', 31, true, 99, now() - interval '19 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000032', '10000000-0000-0000-0000-000000000001', 'Financial model: Series B projections', 'data-analysis', '03151fe246689dc94fa7baa1abb375d92cda42a3fd869bfb192d4a4e28f43bbe', 'ebdf6bea7a2243d46babb65e7b84d1819758467c4b19af20ef0da370eeb4b49b', 2578, 'success', 'db7b964fdd37d82ed4adecf1890319c05f035c8dcda6e0a4c23fda94ab716508', 'c0e501f1011ab25785d0ed13c1afba74519ddac212d96eeacecb0352d38f391a', 32, true, 87, now() - interval '18 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000033', '10000000-0000-0000-0000-000000000001', 'Quarterly revenue analysis for Q1 2026', 'data-analysis', 'c2c14b500cdd1ce362bf81abdda78f8495d82a633d12f8170adb8b7e09968aaf', '8a07ec127f79eb8c9533fe08c1e3105f662ea1fe9cc97b9cfe417747b988fc1d', 2400, 'success', '6c56e0cec791fffa1976ef3c06018044dda10df77c25a88a941f3fc14a19681e', 'db7b964fdd37d82ed4adecf1890319c05f035c8dcda6e0a4c23fda94ab716508', 33, true, 99, now() - interval '17 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000034', '10000000-0000-0000-0000-000000000001', 'Competitive landscape research — AI infrastructure', 'research', '52d2226320248dbca22ff3c8385ca96c94c50768d0d69d4d5bef241cf51ee36b', 'b4d51544bb1075364dae3dfc3ba1b104ae1082261ac7c96d4f7af34a7d7d19f8', 1476, 'success', 'bb91ce3d68b6c409d17f50f042570873439203ea2dd6eeb37a2f491f614a0ad6', '6c56e0cec791fffa1976ef3c06018044dda10df77c25a88a941f3fc14a19681e', 34, true, 95, now() - interval '16 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000035', '10000000-0000-0000-0000-000000000001', 'ETL pipeline optimization script', 'code-generation', '9dd90e2c7b3cfec88c2f405423b522721844d08d56e312fee8efc70b7245e258', '64fc4c5a20a4224e513e222436e41c7d4d4dd02d9188863574528bf7156745dd', 2054, 'success', '1657daf7a4a0df900a9ac620b13acbb0b0f83f856ac83e7f60bd892ff5253c32', 'bb91ce3d68b6c409d17f50f042570873439203ea2dd6eeb37a2f491f614a0ad6', 35, true, 99, now() - interval '15 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000036', '10000000-0000-0000-0000-000000000001', 'Executive summary: market sizing report', 'content-creation', '95bb1a90b1f4ef3523c424e1351326be90cdcab62cd7c99ae4be6aa235b74894', '67f4c41abcc834b7a31f7ca32c1bc6dfb2082fef9a776d612f5686b87c0563f3', 2104, 'success', '2b9eb28ba1c48ceafa0d20d04de59bbace6b0d98134b07236524e465a7114031', '1657daf7a4a0df900a9ac620b13acbb0b0f83f856ac83e7f60bd892ff5253c32', 36, true, 89, now() - interval '14 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000037', '10000000-0000-0000-0000-000000000001', 'Automated data quality checks', 'automation', '8f3757ad94123d5783476053c63672cc75d4b17b549988b0a229ffa5b4c75a97', 'b52caa4f0b4a23c9abe00cea50f061f7d3ee8b6ae8d0c88447a3c2519a736229', 1971, 'failure', '9faffe45f2d4f46b8ce8b1dedc020b2a0bc2b45b25f6b409a5eac1cfb594f3f4', '2b9eb28ba1c48ceafa0d20d04de59bbace6b0d98134b07236524e465a7114031', 37, true, 41, now() - interval '13 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000038', '10000000-0000-0000-0000-000000000001', 'Cohort analysis: customer retention', 'data-analysis', '0ad544788feaab9ba1c7063253c84e6ed20cdfdc37cfedd3ecaf865daedde2a6', 'ad2e8eec3527d029ced89a140476ea00b81421632647b3caf1dc08a9a5f2a680', 2503, 'success', 'd6ac0c86ddf9575b699a5c7fedd50bd96bace4276bd95dbbb8fd244c2081df48', '9faffe45f2d4f46b8ce8b1dedc020b2a0bc2b45b25f6b409a5eac1cfb594f3f4', 38, true, 85, now() - interval '12 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000039', '10000000-0000-0000-0000-000000000001', 'Literature review: federated learning', 'research', 'dec2491a7fbf0b2a41ce50c055ded1d859898515f93fe90d263b1adc22d51444', '45596935dd2b5c6043d1c7778186a773b841db8cc9693a90f7940ad3b6ef5ff6', 956, 'success', '968eb96b9192392315a4e96606b9f8e0af2aa08d06d384a6d7a33a0d1a2084ba', 'd6ac0c86ddf9575b699a5c7fedd50bd96bace4276bd95dbbb8fd244c2081df48', 39, true, 95, now() - interval '11 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000001', 'Financial model: Series B projections', 'data-analysis', '40f66d1fde26dfaf4b2207215fdc123e85ff692edbdbea5ee3f3d4cafbe6826c', 'ac5a2afd34f662894c103a4623f794cc62857d55a9a6038bf6cad8eeea04680e', 2124, 'success', 'b8c24a8c400bedad50618b2e210afb842495698f4f7b17c1f107327743c511b2', '968eb96b9192392315a4e96606b9f8e0af2aa08d06d384a6d7a33a0d1a2084ba', 40, true, 99, now() - interval '10 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000001', 'Quarterly revenue analysis for Q1 2026', 'data-analysis', '044f4f1325e786d2e6b6d321b7af971659ceeeb1856d108dc12d7d82393d032a', '6c151a19f8864228ff8035301495394c491a8b38e531bbe1eee282417079756e', 2305, 'success', '4dd0a7d3346de6fcfb08e120f0f63c0f4a9e7409fc98a892151d5bfbcce3f169', 'b8c24a8c400bedad50618b2e210afb842495698f4f7b17c1f107327743c511b2', 41, false, null, now() - interval '9 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000001', 'Competitive landscape research — AI infrastructure', 'research', 'c3ef9e68cc72a77cb71ef3cdedde53fe4a703618b2040fcdb250521eb7a4755d', 'dc2f8957dfd0964aefced06d683648948566e5de84ba529ed26817144050f23f', 1270, 'success', '4c1ea7573cc87c751576cea15dd06d90b63ef94c75b51712294241f29208d8c9', '4dd0a7d3346de6fcfb08e120f0f63c0f4a9e7409fc98a892151d5bfbcce3f169', 42, false, null, now() - interval '8 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000043', '10000000-0000-0000-0000-000000000001', 'ETL pipeline optimization script', 'code-generation', '382d64d2445d88303556de9c4329e1a0450fbe8a80ed44e6ab24712f7a224e44', 'b82d1350f4f61d920fe55711af59ce9b3a1bcee06829afc0ebf4324c7edf26ce', 1491, 'success', '70c1cb76addef2f9c109f65712679a3ba53c47bcbf86308ec1fadd0efc2f13b0', '4c1ea7573cc87c751576cea15dd06d90b63ef94c75b51712294241f29208d8c9', 43, false, null, now() - interval '7 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000044', '10000000-0000-0000-0000-000000000001', 'Executive summary: market sizing report', 'content-creation', 'e3bfdeb4bbc0c6cea62cb64d98b0f2d7542618beb093c546fcdadf4251981f77', 'a692f07f1e923d275bc170bba27387844995ebcbe1f89783f0479d218bf91fd6', 914, 'success', '92263ec0b16e70ff6508e49b7565c9bc209fd77cad86d553c53e533e7d51e6bb', '70c1cb76addef2f9c109f65712679a3ba53c47bcbf86308ec1fadd0efc2f13b0', 44, false, null, now() - interval '6 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000045', '10000000-0000-0000-0000-000000000001', 'Automated data quality checks', 'automation', 'be4163ebb67b5578cc82626957325e8f76406ad2475c0b8544360f707556365c', '3b38804d0f58935056f42a1e065061dae44c1998169ef0eedf7f700c693c59b3', 2208, 'success', 'c1465edd7ee1f404dab3a70d79a9895b53e279d9df5d012c6f1516a3c13776c8', '92263ec0b16e70ff6508e49b7565c9bc209fd77cad86d553c53e533e7d51e6bb', 45, false, null, now() - interval '5 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000046', '10000000-0000-0000-0000-000000000001', 'Cohort analysis: customer retention', 'data-analysis', '21346b955af512b4e1c82da6912b8dc216cacb46fac75c93eb81c7e6461b96fd', 'c45ad75ac15d60608b442f3a05a11ffa706323ded0431129b64a3ee9d6829c9e', 930, 'success', '1d3dc0d176826c96332fe518ab788b11bdb05af8630b66dc61f109b3050ef8bc', 'c1465edd7ee1f404dab3a70d79a9895b53e279d9df5d012c6f1516a3c13776c8', 46, false, null, now() - interval '4 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000047', '10000000-0000-0000-0000-000000000001', 'Literature review: federated learning', 'research', '41d4983c8f47e25bdfb4172c510e3982853dc6b844645e487a215513e71a35db', '552b48530cfe605efadd17bee8afd6e8e029e461101b22e0cddeeccc55766123', 1618, 'success', '7f50a95f9e114e53cb1accd396fad2579a38a0b9af904e4d1d8b73bd0a424316', '1d3dc0d176826c96332fe518ab788b11bdb05af8630b66dc61f109b3050ef8bc', 47, false, null, now() - interval '3 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000048', '10000000-0000-0000-0000-000000000001', 'Financial model: Series B projections', 'data-analysis', '9e1badaa312279115cd8417e1caeb1f28236190886cca1d44e26b7ac2d4d9ee0', 'd84499a4f2c7ffe2b1ea64b38c23ee382d62fa3372ce29fe625832df4c9e197a', 1442, 'success', '1c15ef51db5b21566185fd1a2ffa53e12648870cc72e737796717371ac501ab8', '7f50a95f9e114e53cb1accd396fad2579a38a0b9af904e4d1d8b73bd0a424316', 48, false, null, now() - interval '2 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000049', '10000000-0000-0000-0000-000000000001', 'Quarterly revenue analysis for Q1 2026', 'data-analysis', 'dbd8b57d7ed0633bb73a4a53c1721c9556fd78e6bffa582ed9ac30d08b2f34b7', '91fc206f1b5a41711d30ebab0fca88b250eebb055199c8cefd14acb4f491bed8', 1238, 'success', '55aff63dd171dc28857d8deaeab8d08a66914c0609f54e314a792a04a4208f87', '1c15ef51db5b21566185fd1a2ffa53e12648870cc72e737796717371ac501ab8', 49, false, null, now() - interval '1 hours');
INSERT INTO public.task_receipts (id, agent_id, task_description, category, input_hash, output_hash, duration_ms, status, chain_hash, prev_chain_hash, chain_position, oracle_verified, oracle_score, created_at) VALUES ('20000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000001', 'Competitive landscape research — AI infrastructure', 'research', 'f095cdb2d990782145e2cd91cedbdda270f162404b203fd5846c4c826eb88c04', 'b5deacd8d1d0fb83c164c168ff7493c5ec12f613d227b6a1418f6976f0af9bec', 1101, 'success', '5573977b56a15739c92f74616164a60494e8fdc28e1912987a9655d35929c933', '55aff63dd171dc28857d8deaeab8d08a66914c0609f54e314a792a04a4208f87', 50, false, null, now() - interval '0 hours');

UPDATE public.agents SET chain_head_id = '20000000-0000-0000-0000-000000000050', chain_length = 50 WHERE id = '10000000-0000-0000-0000-000000000001';

insert into public.revocations (
  agent_id,
  reason,
  evidence,
  severity,
  revoked_at,
  appeal_status
) values (
  '10000000-0000-0000-0000-000000000010',
  'Systematic fabrication of output hashes across 23 consecutive task receipts. Oracle variance scores averaged 0.89 — far above the 0.30 flagging threshold.',
  '{"oracle_jobs": 23, "avg_variance": 0.89, "flag_count": 23, "detection_method": "Trust Oracle variance scoring"}',
  'CRITICAL',
  '2026-03-01T00:00:00Z',
  'none'
);