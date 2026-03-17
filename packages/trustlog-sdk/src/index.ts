import { createHash } from 'crypto'
import type {
  TrustLogConfig,
  SubmitReceiptOptions,
  ReceiptResponse,
  WrapTaskOptions,
} from './types'

export type { TrustLogConfig, SubmitReceiptOptions, ReceiptResponse, WrapTaskOptions } from './types'
export type { ReceiptCategory, ReceiptStatus } from './types'

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export class TrustLogClient {
  private token: string
  private baseUrl: string

  constructor(config: TrustLogConfig) {
    this.token = config.token
    this.baseUrl = (config.baseUrl || 'http://localhost:3000').replace(/\/$/, '')
  }

  async submitReceipt(options: SubmitReceiptOptions): Promise<ReceiptResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(options),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`TrustLog API error (${res.status}): ${err.error}`)
    }

    return res.json()
  }

  // Wraps a task function — hashes input/output and submits a receipt
  async wrapTask<TInput, TOutput>(
    input: TInput,
    taskFn: (input: TInput) => Promise<TOutput>,
    options: WrapTaskOptions
  ): Promise<{ output: TOutput; receipt: ReceiptResponse }> {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input)
    const inputHash = hashContent(inputStr)
    const start = Date.now()

    let output: TOutput
    let status: 'success' | 'failure' = 'success'

    try {
      output = await taskFn(input)
    } catch (err) {
      status = 'failure'
      const outputHash = hashContent(String(err))
      const receipt = await this.submitReceipt({
        inputHash,
        outputHash,
        category: options.category,
        durationMs: Date.now() - start,
        taskDescription: options.taskDescription,
        status,
        metadata: options.metadata,
      })
      throw Object.assign(err as Error, { receipt })
    }

    const outputStr = typeof output === 'string' ? output : JSON.stringify(output)
    const outputHash = hashContent(outputStr)

    const receipt = await this.submitReceipt({
      inputHash,
      outputHash,
      category: options.category,
      durationMs: Date.now() - start,
      taskDescription: options.taskDescription,
      status,
      metadata: options.metadata,
    })

    return { output, receipt }
  }
}
