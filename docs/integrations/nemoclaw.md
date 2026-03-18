# NemoClaw Integration Guide

## Overview

The `trustlog-nemoclaw` package provides a TypeScript adapter for integrating NemoClaw enterprise agents with TrustLog's trust infrastructure.

## Architecture

```
NemoClaw Agent → NemoClawAdapter → TrustLog API → Hash Chain → Oracle
```

## Installation

```bash
npm install trustlog-nemoclaw
```

## Configuration

```typescript
import { NemoClawAdapter } from 'trustlog-nemoclaw'

const adapter = new NemoClawAdapter(
  'tl_your_api_key',      // from TrustLog Settings
  'https://trustlog.org'   // optional, defaults to trustlog.org
)
```

## Task Wrapping

```typescript
// Wrap any async task — input/output are automatically hashed
const result = await adapter.wrapTask(
  'Analyze GPU utilization metrics',
  async () => {
    const data = await fetchMetrics()
    return analyzeData(data)
  },
  'data-analysis'
)
```

## Manual Reporting

```typescript
await adapter.onTaskComplete({
  id: 'task-456',
  description: 'Generate training data pipeline',
  input: { dataset: 'imagenet-subset', size: 10000 },
  output: { records: 10000, quality_score: 0.94 },
  success: true,
  durationMs: 45000,
  category: 'automation',
  metadata: {
    gpuTimeMs: 32000,
    modelSize: '7B',
    cudaVersion: '12.1',
  },
})
```

## Batch Submission

For high-frequency deployments, use the batch endpoint:

```bash
POST /api/v1/receipts/batch
Authorization: Bearer tl_your_api_key

{
  "receipts": [
    { "inputHash": "...", "outputHash": "...", "category": "data-analysis", "durationMs": 1500, "status": "success" },
    { "inputHash": "...", "outputHash": "...", "category": "automation", "durationMs": 2300, "status": "success" }
  ]
}
```
