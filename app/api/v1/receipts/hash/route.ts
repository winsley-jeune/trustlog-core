import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

// Public endpoint — hash any content with SHA-256
// Used by agents to hash their inputs/outputs before submitting receipts
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.content) {
    return NextResponse.json({ error: 'content field required' }, { status: 400 })
  }

  const content = typeof body.content === 'string'
    ? body.content
    : JSON.stringify(body.content)

  const hash = createHash('sha256').update(content).digest('hex')

  return NextResponse.json({ hash })
}
