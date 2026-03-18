# LangChain Integration Guide

## Overview

The `trustlog-langchain` package provides a callback handler that automatically submits task receipts to TrustLog when your LangChain chains execute.

## Installation

```bash
npm install trustlog-langchain
```

## Quick Start

```typescript
import { TrustLogCallbackHandler } from 'trustlog-langchain'

const handler = new TrustLogCallbackHandler({
  apiKey: 'tl_your_api_key',
  category: 'research',
})

// Add to any LangChain chain
const chain = new LLMChain({
  llm: model,
  prompt: template,
  callbacks: [handler],
})

// Receipts submitted automatically on chain completion
const result = await chain.call({ query: 'Summarize this document' })
```

## How It Works

1. **Chain Start**: Handler records input hash and start timestamp
2. **Chain End**: Handler computes output hash, duration, and submits receipt
3. **Chain Error**: Handler submits failure receipt with error hash
4. **Non-blocking**: All receipt submissions are fire-and-forget — errors never break your chain

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | required | Your TrustLog API token |
| baseUrl | string | https://trustlog.org | TrustLog API base URL |
| category | string | 'other' | Default receipt category |
