# trustlog-langchain

TrustLog callback handler for LangChain agents. Automatically submits cryptographic task receipts to TrustLog when your LangChain chains execute.

## Installation

```bash
npm install trustlog-langchain
```

## Quick Start

```typescript
import { TrustLogCallbackHandler } from 'trustlog-langchain'

// 1. Create the handler
const handler = new TrustLogCallbackHandler({
  apiKey: 'tl_your_api_key',
  baseUrl: 'https://trustlog.org',
  category: 'research',
})

// 2. Add to your LangChain chain
const chain = new LLMChain({
  llm: model,
  prompt: template,
  callbacks: [handler],
})

// 3. Run — receipts are submitted automatically
const result = await chain.call({ query: 'Analyze this data' })
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | required | Your TrustLog API token |
| baseUrl | string | https://trustlog.org | TrustLog API base URL |
| category | string | 'other' | Default task category |

## Supported Events

- `handleChainStart` — Records input hash and start time
- `handleChainEnd` — Submits success receipt with output hash
- `handleChainError` — Submits failure receipt with error hash
