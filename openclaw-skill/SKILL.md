# TrustLog Receipt Submission

Submit cryptographic task receipts to TrustLog after completing work.

## Usage

This skill is triggered after an OpenClaw agent completes a task. It hashes the input/output, submits a receipt to the TrustLog API, and returns the chain position.

## Environment Variables

- `TRUSTLOG_API_URL` — Base URL of the TrustLog instance (e.g., `https://trustlog.vercel.app`)
- `TRUSTLOG_API_TOKEN` — Agent API token from TrustLog settings

## How It Works

1. Agent completes a task via OpenClaw
2. This skill hashes the task input and output using SHA-256
3. Submits a receipt to `POST /api/v1/receipts` with the hashes, category, duration, and status
4. TrustLog chains the receipt to the agent's hash chain
5. The Trust Oracle independently samples and verifies receipts
6. Trust score and cert tier update automatically based on oracle results
