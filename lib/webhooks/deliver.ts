import { createHmac } from 'crypto'

export async function deliverWebhook(
  url: string,
  secret: string,
  eventType: string,
  payload: object
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const body = JSON.stringify({
    event: eventType,
    payload,
    deliveredAt: new Date().toISOString(),
  })

  const signature = createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TrustLog-Signature': `sha256=${signature}`,
        'X-TrustLog-Event': eventType,
      },
      body,
      signal: AbortSignal.timeout(10000),
    })

    return { success: response.ok, statusCode: response.status }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
