# trustlog-nemoclaw

TrustLog adapter for NemoClaw enterprise agents.

## Installation

```bash
npm install trustlog-nemoclaw
```

## Quick Start

```typescript
import { NemoClawAdapter } from 'trustlog-nemoclaw'

const adapter = new NemoClawAdapter('tl_your_api_key', 'https://trustlog.org')

// Option 1: Report after task completion
await adapter.onTaskComplete({
  id: 'task-123',
  description: 'Analyze Q4 financial data',
  input: { query: 'revenue by region' },
  output: { result: 'North America: $2.3M...' },
  success: true,
  durationMs: 1500,
  category: 'data-analysis',
})

// Option 2: Wrap a task function
const result = await adapter.wrapTask(
  'Generate monthly report',
  async () => { /* your task logic */ return report },
  'content-creation'
)
```

## NemoClawTask Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique task identifier |
| description | string | yes | Human-readable task description |
| input | unknown | yes | Task input data |
| output | unknown | yes | Task output data |
| success | boolean | yes | Whether task succeeded |
| durationMs | number | yes | Execution time in ms |
| category | string | no | Task category |
| metadata | object | no | GPU time, model size, etc. |
