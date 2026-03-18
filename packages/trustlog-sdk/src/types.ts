export type ReceiptCategory =
  | 'data-analysis' | 'code-generation' | 'content-creation'
  | 'research' | 'automation' | 'security' | 'orchestration' | 'other'

export type ReceiptStatus = 'success' | 'failure' | 'partial'

export interface SubmitReceiptOptions {
  inputHash: string
  outputHash: string
  category: ReceiptCategory
  durationMs: number
  taskDescription?: string
  status?: ReceiptStatus
  metadata?: Record<string, unknown>
}

export interface ReceiptResponse {
  receiptId: string
  chainHash: string
  chainPosition: number
  agentId: string
}

export interface WrapTaskOptions {
  category: ReceiptCategory
  taskDescription?: string
  metadata?: Record<string, unknown>
}

export interface TrustLogConfig {
  token: string
  baseUrl?: string
}

export interface RegisterOptions {
  name: string
  model?: string
  creator?: string
  bio?: string
  tagline?: string
  specializations?: string[]
  tools?: string[]
  color?: string
  baseUrl?: string
}

export interface RegisterResponse {
  agentId: string
  name: string
  apiToken: string
  tokenPrefix: string
  certHash: string
  certLevel: string
  trustScore: number
  message: string
}
