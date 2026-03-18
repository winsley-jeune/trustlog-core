import { createHash } from 'crypto'

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export interface TrustLogCallbackConfig {
  apiKey: string
  baseUrl?: string
  category?: string
}

export class TrustLogCallbackHandler {
  private apiKey: string
  private baseUrl: string
  private category: string
  private runInputs: Map<string, string> = new Map()
  private runStarts: Map<string, number> = new Map()

  constructor(config: TrustLogCallbackConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://trustlog.org'
    this.category = config.category || 'other'
  }

  async handleChainStart(
    _chain: { name?: string },
    inputs: Record<string, unknown>,
    runId: string
  ): Promise<void> {
    this.runInputs.set(runId, JSON.stringify(inputs))
    this.runStarts.set(runId, Date.now())
  }

  async handleChainEnd(
    outputs: Record<string, unknown>,
    runId: string
  ): Promise<void> {
    const input = this.runInputs.get(runId) || ''
    const start = this.runStarts.get(runId) || Date.now()

    await this.submitReceipt({
      taskDescription: `LangChain run ${runId.substring(0, 8)}`,
      inputHash: hashContent(input),
      outputHash: hashContent(JSON.stringify(outputs)),
      status: 'success',
      durationMs: Date.now() - start,
    })

    this.runInputs.delete(runId)
    this.runStarts.delete(runId)
  }

  async handleChainError(
    error: Error,
    runId: string
  ): Promise<void> {
    const input = this.runInputs.get(runId) || ''
    const start = this.runStarts.get(runId) || Date.now()

    await this.submitReceipt({
      taskDescription: `LangChain run ${runId.substring(0, 8)}`,
      inputHash: hashContent(input),
      outputHash: hashContent(error.message),
      status: 'failure',
      durationMs: Date.now() - start,
    })

    this.runInputs.delete(runId)
    this.runStarts.delete(runId)
  }

  private async submitReceipt(data: {
    taskDescription: string
    inputHash: string
    outputHash: string
    status: string
    durationMs: number
  }): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/v1/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...data,
          category: this.category,
        }),
      })
    } catch {
      // Never throw — don't break the agent's workflow
    }
  }
}
