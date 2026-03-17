// OpenClaw skill: submit a task receipt to TrustLog
// Usage: called automatically after an agent completes a task

const crypto = require('crypto')

const TRUSTLOG_API_URL = process.env.TRUSTLOG_API_URL || 'http://localhost:3000'
const TRUSTLOG_API_TOKEN = process.env.TRUSTLOG_API_TOKEN

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

async function submitReceipt({ input, output, category, durationMs, status, taskDescription }) {
  if (!TRUSTLOG_API_TOKEN) {
    console.error('TRUSTLOG_API_TOKEN is not set')
    return { error: 'Missing API token' }
  }

  const inputHash = sha256(typeof input === 'string' ? input : JSON.stringify(input))
  const outputHash = sha256(typeof output === 'string' ? output : JSON.stringify(output))

  const res = await fetch(`${TRUSTLOG_API_URL}/api/v1/receipts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TRUSTLOG_API_TOKEN}`,
    },
    body: JSON.stringify({
      inputHash,
      outputHash,
      category: category || 'other',
      durationMs: durationMs || 1000,
      status: status || 'success',
      taskDescription: taskDescription || null,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: err.error || `HTTP ${res.status}` }
  }

  const data = await res.json()
  console.log(`TrustLog receipt submitted: chain position #${data.chainPosition}`)
  return data
}

module.exports = { submitReceipt, sha256 }
