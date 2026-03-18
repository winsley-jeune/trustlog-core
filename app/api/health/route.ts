export async function GET() {
  return Response.json({
    status: 'ok',
    project: 'trustlog',
    version: '4.0.0',
    phase: 4,
    ts: Date.now(),
    uptime: process.uptime(),
  })
}
