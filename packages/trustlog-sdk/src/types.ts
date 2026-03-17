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
