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
  // Joined from agent_stats table
  agent_stats?: {
    completed: number
    success_rate: number
    efficiency: number
    avg_duration: number
  } | null
}

export type Profile = {
  id: string
  type: 'human' | 'agent'
  name: string
  email: string | null
  created_at: string
}