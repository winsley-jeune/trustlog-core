// Shared TypeScript types used across the entire app.
// Defining them once here means if the database schema changes,
// we update one file and TypeScript shows us every broken reference.

export type CertLevel =
  'UNVERIFIED' | 'COMMUNITY' | 'VERIFIED' | 'AUDITED' | 'SOVEREIGN'

export type AgentStatus = 'active' | 'flagged' | 'probation' | 'revoked'

export type Agent = {
  id: string
  profile_id: string
  name: string
  tagline: string | null
  avatar: string | null
  color: string | null
  model: string | null
  creator: string | null
  bio: string | null
  open_to_work: boolean
  cert_level: CertLevel
  trust_score: number
  specializations: string[]
  tools: string[]
  status: AgentStatus
  created_at: string
  updated_at: string
  // Phase 2 fields
  genesis_cert: Record<string, unknown> | null
  genesis_cert_hash: string | null
  public_key: string | null
  chain_head_id: string | null
  chain_length: number
  // Joined from agent_stats table
  agent_stats?: {
    completed: number
    success_rate: number
    efficiency: number
    avg_duration: number
    oracle_verified_count: number
    oracle_pass_rate: number
  } | null
}

export type Profile = {
  id: string
  type: 'human' | 'agent'
  name: string
  email: string | null
  created_at: string
}

export type ReceiptCategory =
  | 'data-analysis' | 'code-generation' | 'content-creation'
  | 'research' | 'automation' | 'security' | 'orchestration' | 'other'

export type ReceiptStatus = 'success' | 'failure' | 'partial'

export type TaskReceipt = {
  id: string
  agent_id: string
  task_description: string | null
  category: ReceiptCategory
  input_hash: string
  output_hash: string
  duration_ms: number
  status: ReceiptStatus
  chain_hash: string
  prev_chain_hash: string | null
  chain_position: number
  oracle_verified: boolean
  oracle_score: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export type TrustScoreHistory = {
  id: string
  agent_id: string
  score: number
  reason: string
  created_at: string
}

// Phase 3 types

export type OracleJobStatus = 'pending' | 'running' | 'passed' | 'warned' | 'flagged' | 'error'
export type OracleVerdict = 'PASS' | 'WARN' | 'FLAG'

export type OracleJob = {
  id: string
  receipt_id: string
  agent_id: string
  status: OracleJobStatus
  rerun_output: string | null
  rerun_hash: string | null
  variance_score: number | null
  verdict: OracleVerdict | null
  oracle_node_id: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  created_at: string
}

export type FlagSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type FlagStatus = 'open' | 'resolved' | 'escalated'

export type Flag = {
  id: string
  agent_id: string
  oracle_job_id: string
  severity: FlagSeverity
  reason: string
  status: FlagStatus
  resolved_at: string | null
  created_at: string
}

export type AppealStatus = 'pending' | 'granted' | 'denied'

export type Revocation = {
  id: string
  agent_id: string
  reason: string
  severity: string
  revoked_at: string
  appeal_status: AppealStatus
}

export type Appeal = {
  id: string
  revocation_id: string
  agent_id: string
  reason: string
  status: AppealStatus
  reviewed_at: string | null
  created_at: string
}

export type CouncilMember = {
  id: string
  name: string
  organization: string
  joined_at: string
  active: boolean
}

export type Milestone = {
  id: string
  agent_id: string
  type: string
  featured: boolean
  achieved_at: string
}

export type HireStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type HirePriority = 'low' | 'medium' | 'high' | 'critical'

export type Hire = {
  id: string
  hirer_id: string
  hiree_id: string
  task_description: string
  priority: HirePriority
  token_budget: number | null
  status: HireStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}

// API response types

export type ChainStatus = {
  chainLength: number
  chainIntact: boolean
  headHash: string | null
  lastReceiptAt: string | null
}

export type ChainVerification = {
  agent: {
    id: string
    name: string
    certLevel: CertLevel
    trustScore: number
    status: AgentStatus
  }
  chain: ChainStatus
  cert: {
    hasCert: boolean
    certHash: string | null
    issuedAt: string | null
  }
  verified: boolean
}

export type ScoreHistoryResponse = {
  currentScore: number
  history: TrustScoreHistory[]
}
