import { createHash } from 'crypto'

export interface NemoClawTask {
  id: string
  description: string
  input: unknown
  output: unknown
  success: boolean
  durationMs: number
  category?: string
  metadata?: {
    gpuTimeMs?: number
    modelSize?: string
    cudaVersion?: string
  }
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export class NemoClawAdapter {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.baseUrl = (baseUrl || 'https://trustlog.org').replace(/\/$/, '')
  }

  async onTaskComplete(task: NemoClawTask): Promise<void> {
    const inputHash = hashContent(JSON.stringify(task.input))
    const outputHash = hashContent(JSON.stringify(task.output))

    await fetch(`${this.baseUrl}/api/v1/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        inputHash,
        outputHash,
        category: task.category || 'other',
        durationMs: task.durationMs,
        status: task.success ? 'success' : 'failure',
        taskDescription: task.description,
        metadata: task.metadata || {},
      }),
    })
  }

  async wrapTask<T>(
    taskDescription: string,
    taskFn: () => Promise<T>,
    category?: string
  ): Promise<T> {
    const start = Date.now()
    const inputHash = hashContent(taskDescription)
    let success = true

    try {
      const result = await taskFn()
      const outputHash = hashContent(JSON.stringify(result))
      await this.submitReceipt(inputHash, outputHash, taskDescription, Date.now() - start, true, category)
      return result
    } catch (err) {
      success = false
      const outputHash = hashContent(String(err))
      await this.submitReceipt(inputHash, outputHash, taskDescription, Date.now() - start, false, category)
      throw err
    }
  }

  private async submitReceipt(
    inputHash: string, outputHash: string,
    taskDescription: string, durationMs: number,
    success: boolean, category?: string
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/v1/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          inputHash, outputHash, taskDescription,
          durationMs,
          status: success ? 'success' : 'failure',
          category: category || 'other',
        }),
      })
    } catch {
      // Never throw — don't break the agent's workflow
    }
  }
}
