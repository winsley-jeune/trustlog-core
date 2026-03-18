import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { publishLedgerEvent } from '@/lib/ledger'

const STUBS = [
  { source: 'github', external_id: 'gh-001', name: 'CodeReview-Agent', creator_org: 'DevTools Inc', description: 'Automated code review agent for pull requests', url: 'https://github.com/devtools/code-review-agent', color: '#6366f1' },
  { source: 'github', external_id: 'gh-002', name: 'DataPipeline-Bot', creator_org: 'DataFlow Labs', description: 'ETL pipeline automation and data quality monitoring', url: 'https://github.com/dataflow/pipeline-bot', color: '#8b5cf6' },
  { source: 'github', external_id: 'gh-003', name: 'SecurityScanner-AI', creator_org: 'SecureOps', description: 'Automated vulnerability scanning and remediation', url: 'https://github.com/secureops/scanner', color: '#ef4444' },
  { source: 'github', external_id: 'gh-004', name: 'DocWriter-Pro', creator_org: 'TechDocs', description: 'Technical documentation generation from codebases', url: 'https://github.com/techdocs/writer', color: '#3b82f6' },
  { source: 'github', external_id: 'gh-005', name: 'TestGen-AI', creator_org: 'QualityFirst', description: 'Automated test case generation for TypeScript projects', url: 'https://github.com/qualityfirst/testgen', color: '#22c55e' },
  { source: 'github', external_id: 'gh-006', name: 'InfraBot-3000', creator_org: 'CloudOps', description: 'Infrastructure provisioning and cost optimization', url: 'https://github.com/cloudops/infrabot', color: '#f59e0b' },
  { source: 'github', external_id: 'gh-007', name: 'SupportAgent-v2', creator_org: 'HelpDesk AI', description: 'Tier-1 customer support with escalation routing', url: 'https://github.com/helpdesk/support-v2', color: '#ec4899' },
  { source: 'github', external_id: 'gh-008', name: 'ResearchBot-Alpha', creator_org: 'Academic AI', description: 'Literature review and citation management', url: 'https://github.com/academicai/researchbot', color: '#14b8a6' },
  { source: 'huggingface', external_id: 'hf-001', name: 'NLP-Analyzer-7B', creator_org: 'ML Research Co', description: 'Fine-tuned sentiment analysis and entity extraction', url: 'https://huggingface.co/mlresearch/nlp-analyzer', color: '#f97316' },
  { source: 'huggingface', external_id: 'hf-002', name: 'TranslationAgent-Multi', creator_org: 'LinguaAI', description: '47-language translation with cultural context', url: 'https://huggingface.co/linguaai/translation', color: '#a855f7' },
  { source: 'huggingface', external_id: 'hf-003', name: 'ImageDescriptor-Pro', creator_org: 'VisionLabs', description: 'Detailed image description for accessibility', url: 'https://huggingface.co/visionlabs/descriptor', color: '#06b6d4' },
  { source: 'huggingface', external_id: 'hf-004', name: 'FinancialAnalyst-AI', creator_org: 'QuantFin', description: 'Financial report analysis and forecasting', url: 'https://huggingface.co/quantfin/analyst', color: '#84cc16' },
  { source: 'huggingface', external_id: 'hf-005', name: 'MedicalCoder-v3', creator_org: 'HealthTech AI', description: 'ICD-10 medical coding and claim validation', url: 'https://huggingface.co/healthtech/coder', color: '#f43f5e' },
  { source: 'huggingface', external_id: 'hf-006', name: 'LegalReview-Agent', creator_org: 'LexAI', description: 'Contract review and clause risk flagging', url: 'https://huggingface.co/lexai/legal-review', color: '#0ea5e9' },
  { source: 'huggingface', external_id: 'hf-007', name: 'ContentModerator-Safe', creator_org: 'SafeWeb Inc', description: 'Multi-modal content moderation at scale', url: 'https://huggingface.co/safeweb/moderator', color: '#d946ef' },
  { source: 'openclaw', external_id: 'oc-001', name: 'SchedulerAgent', creator_org: 'AutomateHQ', description: 'Calendar management and meeting optimization', url: null, color: '#10b981' },
  { source: 'openclaw', external_id: 'oc-002', name: 'EmailDrafter-AI', creator_org: 'ProComm', description: 'Context-aware email drafting and follow-up', url: null, color: '#f59e0b' },
  { source: 'openclaw', external_id: 'oc-003', name: 'SlackOps-Bot', creator_org: 'TeamFlow', description: 'Slack workspace automation and digest generation', url: null, color: '#8b5cf6' },
  { source: 'openclaw', external_id: 'oc-004', name: 'BudgetTracker-AI', creator_org: 'FinOps', description: 'Expense tracking and budget variance analysis', url: null, color: '#22c55e' },
  { source: 'openclaw', external_id: 'oc-005', name: 'ProjectPM-Agent', creator_org: 'AgileAI', description: 'Sprint planning and velocity tracking automation', url: null, color: '#3b82f6' },
]

export async function POST() {
  const supabase = createServiceClient()
  const results: string[] = []

  for (let i = 0; i < STUBS.length; i++) {
    const stub = STUBS[i]
    const idx = String(i + 1).padStart(2, '0')
    const profileId = `30000000-0000-0000-0001-0000000000${idx}`
    const agentId = `30000000-0000-0000-0000-0000000000${idx}`

    // Create profile
    await supabase.from('profiles').upsert({
      id: profileId,
      type: 'agent',
      name: stub.name,
    }, { onConflict: 'id' })

    // Create agent
    await supabase.from('agents').upsert({
      id: agentId,
      profile_id: profileId,
      name: stub.name,
      tagline: stub.description,
      model: 'various',
      creator: stub.creator_org,
      bio: stub.description,
      cert_level: 'UNVERIFIED',
      trust_score: 50,
      color: stub.color,
      specializations: [],
      tools: [],
      open_to_work: false,
      status: 'active',
      source: stub.source,
    }, { onConflict: 'id' })

    // Create agent_stats
    await supabase.from('agent_stats').upsert({
      agent_id: agentId,
      completed: 0,
      success_rate: 0,
      efficiency: 0,
      avg_duration: 0,
      oracle_verified_count: 0,
      oracle_pass_rate: 0,
    }, { onConflict: 'agent_id' })

    // Create discovery record
    await supabase.from('agent_discovery').upsert({
      source: stub.source,
      external_id: stub.external_id,
      name: stub.name,
      creator_org: stub.creator_org,
      description: stub.description,
      url: stub.url,
      status: 'stub',
      agent_id: agentId,
    }, { onConflict: 'source,external_id' })

    // Publish to ledger
    await publishLedgerEvent('agent_registered', agentId, `${stub.name} discovered from ${stub.source}`, {
      source: stub.source,
      externalId: stub.external_id,
    }).catch(() => {})

    results.push(stub.name)
  }

  return NextResponse.json({ created: results.length, agents: results })
}
