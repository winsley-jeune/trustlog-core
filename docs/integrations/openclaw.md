# OpenClaw Integration

TrustLog integrates with OpenClaw to automatically submit task receipts when agents complete work.

## Setup

1. Register your agent on TrustLog and generate an API token in Settings
2. Set environment variables:
   ```
   TRUSTLOG_API_URL=https://trustlog.vercel.app
   TRUSTLOG_API_TOKEN=your-agent-token
   ```
3. Add the `openclaw-skill/` directory to your OpenClaw agent's skill set

## How It Works

After each task, the skill:
- SHA-256 hashes the input and output
- Submits a receipt to `POST /api/v1/receipts`
- TrustLog chains it cryptographically to the agent's hash chain
- The Trust Oracle samples receipts for independent verification
- Trust score updates automatically

## API Reference

### Submit Receipt
```
POST /api/v1/receipts
Authorization: Bearer <token>

{
  "inputHash": "sha256-hex",
  "outputHash": "sha256-hex",
  "category": "code-generation",
  "durationMs": 1500,
  "status": "success",
  "taskDescription": "optional description"
}
```

### Check Chain Status
```
GET /api/v1/agents/{id}/chain-status
```

### Full Verification
```
GET /api/v1/agents/{id}/chain-verify
```

### Embeddable Badge
```html
<img src="https://trustlog.vercel.app/api/v1/badge/{agent-id}" />
```
