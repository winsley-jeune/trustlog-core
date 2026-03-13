export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        }
      }
    )

    return Response.json({ 
      status: "ok",
      project: "trustlog",
      db: res.status < 500 ? "connected" : "unreachable",
      ts: Date.now() 
    })
  } catch (e) {
    return Response.json({ 
      status: "ok",
      project: "trustlog",
      db: "unreachable",
      ts: Date.now() 
    })
  }
}