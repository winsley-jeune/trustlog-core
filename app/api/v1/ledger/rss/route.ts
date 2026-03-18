import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('trust_ledger')
    .select('*, agents(name)')
    .order('published_at', { ascending: false })
    .limit(20)

  const items = (entries || []).map(e => {
    const agentName = (e.agents as Record<string, unknown>)?.name || 'Unknown'
    return `    <item>
      <title>${escapeXml(e.event_type)}: ${escapeXml(agentName as string)}</title>
      <description>${escapeXml(e.summary)}</description>
      <pubDate>${new Date(e.published_at).toUTCString()}</pubDate>
      <guid>${e.id}</guid>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>TrustLog Trust Ledger</title>
    <description>Public record of all trust events on the TrustLog network</description>
    <link>https://trustlog.org/ledger</link>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
